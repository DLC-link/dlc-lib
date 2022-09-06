/* eslint-disable */
import { AcceptedContract } from './acceptedContract'
import { BroadcastContract } from './broadcastContract'
import { FailedContract } from './failedContract'
import { OfferedContract } from './offeredContract'
import { RejectedContract } from './rejectedContract'
import { SignedContract } from './signedContract'

export { AcceptedContract, toAcceptMessage } from './acceptedContract'
export { BroadcastContract } from './broadcastContract'
export { FailedContract } from './failedContract'
export { OfferedContract } from './offeredContract'
export { RejectedContract } from './rejectedContract'
export { SignedContract } from './signedContract'
export { ContractState } from './contract'

export type AnyContract =
  | AcceptedContract
  | BroadcastContract
  | FailedContract
  | OfferedContract
  | RejectedContract
  | SignedContract

export type ContractToState<C extends AnyContract = AnyContract> = C['state']
export type StateToContract<S extends ContractToState<AnyContract>> = Extract<
  AnyContract,
  { state: S }
>

export function isContractOfState<S extends ContractToState>(
  contract: AnyContract,
  ...states: S[]
): contract is StateToContract<S> {
  return states.some((x) => x == contract.state)
}

export function getId(contract: AnyContract): string {
  if ('id' in contract) {
    return contract.id
  }
  return contract.temporaryContractId
}
