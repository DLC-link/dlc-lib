//TODO(tibo): change this
const CET_BASE_WEIGHT = 500
const FUND_TX_BASE_WEIGHT = 214
const TX_INPUT_BASE_WEIGHT = 164
const P2WPKH_WITNESS_SIZE = 107

export function getOwnFee(feeRate: number, nbInputs: number): number {
  const baseFee = (CET_BASE_WEIGHT + FUND_TX_BASE_WEIGHT) / 2

  // Assume two inputs
  let ownFee = baseFee + (TX_INPUT_BASE_WEIGHT + P2WPKH_WITNESS_SIZE) * nbInputs
  // Change and payout spk * 4 for size to weight
  ownFee += 20 * 4 * 2

  return Math.ceil(ownFee * feeRate)
}
