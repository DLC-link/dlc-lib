import { AnyContract } from '../models/contract'
import { ContractState } from '../models/contract/contract'

export interface ContractQuery {
  readonly states?: ContractState[]
}

export interface ContractRepository {
  createContract(contract: AnyContract): Promise<void>
  getContract(contractId: string): Promise<AnyContract>
  getContracts(query?: ContractQuery): Promise<AnyContract[]>
  updateContract(contract: AnyContract): Promise<void>
  deleteContract(contractId: string): Promise<void>
  hasContract(contractId: string): Promise<boolean>
}
