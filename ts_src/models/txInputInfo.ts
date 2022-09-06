import { TxInInfoRequest } from '../cfd-dlc-js-wasm'

export interface TxInputInfo {
  readonly outpoint: OutPoint
  readonly maxWitnessLen: number
  readonly redeemScript: string
  readonly serialId: number
  readonly amount: number
  readonly address?: string
}

export interface OutPoint {
  readonly txid: string
  readonly vout: number
}

export function txInputInfoToTxInInfoRequest(
  input: TxInputInfo
): TxInInfoRequest {
  return {
    txid: input.outpoint.txid,
    vout: input.outpoint.vout,
    maxWitnessLength: input.maxWitnessLen,
    serialId: BigInt(input.serialId.toString()),
  }
}
