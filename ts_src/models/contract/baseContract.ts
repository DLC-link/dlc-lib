import { ContractState } from './contract'

export interface BaseContract {
  readonly state: ContractState
  readonly temporaryContractId: string
}
