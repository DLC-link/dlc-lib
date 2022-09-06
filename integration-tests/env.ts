export const TEST_BITCOIND_CONFIG = {
  host: process.env.BITCOIND_HOST || '127.0.0.1',
  port: process.env.BITCOIND_PORT ? parseInt(process.env.BITCOIND_PORT) : 18443,
  sockProxy: '',
  network: 'regtest',
  rpcUsername: 'testuser',
  rpcPassword: 'lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=',
  wallet: 'bob',
  walletPassphrase: '',
}
