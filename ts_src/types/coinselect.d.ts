declare module 'coinselect' {
  function coinselect(
    utxos: Utxo[],
    targets: Target[],
    feeRate: number
  ): { inputs?: Utxo[]; outputs?: Target[]; fee: number }

  interface Utxo {
    txid: string
    vout: number
    value: number
  }

  interface Target {
    address?: string
    value: number
  }

  export = coinselect
}
