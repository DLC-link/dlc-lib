export class SerialIdOrderer {
  readonly serialIds: bigint[]
  constructor(serialIds: number[]) {
    this.serialIds = serialIds.map(numberToBigInt).sort((a, b) => {
      if (a > b) return 1
      if (a < b) return -1
      return 0
    })
  }

  getIndexForId(serialId: number): number {
    return this.serialIds.indexOf(numberToBigInt(serialId))
  }
}

function numberToBigInt(number: number): bigint {
  return BigInt(number.toString())
}
