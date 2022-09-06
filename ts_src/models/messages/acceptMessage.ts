import { FundingInput } from './offerMessage'

export interface AcceptMessage {
  readonly protocolVersion: 1
  readonly temporaryContractId: string
  readonly acceptCollateral: number
  readonly fundingPubkey: string
  readonly payoutSpk: string
  readonly payoutSerialId: number
  /// Inputs used by the accept party to fund the contract.
  readonly fundingInputs: FundingInput[]
  /// The SPK where the accept party will receive their change.
  readonly changeSpk: string
  /// Serial id to order funding transaction outputs.
  readonly changeSerialId: number
  /// The set of adaptor signatures from the accept party.
  readonly cetAdaptorSignatures: {
    ecdsaAdaptorSignatures: {
      signature: string
    }[]
  }
  /// The refund signature of the accept party.
  readonly refundSignature: string
}
