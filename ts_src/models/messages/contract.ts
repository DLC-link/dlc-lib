import { Payout } from '../payout'
import {
  PayoutFunction,
  payoutFunctionToRangePayout,
  RoundingIntervals,
} from '../payoutFunction'
import { RangeOutcome } from '../rangeOutcome'
import { OracleInfo } from '../oracle'

export type ContractInfo = SingleContractInfo

export interface SingleContractInfo {
  totalCollateral: number
  contractInfo: ContractInfoInner
}

export interface ContractInfoInner {
  contractDescriptor: ContractDescriptor
  oracleInfo: OracleInfo
}

export type ContractDescriptor =
  | EnumeratedContractDescriptor
  | NumericOutcomeContractDescriptor

export function isEnumeratedContractDescriptor(
  descriptor: ContractDescriptor
): descriptor is EnumeratedContractDescriptor {
  return 'payouts' in descriptor
}

export function isNumericOutcomeContractDescriptor(
  descriptor: ContractDescriptor
): descriptor is EnumeratedContractDescriptor {
  return 'numDigits' in descriptor
}

export interface EnumeratedContractDescriptor {
  payouts: ContractOutcome[]
}

export function getEnumeratedContractDescriptorPayouts(
  descriptor: EnumeratedContractDescriptor,
  totalCollateral: number
): Payout[] {
  const payouts: Payout[] = []
  for (const payout of descriptor.payouts) {
    payouts.push({
      offer: payout.offerPayout,
      accept: totalCollateral - payout.offerPayout,
    })
  }

  return payouts
}

export interface NumericOutcomeContractDescriptor {
  numDigits: number
  payoutFunction: PayoutFunction
  roundingIntervals: RoundingIntervals
}

export function getNumericOutcomeDescriptorPayouts(
  descriptor: NumericOutcomeContractDescriptor,
  totalCollateral: number
): Payout[] {
  console.log('here')
  const rangePayouts = payoutFunctionToRangePayout(
    descriptor.payoutFunction,
    totalCollateral,
    descriptor.roundingIntervals
  )
  console.log('Range Payouts: ', rangePayouts)
  return rangePayouts.map((x) => x.payout)
}

export function getNumericOutcomeDescriptorRangePayouts(
  descriptor: NumericOutcomeContractDescriptor,
  totalCollateral: number
): RangeOutcome[] {
  return payoutFunctionToRangePayout(
    descriptor.payoutFunction,
    totalCollateral,
    descriptor.roundingIntervals
  )
}

export interface ContractOutcome {
  outcome: string
  offerPayout: number
}

export function getContractPayouts(contractInfo: ContractInfo): Payout[] {
  const descriptor = contractInfo.contractInfo.contractDescriptor
  const totalCollateral = contractInfo.totalCollateral
  if (isEnumeratedContractDescriptor(descriptor)) {
    console.log('getEnumeratedContractDescriptorPayouts')
    return getEnumeratedContractDescriptorPayouts(descriptor, totalCollateral)
  } else {
    console.log('getNumericOutcomeDescriptorPayouts')
    return getNumericOutcomeDescriptorPayouts(descriptor, totalCollateral)
  }
}
