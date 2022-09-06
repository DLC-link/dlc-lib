import { FundingSignature } from '../messages/signMessage'
import { AcceptedContract } from './acceptedContract'
import { ContractState } from './contract'
import { StatelessContract } from './statelessContract'

export interface SignedContract extends StatelessContract<AcceptedContract> {
  readonly state: ContractState.Signed
  readonly offerFundTxSignatures: ReadonlyArray<FundingSignature>
  readonly offerRefundSignature: string
  readonly offerCetAdaptorSignatures: ReadonlyArray<string>
}
