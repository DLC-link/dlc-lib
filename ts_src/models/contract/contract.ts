export enum ContractState {
  Offered = 1,
  Accepted,
  Rejected,
  Signed,
  Broadcast,
  Failed,
}

export interface Contract {
  readonly state: ContractState
}
