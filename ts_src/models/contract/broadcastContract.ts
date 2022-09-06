import { ContractState } from './contract'
import { SignedContract } from './signedContract'
import { StatelessContract } from './statelessContract'

export interface BroadcastContract extends StatelessContract<SignedContract> {
  readonly state: ContractState.Broadcast
}
