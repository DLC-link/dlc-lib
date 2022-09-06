import { Utxo } from '../models/utxo'

// Interface providing methods to query the blockchain.
export interface Blockchain {
  getTransaction(txid: string): Promise<string>
  sendRawTransaction(txHex: string): Promise<void>
  getUtxosForAddress(address: string): Promise<Utxo[]>
  isOutputSpent(txid: string, vout: number): Promise<boolean>
}
