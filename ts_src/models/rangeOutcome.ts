import { Payout } from './payout'

export interface RangeOutcome {
  readonly start: number
  count: number
  readonly payout: Payout
}
