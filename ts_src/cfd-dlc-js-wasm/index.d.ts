/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export interface AddSignatureToFundTransactionRequest {
  fundTxHex: string
  signature: string
  prevTxId: string
  prevVout: number
  pubkey: string
}

export interface AddSignatureToFundTransactionResponse {
  hex: string
}

export interface AddSignaturesToRefundTxRequest {
  refundTxHex: string
  signatures: string[]
  fundTxId: string
  fundVout?: number
  offerFundPubkey: string
  acceptFundPubkey: string
}

export interface AddSignaturesToRefundTxResponse {
  hex: string
}

export interface CreateCetRequest {
  offerFundPubkey: string
  acceptFundPubkey: string
  offerFinalAddress: string
  acceptFinalAddress: string
  offerPayout: bigint | number
  acceptPayout: bigint | number
  offerPayoutSerialId: bigint | number
  acceptPayoutSerialId: bigint | number
  fundTxId: string
  fundVout?: number
  lockTime: bigint | number
}

export interface CreateCetResponse {
  hex: string
}

export interface CreateCetAdaptorSignatureRequest {
  cetHex: string
  privkey: string
  fundTxId: string
  fundVout?: number
  offerFundPubkey: string
  acceptFundPubkey: string
  oraclePubkey: string
  oracleRValues: string[]
  fundInputAmount: bigint | number
  messages: string[]
}

export interface CreateCetAdaptorSignatureResponse {
  signature: string
}

export interface Messages {
  messages: string[]
}

export interface CreateCetAdaptorSignaturesRequest {
  cetsHex: string[]
  privkey: string
  fundTxId: string
  fundVout?: number
  offerFundPubkey: string
  acceptFundPubkey: string
  oraclePubkey: string
  oracleRValues: string[]
  fundInputAmount: bigint | number
  messagesList: Messages[]
}

export interface CreateCetAdaptorSignaturesResponse {
  adaptorSignatures: string[]
}

export interface PayoutRequest {
  offer: bigint | number
  accept: bigint | number
}

export interface TxInInfoRequest {
  txid: string
  vout: number
  redeemScript?: string
  maxWitnessLength: number
  serialId: bigint | number
}

export interface TxInInfoRequest {
  txid: string
  vout: number
  redeemScript?: string
  maxWitnessLength: number
  serialId: bigint | number
}

export interface CreateDlcTransactionsRequest {
  payouts: PayoutRequest[]
  offerFundPubkey: string
  offerPayoutScriptPubkey: string
  offerPayoutSerialId: bigint | number
  acceptFundPubkey: string
  acceptPayoutScriptPubkey: string
  acceptPayoutSerialId: bigint | number
  offerInputAmount: bigint | number
  offerCollateralAmount: bigint | number
  acceptInputAmount: bigint | number
  acceptCollateralAmount: bigint | number
  refundLocktime: bigint | number
  offerInputs: TxInInfoRequest[]
  offerChangeScriptPubkey: string
  offerChangeSerialId: bigint | number
  acceptInputs: TxInInfoRequest[]
  acceptChangeScriptPubkey: string
  acceptChangeSerialId: bigint | number
  feeRate: number
  fundOutputSerialId: bigint | number
  cetLockTime?: bigint | number
  fundLockTime?: bigint | number
  optionDest?: string
  optionPremium?: bigint | number
}

export interface CreateDlcTransactionsResponse {
  fundTxHex: string
  cetsHex: string[]
  refundTxHex: string
  fundingScriptPubkey: string
  fundVout: number
}

export interface TxInInfoRequest {
  txid: string
  vout: number
  redeemScript?: string
  maxWitnessLength: number
  serialId: bigint | number
}

export interface TxInInfoRequest {
  txid: string
  vout: number
  redeemScript?: string
  maxWitnessLength: number
  serialId: bigint | number
}

export interface CreateFundTransactionRequest {
  offerPubkey: string
  acceptPubkey: string
  offerCollateralAmount: bigint | number
  acceptCollateralAmount: bigint | number
  offerInputs: TxInInfoRequest[]
  acceptInputs: TxInInfoRequest[]
  offerChangeScriptPubkey: string
  offerChangeSerialId: bigint | number
  acceptChangeScriptPubkey: string
  acceptChangeSerialId: bigint | number
  offerPayoutScriptPubkey: string
  offerPayoutSerialId: bigint | number
  acceptPayoutScriptPubkey: string
  acceptPayoutSerialId: bigint | number
  feeRate: bigint | number
  fundOutputSerialId: bigint | number
  optionDest?: string
  optionPremium?: bigint | number
}

export interface CreateFundTransactionResponse {
  hex: string
}

export interface CreateRefundTransactionRequest {
  offerFinalScriptPubkey: string
  acceptFinalScriptPubkey: string
  offerAmount: bigint | number
  acceptAmount: bigint | number
  lockTime: bigint | number
  fundTxId: string
  fundVout?: number
}

export interface CreateRefundTransactionResponse {
  hex: string
}

export interface InnerErrorResponse {
  code: number
  type: string
  message: string
}

export interface ErrorResponse {
  error: InnerErrorResponse
}

export interface GetRawFundTxSignatureRequest {
  fundTxHex: string
  privkey: string
  prevTxId: string
  prevVout: number
  amount: bigint | number
}

export interface GetRawFundTxSignatureResponse {
  hex: string
}

export interface GetRawRefundTxSignatureRequest {
  refundTxHex: string
  privkey: string
  fundTxId: string
  fundVout?: number
  offerFundPubkey: string
  acceptFundPubkey: string
  fundInputAmount: bigint | number
}

export interface GetRawRefundTxSignatureResponse {
  hex: string
}

export interface SignCetRequest {
  cetHex: string
  fundPrivkey: string
  fundTxId: string
  fundVout?: number
  offerFundPubkey: string
  acceptFundPubkey: string
  fundInputAmount: bigint | number
  adaptorSignature: string
  oracleSignatures: string[]
}

export interface SignCetResponse {
  hex: string
}

export interface SignFundTransactionRequest {
  fundTxHex: string
  privkey: string
  prevTxId: string
  prevVout: number
  amount: bigint | number
}

export interface SignFundTransactionResponse {
  hex: string
}

export interface VerifyCetAdaptorSignatureRequest {
  cetHex: string
  adaptorSignature: string
  messages: string[]
  offerFundPubkey: string
  acceptFundPubkey: string
  oraclePubkey: string
  oracleRValues: string[]
  fundTxId: string
  fundVout?: number
  fundInputAmount: bigint | number
  verifyAccept: boolean
}

export interface VerifyCetAdaptorSignatureResponse {
  valid: boolean
}

export interface Messages {
  messages: string[]
}

export interface VerifyCetAdaptorSignaturesRequest {
  cetsHex: string[]
  adaptorSignatures: string[]
  messagesList: Messages[]
  offerFundPubkey: string
  acceptFundPubkey: string
  oraclePubkey: string
  oracleRValues: string[]
  fundTxId: string
  fundVout?: number
  fundInputAmount: bigint | number
  verifyAccept: boolean
}

export interface VerifyCetAdaptorSignaturesResponse {
  valid: boolean
}

export interface VerifyFundTxSignatureRequest {
  fundTxHex: string
  signature: string
  pubkey: string
  prevTxId: string
  prevVout: number
  fundInputAmount: bigint | number
}

export interface VerifyFundTxSignatureResponse {
  valid: boolean
}

export interface VerifyRefundTxSignatureRequest {
  refundTxHex: string
  signature: string
  offerFundPubkey: string
  acceptFundPubkey: string
  fundTxId: string
  fundVout?: number
  fundInputAmount: bigint | number
  verifyAccept: boolean
}

export interface VerifyRefundTxSignatureResponse {
  valid: boolean
}

export class Cfddlcjs {
  AddSignatureToFundTransaction(
    jsonObject: AddSignatureToFundTransactionRequest
  ): Promise<AddSignatureToFundTransactionResponse>
  AddSignaturesToRefundTx(
    jsonObject: AddSignaturesToRefundTxRequest
  ): Promise<AddSignaturesToRefundTxResponse>
  CreateCet(jsonObject: CreateCetRequest): Promise<CreateCetResponse>
  CreateCetAdaptorSignature(
    jsonObject: CreateCetAdaptorSignatureRequest
  ): Promise<CreateCetAdaptorSignatureResponse>
  CreateCetAdaptorSignatures(
    jsonObject: CreateCetAdaptorSignaturesRequest
  ): Promise<CreateCetAdaptorSignaturesResponse>
  CreateDlcTransactions(
    jsonObject: CreateDlcTransactionsRequest
  ): Promise<CreateDlcTransactionsResponse>
  CreateFundTransaction(
    jsonObject: CreateFundTransactionRequest
  ): Promise<CreateFundTransactionResponse>
  CreateRefundTransaction(
    jsonObject: CreateRefundTransactionRequest
  ): Promise<CreateRefundTransactionResponse>
  GetRawFundTxSignature(
    jsonObject: GetRawFundTxSignatureRequest
  ): Promise<GetRawFundTxSignatureResponse>
  GetRawRefundTxSignature(
    jsonObject: GetRawRefundTxSignatureRequest
  ): Promise<GetRawRefundTxSignatureResponse>
  SignCet(jsonObject: SignCetRequest): Promise<SignCetResponse>
  SignFundTransaction(
    jsonObject: SignFundTransactionRequest
  ): Promise<SignFundTransactionResponse>
  VerifyCetAdaptorSignature(
    jsonObject: VerifyCetAdaptorSignatureRequest
  ): Promise<VerifyCetAdaptorSignatureResponse>
  VerifyCetAdaptorSignatures(
    jsonObject: VerifyCetAdaptorSignaturesRequest
  ): Promise<VerifyCetAdaptorSignaturesResponse>
  VerifyFundTxSignature(
    jsonObject: VerifyFundTxSignatureRequest
  ): Promise<VerifyFundTxSignatureResponse>
  VerifyRefundTxSignature(
    jsonObject: VerifyRefundTxSignatureRequest
  ): Promise<VerifyRefundTxSignatureResponse>
}

export function addInitializedListener(func: () => Promise<void>): void

export function getCfddlc(): Cfddlcjs

export function hasLoadedWasm(): boolean

export class CfdError extends Error {
  constructor(
    message: string,
    errorInformation: InnerErrorResponse,
    cause: Error
  )
  toString(): string
  getErrorInformation(): InnerErrorResponse
  getCause(): Error
}
