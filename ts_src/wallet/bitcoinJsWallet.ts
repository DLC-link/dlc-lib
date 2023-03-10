import ECPairFactory from 'ecpair'
import { Network, payments, script, Transaction } from 'bitcoinjs-lib'
import { Utxo } from '../models/utxo'
import { signature } from 'bitcoinjs-lib/src/script'
import { DlcError } from '../errors/dlcError'
import coinselect from 'coinselect'
import { UnexpectedError } from '../errors/unexpectedError'
import { Blockchain } from '../interfaces/blockchain'
import { Wallet } from '../interfaces/wallet'
import { WalletStorage } from '../interfaces/repository'
import * as tinysecp256k1 from 'tiny-secp256k1'

const ECPair = ECPairFactory(tinysecp256k1)

export class BitcoinJSWallet implements Wallet {
  constructor(
    readonly storage: WalletStorage,
    readonly network: Network,
    readonly blockchain: Blockchain
  ) {}
  getNetwork(): Network {
    return this.network
  }

  async getNewAddress(): Promise<string> {
    // Ideally this should not use `makeRandom` but should derive new private
    // keys from user provided seed (generated outside of the browser). Derivation
    // would ideally be done using BIP32.
    const ecpair = ECPair.makeRandom()
    const { address } = payments.p2wpkh({
      pubkey: ecpair.publicKey,
      network: this.network,
    })

    if (!address || !ecpair.privateKey) {
      throw new UnexpectedError()
    }

    await this.storage.upsertAddress(address, ecpair.privateKey.toString('hex'))
    return address
  }

  async getNewPublicKey(): Promise<string> {
    const ecpair = ECPair.makeRandom()
    const pubkey = ecpair.publicKey.toString('hex')

    if (!ecpair.privateKey) {
      throw new UnexpectedError()
    }

    await this.storage.upsertKeyPair(pubkey, ecpair.privateKey.toString('hex'))
    return pubkey
  }

  async getPrivateKeyForPublicKey(publicKey: string): Promise<string> {
    const privkey = await this.storage.getPrivKeyForPubkey(publicKey)
    return privkey
  }

  async getUtxosForAmount(
    amount: number,
    feeRatePerVByte: number
  ): Promise<Utxo[]> {
    const address = await this.getNewAddress();
    const utxos = await this.blockchain.getUtxosForAddress(address)
    
    console.log(
      'dlc-lib/bitcoinJsWallet.ts/getUtxosForAmount/this.storage.getUtxos | UTXOs: ',
      utxos
    )

    const { inputs } = coinselect(
      utxos.map((x) => {
        return { ...x, value: x.amount }
      }),
      [{ value: amount }],
      feeRatePerVByte
    )

    if (!inputs || inputs.length == 0) {
      throw new DlcError('Not enough UTXOs for amount.')
    }

    const outUtxos: Utxo[] = []

    for (const input of inputs) {
      const i = utxos.findIndex((x) => x.amount == input.value)
      outUtxos.push({
        ...utxos.splice(i, 1)[0],
        reserved: true,
      })
    }

    return outUtxos
  }

  async signP2WPKHTxInput(
    tx: Transaction,
    inputIndex: number,
    inputAmount: number,
    inputAddress: string
  ): Promise<void> {
    const privkey = await this.storage.getPrivKeyForAddress(inputAddress)
    const ecpair = ECPair.fromPrivateKey(Buffer.from(privkey, 'hex'))
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
    pubkey: string,
    outputScript: string
  ): Promise<string> {
    const hash = tx.hashForWitnessV0(
      inputIndex,
      Buffer.from(outputScript, 'hex'),
      inputAmount,
      0x01
    )
    const privkey = await this.storage.getPrivKeyForPubkey(pubkey)
    const ecpair = ECPair.fromPrivateKey(Buffer.from(privkey, 'hex'))
    const buf = ecpair.sign(hash, true)
    const der = signature.encode(buf, 1)
    const derString = der.toString('hex')
    return derString.substring(0, derString.length - 2)
  }

  async unreserveUtxo(txid: string, vout: number): Promise<void> {
    return this.storage.unreserveUtxo(txid, vout)
  }

  async periodicChecks() {
    const utxos = await this.storage.getUtxos()

    for (const utxo of utxos) {
      const isSpent = await this.blockchain.isOutputSpent(utxo.txid, utxo.vout)
      if (isSpent) {
        await this.storage.deleteUtxo(utxo)
      }
    }

    const addresses = await this.storage.getAddresses()
    const allUtxos: Utxo[] = []

    for (const address of addresses) {
      const utxos = await this.blockchain.getUtxosForAddress(address)
      allUtxos.push(...utxos)
    }

    for (const utxo of allUtxos) {
      await this.storage.upsertUtxo(utxo)
    }
  }

  async getBalance(): Promise<number> {
    await this.periodicChecks()
    return (await this.storage.getUtxos())
      .filter((x) => !x.reserved)
      .map((x) => x.amount)
      .reduce((a, b) => a + b, 0)
  }
}
