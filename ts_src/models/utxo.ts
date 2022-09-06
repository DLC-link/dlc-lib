export interface Utxo {
  readonly txid: string
  readonly vout: number
  readonly amount: number
  readonly address: string
  readonly maxWitnessLength: number
  readonly redeemScript: string
  readonly reserved: boolean
}
