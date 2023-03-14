import { Network, Transaction } from 'bitcoinjs-lib'
import { DlcError } from '../errors/dlcError'
import { ContractRepository } from '../interfaces/repository'
import {
  AnyContract,
  BroadcastContract,
  OfferedContract,
  RejectedContract,
  SignedContract,
} from '../models/contract'
import { AcceptedContract } from '../models/contract/acceptedContract'
import { ContractState } from '../models/contract/contract'
import { fromOfferMessage } from '../models/contract/offeredContract'
import { OfferMessage, SignMessage } from '../models/messages'
import { ContractUpdater, verifyContractSignatures } from './contractUpdater'

export class DlcManager {
  private readonly _contractUpdater: ContractUpdater
  private readonly _dlcRepository: ContractRepository

  constructor(
    contractUpdated: ContractUpdater,
    dlcRepository: ContractRepository
  ) {
    this._contractUpdater = contractUpdated
    this._dlcRepository = dlcRepository
  }

  async onOfferMessage(offerMessage: OfferMessage): Promise<OfferedContract> {
    const contract: OfferedContract = fromOfferMessage(offerMessage)
    await this._dlcRepository.createContract(contract)

    return contract
  }

  async acceptOffer(
    contractId: string,
    btcAddress: string,
    btcPublicKey: string,
    btcPrivateKey: string,
    btcNetwork: Network
  ): Promise<AcceptedContract> {
    const offeredContract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Offered,
    ])) as OfferedContract

    const acceptedContract = await this._contractUpdater.toAcceptContract(
      offeredContract,
      btcAddress,
      btcPublicKey,
      btcPrivateKey,
      btcNetwork
    )

    await this._dlcRepository.updateContract(acceptedContract)

    return acceptedContract
  }

  async onSignMessage(signMessage: SignMessage): Promise<BroadcastContract> {
    const contract = (await this.tryGetContractOrThrow(signMessage.contractId, [
      ContractState.Accepted,
    ])) as AcceptedContract

    const signedContract = await this._contractUpdater.toSignedContract(
      contract,
      signMessage.refundSignature,
      signMessage.cetAdaptorSignatures.ecdsaAdaptorSignatures.map(
        (x) => x.signature
      ),
      signMessage.fundingSignatures.fundingSignatures
    )

    const fundTx = Transaction.fromHex(signedContract.dlcTransactions.fund)
    const fundOutputValue =
      fundTx.outs[signedContract.dlcTransactions.fundOutputIndex].value

    if (!verifyContractSignatures(signedContract, fundOutputValue)) {
      await this.handleInvalidContract(signedContract, 'Invalid signatures')
    }

    const broadcastContract = await this._contractUpdater.toBroadcast(
      signedContract
    )

    await this._dlcRepository.updateContract(broadcastContract)

    return broadcastContract
  }

  private async tryGetContractOrThrow(
    contractId: string,
    expectedStates: ContractState[] = []
  ): Promise<AnyContract> {
    const contract = await this._dlcRepository.getContract(contractId)

    if (expectedStates.length > 0 && !expectedStates.includes(contract.state)) {
      throw new DlcError(
        `Invalid contract expected one of ${expectedStates} but got ${contract.state}`
      )
    }

    return contract
  }

  async onRejectContract(contractId: string): Promise<RejectedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Offered,
    ])) as OfferedContract
    const rejectedContract: RejectedContract = {
      ...contract,
      state: ContractState.Rejected,
    }
    await this._dlcRepository.updateContract(rejectedContract)

    return rejectedContract
  }

  private async handleInvalidContract(
    contract: OfferedContract | AcceptedContract | SignedContract,
    reason: string
  ): Promise<never> {
    const rejectedContract = await this._contractUpdater.toRejectedContract(
      contract,
      reason
    )
    await this._dlcRepository.updateContract(rejectedContract)
    throw new DlcError(`Contract was rejected: ${reason}`)
  }
}
