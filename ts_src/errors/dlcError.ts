import { Contract } from '../models/contract/contract'

export class DlcError extends Error {
  constructor(message: string, readonly contract?: Contract) {
    super(message)
  }
}
