import { Network, Transaction } from 'bitcoinjs-lib'
import { Utxo } from '../models/utxo'

// Interface providing wallet functionalities
export interface Wallet {
  // Generates a new address for receiving a payment
  getNewAddress(): Promise<string>
  // Generates a new key pair to use for a DLC.
  getNewPublicKey(): Promise<string>
  // Get the private key associated with the given public key.
  getPrivateKeyForPublicKey(publicKey: string): Promise<string>
  // Get a set of utxos whose total value is at least `amount`. Throws if such
  // a set cannot be found. If successful, the utxos are marked as reserved.
  getUtxosForAmount(amount: number, feeRatePerVByte: number): Promise<Utxo[]>
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
  // Unreserves a Utxo that was previsously marked as reserved.
  unreserveUtxo(txid: string, vout: number): Promise<void>
  // Returns the network targeted by the wallet
  getNetwork(): Network
}
