import {
  PolynomialPayoutCurvePiece,
  evaluate,
  RoundingIntervals,
  polynomialToRangePayouts,
} from '../payoutFunction'
import { RangeOutcome } from '../rangeOutcome'

describe('payout curve tests', () => {
  it('should perform lagrange interpolation properly', () => {
    const polynomial = [
      {
        eventOutcome: 0,
        outcomePayout: 1,
        extraPrecision: 0,
      },
      {
        eventOutcome: 2,
        outcomePayout: 5,
        extraPrecision: 0,
      },
      {
        eventOutcome: 4,
        outcomePayout: 17,
        extraPrecision: 0,
      },
    ]
    expect(evaluate(polynomial, 10)).toEqual(101)
    expect(evaluate(polynomial, 100)).toEqual(10001)
  })
  it('should compute range outcomes properly', () => {
    const testCases = [
      {
        payoutPoints: [
          {
            eventOutcome: 0,
            outcomePayout: 0,
            extraPrecision: 0,
          },
          {
            eventOutcome: 20,
            outcomePayout: 20,
            extraPrecision: 0,
          },
        ],
        expectedLen: 21,
        expectedFirstStart: 0,
        expectedFirstPayout: 0,
        expectedLastStart: 20,
        expectedLastPayout: 20,
        totalCollateral: 20,
      },
      {
        payoutPoints: [
          {
            eventOutcome: 10,
            outcomePayout: 10,
            extraPrecision: 0,
          },
          {
            eventOutcome: 20,
            outcomePayout: 10,
            extraPrecision: 0,
          },
        ],
        expectedLen: 1,
        expectedFirstStart: 10,
        expectedFirstPayout: 10,
        expectedLastStart: 10,
        expectedLastPayout: 10,
        totalCollateral: 10,
      },
      {
        payoutPoints: [
          {
            eventOutcome: 50000,
            outcomePayout: 0,
            extraPrecision: 0,
          },
          {
            eventOutcome: 1048575,
            outcomePayout: 0,
            extraPrecision: 0,
          },
        ],
        expectedLen: 1,
        expectedFirstStart: 50000,
        expectedFirstPayout: 0,
        expectedLastStart: 50000,
        expectedLastPayout: 0,
        totalCollateral: 200000000,
      },
    ]

    for (const testCase of testCases) {
      const polynomial: PolynomialPayoutCurvePiece = {
        payoutPoints: testCase.payoutPoints,
      }

      const roundingIntervals: RoundingIntervals = {
        intervals: [
          {
            beginInterval: 0,
            roundingMod: 1,
          },
        ],
      }

      const rangePayouts: RangeOutcome[] = []
      polynomialToRangePayouts(
        polynomial.payoutPoints,
        testCase.totalCollateral,
        rangePayouts,
        roundingIntervals
      )

      const first = rangePayouts[0]
      const last = rangePayouts[rangePayouts.length - 1]

      expect(testCase.expectedLen).toEqual(rangePayouts.length)
      expect(testCase.expectedFirstStart).toEqual(first.start)
      expect(testCase.expectedFirstPayout).toEqual(first.payout.offer)
      expect(testCase.expectedLastStart).toEqual(last.start)
      expect(testCase.expectedLastPayout).toEqual(last.payout.offer)
    }
  })
})
