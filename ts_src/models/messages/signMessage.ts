export interface SignMessage {
  readonly contractId: string
  /// The set of adaptor signatures from the offer party.
  readonly cetAdaptorSignatures: {
    ecdsaAdaptorSignatures: {
      signature: string
    }[]
  }
  readonly refundSignature: string
  readonly fundingSignatures: {
    fundingSignatures: FundingSignature[]
  }
}

export interface FundingSignature {
  witnessElements: WitnessElement[]
}

export interface WitnessElement {
  witness: string
}
