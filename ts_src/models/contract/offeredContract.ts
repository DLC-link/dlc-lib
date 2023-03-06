import { ContractState } from './contract'
import { OfferMessage } from '../messages'
import { ContractInfo } from '../messages/contract'
import { PartyParams } from '../partyParams'
import { FundingInput } from '../messages/offerMessage'
import { TxInputInfo } from '../txInputInfo'
import { Transaction } from 'bitcoinjs-lib'
import { StatelessContract } from './statelessContract'
import { BaseContract } from './baseContract'

export interface OfferedContract extends StatelessContract<BaseContract> {
  readonly state: ContractState.Offered
  readonly contractInfo: ContractInfo
  readonly offerParams: PartyParams
  readonly offerFundingInputsInfo: ReadonlyArray<FundingInput>
  readonly fundOutputSerialId: number
  readonly feeRatePerVByte: number
  readonly contractMaturityBound: number
  readonly contractTimeOut: number
  readonly isOfferParty: false
}

export function fromOfferMessage(offerMessage: OfferMessage): OfferedContract {
  const contractMaturityBound = offerMessage.cetLocktime
  const inputs: TxInputInfo[] = []
  let inputAmount = 0
  for (const input of offerMessage.fundingInputs) {
    const prevTx = Transaction.fromHex(input.prevTx)
    inputs.push({
      outpoint: {
        txid: prevTx.getId(),
        vout: input.prevTxVout,
      },
      maxWitnessLen: input.maxWitnessLen,
      redeemScript: input.redeemScript,
      serialId: input.inputSerialId,
      amount: prevTx.outs[input.prevTxVout].value,
    })
    inputAmount += prevTx.outs[input.prevTxVout].value
  }

  return {
    state: ContractState.Offered,
    temporaryContractId: offerMessage.temporaryContractId,
    contractInfo: offerMessage.contractInfo,
    offerParams: {
      fundPubkey: offerMessage.fundingPubkey,
      changeScriptPubkey: offerMessage.changeSpk,
      changeSerialId: offerMessage.changeSerialId,
      payoutScriptPubkey: offerMessage.payoutSpk,
      payoutSerialId: offerMessage.payoutSerialId,
      inputs,
      inputAmount,
      collateral: offerMessage.offerCollateral,
    },
    offerFundingInputsInfo: offerMessage.fundingInputs,
    fundOutputSerialId: offerMessage.fundOutputSerialId,
    feeRatePerVByte: offerMessage.feeRatePerVb,
    contractMaturityBound,
    contractTimeOut: offerMessage.refundLocktime,
    isOfferParty: false,
  }
}
