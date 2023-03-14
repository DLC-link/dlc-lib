import { DlcError } from '../../errors/dlcError'
import { RangeOutcome as RangePayout } from '../rangeOutcome'

export interface PayoutPoint {
  eventOutcome: number
  outcomePayout: number
  extraPrecision: number
}

export interface PayoutFunction {
  readonly payoutFunctionPieces: PayoutFunctionPiece[]
  readonly lastEndpoint: PayoutPoint
}

export interface PayoutFunctionPiece {
  readonly endPoint: PayoutPoint
  payoutCurvePiece: PayoutCurvePiece
}

export type PayoutCurvePiece = PolynomialPayoutCurvePiece

export interface PolynomialPayoutCurvePiece {
  readonly payoutPoints: PayoutPoint[]
}

export interface RoundingIntervals {
  readonly intervals: RoundingInterval[]
}

export interface RoundingInterval {
  readonly beginInterval: number
  readonly roundingMod: number
}

// Returns the `RangePayout`s for the given payout function.
export function payoutFunctionToRangePayout(
  payoutFunction: PayoutFunction,
  totalCollateral: number,
  roundingIntervals: RoundingIntervals
): RangePayout[] {
  console.log('Payout Function: ', payoutFunction)
  console.log('Total Collateral: ', totalCollateral)
  console.log('Rounding Intervals: ', roundingIntervals)
  const rangePayouts: RangePayout[] = []
  const nbPieces = payoutFunction.payoutFunctionPieces.length
  for (let i = 0; i < payoutFunction.payoutFunctionPieces.length; i++) {
    // We transform so that we end up with a set of points that have both
    // correct left and right ends.
    const piece = payoutFunction.payoutFunctionPieces[i]
    console.log('Piece: ', piece)

    const lastPoint =
      i == nbPieces - 1
        ? payoutFunction.lastEndpoint
        : payoutFunction.payoutFunctionPieces[i + 1].endPoint

    const payoutPoints = [
      piece.endPoint,
      ...piece.payoutCurvePiece.payoutPoints,
      lastPoint,
    ]

    polynomialToRangePayouts(
      payoutPoints,
      totalCollateral,
      rangePayouts,
      roundingIntervals
    )
  }

  return rangePayouts
}

export function polynomialToRangePayouts(
  payoutPoints: PayoutPoint[],
  totalCollateral: number,
  rangePayouts: RangePayout[],
  roundingIntervals: RoundingIntervals
) {
  if (
    payoutPoints.length == 2 &&
    payoutPoints[0].outcomePayout == payoutPoints[1].outcomePayout
  ) {
    const curRange = getCurrentRange(
      payoutPoints,
      rangePayouts,
      totalCollateral,
      roundingIntervals
    )
    curRange.count +=
      payoutPoints[1].eventOutcome - payoutPoints[0].eventOutcome
    rangePayouts.push(curRange)
  } else {
    computeRangePayouts(
      payoutPoints,
      roundingIntervals,
      totalCollateral,
      rangePayouts
    )
  }
}

function computeRangePayouts(
  payoutPoints: PayoutPoint[],
  roundingIntervals: RoundingIntervals,
  totalCollateral: number,
  rangePayouts: RangePayout[]
) {
  const firstOutcome = payoutPoints[0].eventOutcome
  const lastOutcome = payoutPoints[payoutPoints.length - 1].eventOutcome
  let curRange = getCurrentRange(
    payoutPoints,
    rangePayouts,
    totalCollateral,
    roundingIntervals
  )

  const rangeEnd = lastOutcome + 1

  for (let outcome = firstOutcome + 1; outcome < rangeEnd; outcome++) {
    const payout = getRoundedPayout(payoutPoints, outcome, roundingIntervals)
    if (payout > totalCollateral) {
      throw new DlcError('Computed payout is greater than total collateral.')
    }
    if (curRange.payout.offer == payout) {
      curRange.count += 1
    } else {
      rangePayouts.push(curRange)
      curRange = {
        start: outcome,
        count: 1,
        payout: {
          offer: payout,
          accept: totalCollateral - payout,
        },
      }
    }
  }

  rangePayouts.push(curRange)
}

// Returns the last RangePayout, or generate the first one if none.
function getCurrentRange(
  payoutPoints: PayoutPoint[],
  rangePayouts: RangePayout[],
  totalCollateral: number,
  roundingIntervals: RoundingIntervals
): RangePayout {
  const last = rangePayouts.pop()
  if (last !== undefined) {
    return last
  }

  const firstOutcome = payoutPoints[0].eventOutcome
  const firstPayout = getRoundedPayout(
    payoutPoints,
    firstOutcome,
    roundingIntervals
  )
  return {
    start: firstOutcome,
    count: 1,
    payout: {
      offer: firstPayout,
      accept: totalCollateral - firstPayout,
    },
  }
}

// Get the payout associated with the given outcome for the
function getRoundedPayout(
  payoutPoints: PayoutPoint[],
  outcome: number,
  roundingIntervals: RoundingIntervals
): number {
  const payout = evaluate(payoutPoints, outcome)
  if (payout < 0 || isNaN(payout)) {
    throw new DlcError('Could not compute payout for given curve')
  }

  return round(roundingIntervals, outcome, payout)
}

export function evaluate(payoutPoints: PayoutPoint[], outcome: number): number {
  const nbPoints = payoutPoints.length

  if (nbPoints == 2) {
    const leftPoint = payoutPoints[0]
    const rightPoint = payoutPoints[1]
    if (payoutPoints[0].outcomePayout == payoutPoints[1].outcomePayout) {
      return payoutPoints[0].outcomePayout
    }

    const slope =
      (rightPoint.outcomePayout - leftPoint.outcomePayout) /
      (rightPoint.eventOutcome - leftPoint.eventOutcome)
    return (outcome - leftPoint.eventOutcome) * slope + leftPoint.outcomePayout
  }

  let result = 0

  for (let i = 0; i < nbPoints; i++) {
    let l = getOutcomePayout(payoutPoints[i])
    for (let j = 0; j < nbPoints; j++) {
      if (i != j) {
        const iOutcome = payoutPoints[i].eventOutcome
        const jOutcome = payoutPoints[j].eventOutcome
        const denominator = iOutcome - jOutcome
        const numerator = outcome - jOutcome
        l *= numerator / denominator
      }
    }
    result += l
  }

  return result
}

function getOutcomePayout(payoutPoint: PayoutPoint): number {
  return payoutPoint.outcomePayout + payoutPoint.extraPrecision / (1 << 16)
}

function round(
  roundingIntervals: RoundingIntervals,
  outcome: number,
  payout: number
): number {
  let roundingInterval = roundingIntervals.intervals[0]
  for (const interval of roundingIntervals.intervals) {
    if (interval.beginInterval <= outcome) {
      roundingInterval = interval
    } else {
      break
    }
  }

  let m = 0

  if (payout >= 0) {
    m = payout % roundingInterval.roundingMod
  } else {
    m = (payout % roundingInterval.roundingMod) + roundingInterval.roundingMod
  }

  if (m >= roundingInterval.roundingMod / 2) {
    return Math.round(payout + roundingInterval.roundingMod - m)
  } else {
    return Math.round(payout - m)
  }
}
