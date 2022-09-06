import { BaseContract } from './baseContract'

export type StatelessContract<C extends BaseContract> = Omit<C, 'state'>
