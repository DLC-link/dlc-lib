import { Network, Transaction } from 'bitcoinjs-lib'
import { Utxo } from '../models/utxo'

// Interface providing wallet functionalities
export interface Signer {
  // Returns a DER encoded signature for the specified input using the private
  // key associated with the given public key.
  getDerTxSignatureFromPubkey(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    pubkey: string,
    outputScript: string
  ): Promise<string>
  // Creates a signature for the given input and fills the transaction input witness.
  signP2WPKHTxInput(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    inputAddress: string
  ): Promise<void>
}
