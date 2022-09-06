import { AnyContract } from '../models/contract'
import { ContractState } from '../models/contract/contract'
import { Utxo } from '../models/utxo'

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

export interface WalletStorage {
  upsertAddress(address: string, privkey: string): Promise<void>
  deleteAddress(address: string): Promise<void>
  getAddresses(): Promise<string[]>
  getPrivKeyForAddress(address: string): Promise<string>
  upsertKeyPair(publicKey: string, privkey: string): Promise<void>
  getPrivKeyForPubkey(publicKey: string): Promise<string>
  upsertUtxo(utxo: Utxo): Promise<void>
  deleteUtxo(utxo: Utxo): Promise<void>
  getUtxos(): Promise<Utxo[]>
  unreserveUtxo(txid: string, vout: number): Promise<void>
}
