import { Transaction } from 'bitcoinjs-lib'

// Interface providing signing functionalities
export interface Signer {
  // Returns a DER encoded signature for the specified input using the private
  // key associated with the given public key.
  getDerTxSignatureFromPrivateKey(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    outputScript: string,
    btcPrivateKey: string
  ): Promise<string>
  // Creates a signature for the given input and fills the transaction input witness.
  signP2WPKHTxInput(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    btcPrivateKey: string
  ): Promise<void>
}
