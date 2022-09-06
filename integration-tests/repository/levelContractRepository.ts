import { LevelUp } from 'levelup'
import {
  ContractQuery,
  ContractRepository,
} from '../../ts_src/interfaces/repository'
import {
  AnyContract,
  getId,
  isContractOfState,
} from '../../ts_src/models/contract'
import { ContractState } from '../../ts_src/models/contract/contract'
import { Utxo } from '../../ts_src/models/utxo'
import { ErrorCode } from '../../ts_src/storage/errorCode'
import { getKeyPrefix, KeyPrefix } from './KeyPrefix'
import { RepositoryError } from '../../ts_src/storage/repositoryError'
import { WalletStorage } from '../../ts_src/wallet/bitcoinJsWallet'

interface AddressPair {
  address: string
  privkey: string
}

export class LevelContractRepository
  implements ContractRepository, WalletStorage
{
  private readonly _db: LevelUp

  constructor(db: LevelUp) {
    this._db = db
  }

  async upsertAddress(address: string, privkey: string): Promise<void> {
    const key = this.getAddressKey(address)
    await this._db.put(key, { privkey, address })
  }

  async deleteAddress(address: string): Promise<void> {
    const key = this.getAddressKey(address)
    await this._db.del(key)
  }

  async getAddresses(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const addresses: string[] = []
      this._db
        .createReadStream({
          gte: getKeyPrefix(KeyPrefix.ADDRESS),
          lt: getKeyPrefix(KeyPrefix.ADDRESS + 1),
        })
        .on('error', (error) => reject(error))
        .on('data', (data) => {
          const addressPair = data.value as AddressPair
          if (addressPair == null) {
            throw new RepositoryError(
              ErrorCode.InternalError,
              'Expected object to be of AddressPair type.'
            )
          }

          addresses.push(addressPair.address)
        })
        .on('end', () => {
          return resolve(addresses)
        })
    })
  }

  async getPrivKeyForAddress(address: string): Promise<string> {
    const key = this.getAddressKey(address)

    return (await this._db.get(key)).privkey
  }

  async upsertKeyPair(publicKey: string, privkey: string): Promise<void> {
    const key = this.getKeyForPrefix(publicKey, KeyPrefix.PUBKEY)
    await this._db.put(key, privkey)
  }

  async getPrivKeyForPubkey(publicKey: string): Promise<string> {
    const key = this.getKeyForPrefix(publicKey, KeyPrefix.PUBKEY)

    return this._db.get(key)
  }

  async upsertUtxo(utxo: Utxo): Promise<void> {
    const key = this.getUtxoKey(utxo)

    return this._db.put(key, utxo)
  }

  async deleteUtxo(utxo: Utxo): Promise<void> {
    const key = this.getUtxoKey(utxo)

    return this._db.del(key)
  }

  async getUtxos(): Promise<Utxo[]> {
    return new Promise<Utxo[]>((resolve, reject) => {
      const utxos: Utxo[] = []
      this._db
        .createReadStream({
          gte: getKeyPrefix(KeyPrefix.UTXO),
          lt: getKeyPrefix(KeyPrefix.UTXO + 1),
        })
        .on('error', (error) => reject(error))
        .on('data', (data) => {
          const utxo = data.value as Utxo
          if (utxo == null) {
            throw new RepositoryError(
              ErrorCode.InternalError,
              'Expected object to be of AddressPair type.'
            )
          }

          utxos.push(utxo)
        })
        .on('end', () => {
          return resolve(utxos)
        })
    })
  }

  async hasContract(contractId: string): Promise<boolean> {
    try {
      const key = this.getContractKey(contractId)
      await this._db.get(key)
      return true
    } catch (error) {
      if ((error as any).notFound) {
        return false
      }
      throw new RepositoryError(ErrorCode.InternalError, (error as any).message)
    }
  }

  async createContract(contract: AnyContract): Promise<void> {
    const id = getId(contract)
    if (await this.hasContract(id)) {
      throw new RepositoryError(
        ErrorCode.AlreadyExists,
        'Trying to create a contract that already exists.'
      )
    }
    try {
      const key = this.getContractKey(id)
      await this._db.put(key, contract)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, (error as any).message)
    }
  }

  getContracts(query?: ContractQuery): Promise<AnyContract[]> {
    return new Promise<AnyContract[]>((resolve, reject) => {
      const contracts: AnyContract[] = []
      this._db
        .createReadStream({
          gte: getKeyPrefix(KeyPrefix.CONTRACT),
          lt: getKeyPrefix(KeyPrefix.CONTRACT + 1),
        })
        .on('error', (error) => reject(error))
        .on('data', (data) => {
          const contract = data.value as AnyContract
          if (contract == null) {
            throw new RepositoryError(
              ErrorCode.InternalError,
              'Expected object to be of Contract type.'
            )
          }

          if (!query || this.isMatch(contract, query)) {
            contracts.push(contract)
          }
        })
        .on('end', () => {
          return resolve(contracts)
        })
    })
  }

  async getContract(contractId: string): Promise<AnyContract> {
    try {
      const key = this.getContractKey(contractId)

      const res = await this._db.get(key)
      return res
    } catch (error) {
      if ((error as any).notFound) {
        throw new RepositoryError(
          ErrorCode.NotFound,
          `Contract ${contractId} not in DB`
        )
      }
      throw new RepositoryError(ErrorCode.InternalError, (error as any).message)
    }
  }

  async updateContract(contract: AnyContract): Promise<void> {
    const id = getId(contract)
    const key = this.getContractKey(id)
    await this._db.put(key, contract)
    if (isContractOfState(contract, ContractState.Accepted)) {
      this.deleteContract(this.getContractKey(contract.temporaryContractId))
    }
  }

  async deleteContract(contractId: string): Promise<void> {
    try {
      const key = this.getContractKey(contractId)
      await this._db.del(key)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, (error as any).message)
    }
  }

  async unreserveUtxo(txid: string, vout: number): Promise<void> {
    const key = this.getUtxoKey({ txid, vout })
    const utxo = await this._db.get(key)
    return this._db.put(key, {
      ...utxo,
      reserved: false,
    })
  }

  private isHex(value: string): boolean {
    const regexp = /^([0-9a-fA-F]{2})+$/
    return value.length > 0 && regexp.test(value)
  }

  private getContractKey(contractId: string): string {
    return this.getKeyForPrefix(contractId, KeyPrefix.CONTRACT)
  }

  private getUtxoKey(utxo: { txid: string; vout: number }): string {
    const baseKey = utxo.txid + utxo.vout.toString(16).padStart(2, '0')
    return this.getKeyForPrefix(baseKey, KeyPrefix.UTXO)
  }

  private getAddressKey(address: string): string {
    const encoder = new TextEncoder()
    const array = encoder.encode(address)
    let baseKey = ''
    for (const a of array) {
      baseKey += a.toString(16)
    }
    return this.getKeyForPrefix(baseKey, KeyPrefix.ADDRESS)
  }

  private getKeyForPrefix(baseKey: string, prefix: KeyPrefix): string {
    const key = getKeyPrefix(prefix) + baseKey
    if (!this.isHex(key)) {
      throw new Error('Received invalid key')
    }
    return key
  }

  private isMatch(contract: AnyContract, query: ContractQuery): boolean {
    return this.hasOneOfState(query.states, contract)
  }

  private hasOneOfState(
    states: ContractState[] | undefined,
    contract: AnyContract
  ): boolean {
    return !states || states.includes(contract.state)
  }
}
