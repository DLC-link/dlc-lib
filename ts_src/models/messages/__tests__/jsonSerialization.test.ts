import OfferMessageTI from './offerMessage-ti'
import AcceptMessageTI from './acceptMessage-ti'
import OracleTI from './oracle-ti'
import ContractTI from './contract-ti'
import PayoutFunctionTI from './payoutFunction-ti'
import * as fs from 'fs'
import { offerMessageFromJson } from '../offerMessage'
import { createCheckers } from 'ts-interface-checker'

function serializeCheck(checkerName: string, object: any) {
  const checker = createCheckers(
    OfferMessageTI,
    AcceptMessageTI,
    OracleTI,
    ContractTI,
    PayoutFunctionTI
  )
  const msgChecker = checker[checkerName]
  msgChecker.check(object)
}

function serializeOfferCheck(filePath: string) {
  const jsonInput: string = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const parsed = offerMessageFromJson(jsonInput)
  serializeCheck('OfferMessage', parsed)
}

describe('message json serialization tests', () => {
  it('should properly deserialize an offer message with enumerated outcome', () => {
    serializeOfferCheck(
      'ts_src/models/messages/__tests__/testInputs/offerEnumerate.json'
    )
  })
  it('should properly deserialize an offer message with numeric outcome', () => {
    serializeOfferCheck(
      'ts_src/models/messages/__tests__/testInputs/offerNumerical.json'
    )
  })
  it('should properly deserialize an accept message', () => {
    const jsonInput: string = fs.readFileSync(
      'ts_src/models/messages/__tests__/testInputs/acceptMessage.json',
      { encoding: 'utf-8' }
    )
    const parsed = JSON.parse(jsonInput)
    serializeCheck('AcceptMessage', parsed)
  })
})
