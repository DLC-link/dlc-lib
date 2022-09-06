import { TxInputInfo } from './txInputInfo'

export interface PartyParams {
  readonly fundPubkey: string
  readonly changeScriptPubkey: string
  readonly changeSerialId: number
  readonly payoutScriptPubkey: string
  readonly payoutSerialId: number
  readonly inputs: TxInputInfo[]
  readonly inputAmount: number
  readonly collateral: number
}
