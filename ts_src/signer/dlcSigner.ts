import ECPairFactory from 'ecpair'
import { payments, script, Transaction } from 'bitcoinjs-lib'
import { signature } from 'bitcoinjs-lib/src/script'
import { UnexpectedError } from '../errors/unexpectedError'
import { Signer } from '../interfaces/signer'
import * as tinysecp256k1 from 'tiny-secp256k1'

const ECPair = ECPairFactory(tinysecp256k1)

export class DlcSigner implements Signer {
  constructor() {}

  async signP2WPKHTxInput(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    btcPrivateKey: string
  ): Promise<void> {
    const ecpair = ECPair.fromPrivateKey(Buffer.from(btcPrivateKey, 'hex'))
    const outputScript = payments.p2pkh({ pubkey: ecpair.publicKey }).output

    if (!outputScript) {
      throw new UnexpectedError()
    }

    const hash = tx.hashForWitnessV0(
      inputIndex,
      outputScript,
      inputAmount,
      0x01
    )
    const signature = ecpair.sign(hash, true)
    tx.ins[inputIndex].witness = [
      script.signature.encode(signature, 0x01),
      ecpair.publicKey,
    ]
  }

  async getDerTxSignatureFromPubkey(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    outputScript: string,
    btcPrivateKey: string,
  ): Promise<string> {
    const hash = tx.hashForWitnessV0(
      inputIndex,
      Buffer.from(outputScript, 'hex'),
      inputAmount,
      0x01
    )
    console.log('getDerTxSignatureFromPubkey/hash: ', hash)
    console.log('btcPrivateKey: ', btcPrivateKey)
    console.log('bufferedBtcPrivateKey: ', Buffer.from(btcPrivateKey, 'hex'))
    console.log('btcPrivateKey length: ', btcPrivateKey.length)
    const ecpair = ECPair.fromPrivateKey(Buffer.from(btcPrivateKey, 'hex'))
    console.log('getDerTxSignatureFromPubkey/ecpair: ', ecpair)
    const buf = ecpair.sign(hash, true)
    console.log('getDerTxSignatureFromPubkey/buf: ', buf)
    const der = signature.encode(buf, 1)
    console.log('getDerTxSignatureFromPubkey/der: ', der)
    const derString = der.toString('hex')
    console.log('getDerTxSignatureFromPubkey/derString: ', derString)
    return derString.substring(0, derString.length - 2)
  }
}