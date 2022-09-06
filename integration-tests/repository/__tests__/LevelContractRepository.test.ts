import level from 'level-test'
import { ContractRepository } from '../../../ts_src/interfaces/repository'
import {
  AnyContract,
  OfferedContract,
  RejectedContract,
} from '../../../ts_src/models/contract'
import { ContractState } from '../../../ts_src/models/contract/contract'
import { ErrorCode } from '../../../ts_src/storage/ErrorCode'
import { RepositoryError } from '../../../ts_src/storage/RepositoryError'
import { LevelContractRepository } from '../levelContractRepository'

const baseMaturityDate = Date.UTC(2020, 5, 17, 15, 24)

function generateContract(
  id: number,
  maturityDate: number = baseMaturityDate
): OfferedContract {
  return {
    state: ContractState.Offered,
    temporaryContractId: id.toString().padStart(4, '0'),
    offerParams: {
      fundPubkey: 'pubkey',
      changeScriptPubkey: 'a',
      changeSerialId: 123,
      payoutScriptPubkey: 'b',
      payoutSerialId: 123,
      inputAmount: 123,
      inputs: [],
      collateral: 1,
    },
    contractMaturityBound: maturityDate,
    feeRatePerVByte: 2,
    isOfferParty: false,
    contractInfo: {
      totalCollateral: 2,
      contractInfo: {
        contractDescriptor: { payouts: [] },
        oracleInfo: {
          oracleAnnouncement: {
            announcementSignature: '',
            oraclePublicKey: '',
            oracleEvent: {
              oracleNonces: [],
              eventMaturityEpoch: 1,
              eventDescriptor: { outcomes: [] },
              eventId: 'a',
            },
          },
        },
      },
    },
    offerFundingInputsInfo: [],
    fundOutputSerialId: 4,
    contractTimeOut: 5,
  }
}

function generateContracts(
  nbContracts: number,
  maturityDate: number = baseMaturityDate
): AnyContract[] {
  const contracts: OfferedContract[] = []

  for (let i = 0; i < nbContracts; i++) {
    const contract = generateContract(i, maturityDate)
    contracts.push(contract)
  }

  return contracts
}

async function insertContracts(
  contractRepo: ContractRepository,
  nbContracts: number,
  maturityDate: number = baseMaturityDate
): Promise<AnyContract[]> {
  const contracts = generateContracts(nbContracts, maturityDate)
  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.createContract(contracts[i])
  }

  return contracts
}

function InitializeDataBase(): ContractRepository {
  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }

  const db = level({ mem: true })(options)

  return new LevelContractRepository(db)
}

let contractRepo: ContractRepository

beforeEach(() => {
  contractRepo = InitializeDataBase()
})

test('Test create contract has contract and can be retrieved', async () => {
  // Arrange / Act
  const nbContracts = 10
  const contracts = await insertContracts(contractRepo, nbContracts)

  // Assert
  for (let i = 0; i < nbContracts; i++) {
    const hasContract = await contractRepo.hasContract(
      contracts[i].temporaryContractId
    )
    expect(hasContract).toBeTruthy()
    const value = await contractRepo.getContract(
      contracts[i].temporaryContractId
    )

    expect(value).toEqual(contracts[i])
  }
})

test('Test create contract already inserted returns already exists error', async () => {
  // Arrange
  const contract = (await insertContracts(contractRepo, 1))[0]

  // Act/Assert
  await expect(contractRepo.createContract(contract)).rejects.toThrowError(
    RepositoryError
  )
})

test('Test has contract with unknown id returns false', async () => {
  // Arrange
  const contractRepo = InitializeDataBase()
  const unknownContractId = '0203'

  // Act
  const hasContract = await contractRepo.hasContract(unknownContractId)

  // Assert

  expect(hasContract).toBeFalsy()
})

test('Test get unknown contract returns error', async () => {
  // Arrange
  const unknownContractId = '0203'

  // Act
  try {
    await contractRepo.getContract(unknownContractId)
  } catch (error: any) {
    expect(error.errorCode).toEqual(ErrorCode.NotFound)
  }
})

test('Test update contract is updated', async () => {
  // Arrange
  const contract = (await insertContracts(contractRepo, 1))[0]
  const updatedContract: RejectedContract = {
    ...contract,
    state: ContractState.Rejected,
  }

  // Act
  await contractRepo.updateContract(updatedContract)

  // Assert
  const value = await contractRepo.getContract(contract.temporaryContractId)
  expect(value.state).toEqual(ContractState.Rejected)
})

test('Get contracts with initial state returns all contract in initial state', async () => {
  // Arrange
  const nbContracts = 10
  const contracts = generateContracts(nbContracts)
  contracts[0] = { ...contracts[0], state: ContractState.Rejected }

  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.createContract(contracts[i])
  }

  // Act
  const retrievedContracts = await contractRepo.getContracts({
    states: [ContractState.Offered],
  })

  // Assert
  expect(retrievedContracts.length).toEqual(nbContracts - 1)
  retrievedContracts.forEach((contract) =>
    expect(contract.state).toEqual(ContractState.Offered)
  )
})

test('Get contracts with multiple states returns all contract in requested states', async () => {
  // Arrange
  const nbContracts = 10
  const contracts = generateContracts(nbContracts)
  contracts[0] = { ...contracts[0], state: ContractState.Rejected }

  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.createContract(contracts[i])
  }

  // Act
  const retrievedContracts = await contractRepo.getContracts({
    states: [ContractState.Offered, ContractState.Rejected],
  })

  // Assert
  expect(retrievedContracts.length).toEqual(nbContracts)
})

test('Delete contract is deleted', async () => {
  // Arrange
  const contract = (await insertContracts(contractRepo, 1))[0]

  // Act/Assert
  await contractRepo.deleteContract(contract.temporaryContractId)
  await expect(() =>
    contractRepo.getContract(contract.temporaryContractId)
  ).rejects.toThrowError(RepositoryError)
})

test('Create contract with invalid id throws', async () => {
  const contract = {
    ...generateContract(1),
    id: '1',
  }
  expect(contractRepo.createContract(contract)).rejects.toThrow(Error)
})
