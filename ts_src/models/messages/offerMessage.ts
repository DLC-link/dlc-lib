import { ContractInfo } from './contract'

export interface FundingInput {
  /// Serial id used for input ordering in the funding transaction.
  readonly inputSerialId: number
  /// The previous transaction used by the associated input in serialized format.
  readonly prevTx: string
  /// The vout of the output used by the associated input.
  readonly prevTxVout: number
  /// The sequence number to use for the input.
  readonly sequence: number
  /// The maximum witness length that can be used to spend the previous UTXO.
  readonly maxWitnessLen: number
  /// The redeem script of the previous UTXO.
  readonly redeemScript: string
}

/// Contains information about a party wishing to enter into a DLC with
/// another party. The contained information is sufficient for any other party
/// to create a set of transactions representing the contract and its terms.
export interface OfferMessage {
  /// The version of the protocol used by the peer.
  readonly protocolVersion: 1
  /// Feature flags to be used for the offered contract.
  readonly contractFlags: number
  /// The identifier of the chain on which the contract will be settled.
  readonly chainHash: string
  /// Temporary contract id to identify the contract.
  readonly temporaryContractId: string
  /// Information about the contract event, payouts and oracles.
  readonly contractInfo: ContractInfo
  /// The public key of the offerer to be used to lock the collateral.
  readonly fundingPubkey: string
  /// The SPK where the offerer will receive their payout.
  readonly payoutSpk: string
  /// Serial id to order CET outputs.
  readonly payoutSerialId: number
  /// Collateral of the offer party.
  readonly offerCollateral: number
  /// Inputs used by the offer party to fund the contract.
  readonly fundingInputs: FundingInput[]
  /// The SPK where the offer party will receive their change.
  readonly changeSpk: string
  /// Serial id to order funding transaction outputs.
  readonly changeSerialId: number
  /// Serial id to order funding transaction outputs.
  readonly fundOutputSerialId: number
  /// The fee rate to use to compute transaction fees for this contract.
  readonly feeRatePerVb: number
  /// The lock time for the CETs.
  readonly cetLocktime: number
  /// The lock time for the refund transactions.
  readonly refundLocktime: number
}

const subKeysList = [
  { key: 'contractInfo', subKey: 'singleContractInfo' },
  { key: 'contractDescriptor', subKey: 'enumeratedContractDescriptor' },
  { key: 'contractDescriptor', subKey: 'numericOutcomeContractDescriptor' },
  { key: 'oracleInfo', subKey: 'single' },
  { key: 'eventDescriptor', subKey: 'enumEvent' },
  { key: 'eventDescriptor', subKey: 'digitDecompositionEvent' },
  { key: 'payoutCurvePiece', subKey: 'polynomialPayoutCurvePiece' },
]

function excludeSubKeys(key: string, value: any) {
  if (key === 'payouts' && Array.isArray(value)) {
    return value.map(function (x) {
      return {
        outcome: x.outcome,
        offerPayout: x.offerPayout,
      }
    })
  }
  // if ((key.includes('serialId') || key.includes('SerialId')) && typeof value == 'number') return value.toString()
  const subKey = subKeysList.find((x) => x.key === key && x.subKey in value)
  if (subKey) {
    return value[subKey.subKey]
  }
  return value
}

export function offerMessageFromJson(jsonInput: string): OfferMessage {
  return JSON.parse(jsonInput, excludeSubKeys)
}
