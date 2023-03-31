import { Utxo } from '../models/utxo'
import { NetworkType } from '../types/networkTypes'
// Interface providing methods to query the blockchain.
export interface Blockchain {
  getTransaction(txid: string, network: NetworkType): Promise<string>
  sendRawTransaction(txHex: string, network: NetworkType): Promise<void>
  getUtxosForAddress(address: string, network: NetworkType): Promise<Utxo[]>
}
