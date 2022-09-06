import { ContractState } from './contract'
import { PartyParams } from '../partyParams'
import { OfferedContract } from './offeredContract'
import { StatelessContract } from './statelessContract'
import { FundingInput } from '../messages/offerMessage'
import { OutcomeInfo } from '../../utils/outcomeInfo'
import { AcceptMessage } from '../messages'

export interface AcceptedContract extends StatelessContract<OfferedContract> {
  readonly id: string
  readonly state: ContractState.Accepted
  readonly acceptParams: PartyParams
  // The funding inputs provided by the accepting party.
  readonly acceptFundingInputsInfo: ReadonlyArray<FundingInput>
  // The signature for the refund transaction from the accepting party.
  readonly acceptRefundSignature: string
  // The bitcoin set of bitcoin transactions for the contract.
  readonly dlcTransactions: DlcTransactions
  //
  readonly outcomeInfo: OutcomeInfo
  //
  readonly acceptAdaptorSignatures: string[]
}

export interface DlcTransactions {
  fund: string
  cets: string[]
  refund: string
  fundOutputIndex: number
  fundScriptPubkey: string
}

export function toAcceptMessage(
  acceptedContract: AcceptedContract
): AcceptMessage {
  const acceptParams = acceptedContract.acceptParams
  return {
    protocolVersion: 1,
    temporaryContractId: acceptedContract.temporaryContractId,
    acceptCollateral: acceptParams.collateral,
    fundingPubkey: acceptParams.fundPubkey,
    payoutSpk: acceptParams.payoutScriptPubkey,
    payoutSerialId: acceptParams.payoutSerialId,
    fundingInputs: acceptedContract.acceptFundingInputsInfo.slice(),
    changeSpk: acceptParams.changeScriptPubkey,
    changeSerialId: acceptParams.changeSerialId,
    cetAdaptorSignatures: {
      ecdsaAdaptorSignatures: acceptedContract.acceptAdaptorSignatures.map(
        (x) => {
          return { signature: x }
        }
      ),
    },
    refundSignature: acceptedContract.acceptRefundSignature,
  }
}
export function computeContractId(
  fundTxIdRaw: string,
  fundOuputIndex: number,
  temporaryContractIdRaw: string
): string {
  const fundTxId = Buffer.from(fundTxIdRaw, 'hex')
  const temporaryContractId = Buffer.from(temporaryContractIdRaw, 'hex')
  const res = Buffer.alloc(32)
  for (let i = 0; i < 32; i++) {
    res[i] = fundTxId[i] ^ temporaryContractId[i]
  }
  res[30] ^= (fundOuputIndex >> 8) & 0xff
  res[31] ^= fundOuputIndex & 0xff
  return res.toString('hex')
}
