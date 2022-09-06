import axios from 'axios'
import { DlcManager } from '../ts_src/controller/dlcManager'
import { TEST_BITCOIND_CONFIG } from './env'
import { LevelContractRepository } from './repository/levelContractRepository'
import level from 'level-test'
import { OfferMessage, SignMessage } from '../ts_src/models/messages'
import { offerMessageFromJson } from '../ts_src/models/messages/offerMessage'
import { ElectrsBlockchain } from '../ts_src/blockchain/electrsBlockchain'
import { BitcoinJSWallet } from '../ts_src/wallet/bitcoinJsWallet'
import { regtest } from 'bitcoinjs-lib/src/networks'
import { ContractUpdater } from '../ts_src/controller/contractUpdater'
import { Client } from 'bitcoin-simple-rpc'
import { satsToBtc } from '../ts_src/utils/conversion'

const HOST = 'http://localhost:8080/'
const NEWOFFER = 'newoffer/'
const POSTACCEPT = 'acceptoffer'

function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function dotest(type: 'enumerated' | 'numerical') {
  const client = new Client({
    baseURL: `http://${TEST_BITCOIND_CONFIG.host}:${TEST_BITCOIND_CONFIG.port}/wallet/${TEST_BITCOIND_CONFIG.wallet}`,
    auth: {
      username: TEST_BITCOIND_CONFIG.rpcUsername,
      password: TEST_BITCOIND_CONFIG.rpcPassword,
    },
  })
  const blockchain = new ElectrsBlockchain('http://localhost:3004')
  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }
  const db = level({ mem: true })(options)
  const repository = new LevelContractRepository(db)
  const wallet = new BitcoinJSWallet(repository, regtest, blockchain)

  // Make sure client has enough fund to send.
  await client.generateToAddress(10, await client.getNewAddress())

  // Generate many random utxos to test the wallet.
  for (let i = 0; i < 25; i++) {
    const e = (Math.floor(Math.random() * 10) % 6) + 1
    const p = Math.pow(10, e)
    const amount = Math.floor(Math.random() * p) + 1000
    const address = await wallet.getNewAddress()
    await client.sendToAddress(address, satsToBtc(amount))
  }

  // Get one big UTXO to make sure there is enough funds for collateral.
  const address = await wallet.getNewAddress()
  await client.sendToAddress(address, satsToBtc(99990032))

  await client.generateToAddress(10, await client.getNewAddress())

  // Wait for electrs to have processed all txs.
  let utxosLen = 0
  while (utxosLen != 26) {
    await wallet.periodicChecks()
    utxosLen = (await repository.getUtxos()).length
    await sleep(1000)
  }

  const contractUpdater = new ContractUpdater(wallet, blockchain)
  const dlcManager = new DlcManager(contractUpdater, repository)

  // Get an offer from the test backend.
  const resp = await axios.get<OfferMessage>(HOST + NEWOFFER + type, {
    transformResponse: [
      (data) => {
        return offerMessageFromJson(data)
      },
    ],
  })

  const offer = resp.data

  // Process the offer.
  const offeredContract = await dlcManager.onOfferMessage(offer)

  // Accept the offer.
  const accept = await dlcManager.acceptOffer(
    offeredContract.temporaryContractId
  )

  // Get the sign message from the test backend.
  const sign = (await axios.post<SignMessage>(HOST + POSTACCEPT, accept)).data

  // Process the sign message.
  await dlcManager.onSignMessage(sign)
}

describe('dlcManager integration test', () => {
  it('should be able to process an enum contract', async () => {
    await dotest('enumerated')
  })
  it('should be able to process a numerical contract', async () => {
    await dotest('numerical')
  })
})
