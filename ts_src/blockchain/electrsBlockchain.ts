import { Blockchain } from '../interfaces/blockchain'
import { Utxo } from '../models/utxo'

export class ElectrsBlockchain implements Blockchain {
  constructor(private readonly baseUrl: string) {}

  private getUrl(subUrl: string): string {
    if (this.baseUrl.endsWith('/')) {
      return this.baseUrl + subUrl
    }
    return this.baseUrl + '/' + subUrl
  }

  async getTransaction(txid: string): Promise<string> {
    const url = this.getUrl(`tx/${txid}/hex`)
    const resp = await fetch(url)
    if (resp.status == 200) {
      return resp.text()
    }

    throw new Error('Could not get transaction')
  }

  async sendRawTransaction(txHex: string): Promise<void> {
    const url = this.getUrl('tx')
    await fetch(url, {
      method: 'post',
      body: txHex,
      headers: { ContentType: 'text/plain' },
    })
  }

  async getUtxosForAddress(address: string): Promise<Utxo[]> {
    const url = this.getUrl(`address/${address}/utxo`)
    const utxoResp = await fetch(url)
    if (utxoResp.status == 200) {
      const data = (await utxoResp.json()) as UtxoResp[]
      return data.map((x) => {
        return {
          txid: x.txid,
          vout: x.vout,
          amount: x.value,
          reserved: false,
          address,
          // For both fields under assumes all addresses are P2WPKH, since we
          // generate them it's ok
          redeemScript: '',
          maxWitnessLength: 107,
        }
      })
    }
    throw new Error('Could not get Utxos for address')
  }

  async isOutputSpent(txid: string, vout: number): Promise<boolean> {
    const url = this.getUrl(`tx/${txid}/outspend/${vout}`)
    const spentResp = await fetch(url)
    if (spentResp.status == 200) {
      const data = (await spentResp.json()) as SpendResp
      return data.status
    }

    throw new Error('Could not get output status')
  }
}

interface UtxoResp {
  txid: string
  vout: number
  value: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: number
    block_time: number
  }
}

interface SpendResp {
  status: boolean
}
