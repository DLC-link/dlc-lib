export enum KeyPrefix {
  CONFIG = 1,
  CONTRACT = 2,
  ADDRESS = 3,
  UTXO = 4,
  PUBKEY = 5,
}

export function getKeyPrefix(key: KeyPrefix): string {
  return key.toString().padStart(2, '0')
}
