import { ContractState } from './contract'
import { OfferedContract } from './offeredContract'
import { StatelessContract } from './statelessContract'

export interface RejectedContract extends StatelessContract<OfferedContract> {
  readonly state: ContractState.Rejected
  readonly reason?: string
}
