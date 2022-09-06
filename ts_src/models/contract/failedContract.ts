import { StatelessContract } from './statelessContract'
import { ContractState } from './contract'
import { OfferedContract } from './offeredContract'

export interface FailedContract extends StatelessContract<OfferedContract> {
  readonly state: ContractState.Failed
  readonly reason: string
}
