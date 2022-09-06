export type OracleInfo = SingleOracleInfo

export interface SingleOracleInfo {
  oracleAnnouncement: OracleAnnouncement
}

export interface OracleAnnouncement {
  announcementSignature: string
  oraclePublicKey: string
  oracleEvent: OracleEvent
}

export interface OracleEvent {
  oracleNonces: string[]
  eventMaturityEpoch: number
  eventDescriptor: EventDescriptor
  eventId: string
}

export type EventDescriptor =
  | EnumEventDescriptor
  | DigitDecompositionEventDescriptor

export function isEnumeratedEventDescriptor(
  descriptor: EventDescriptor
): descriptor is EnumEventDescriptor {
  return 'outcomes' in descriptor
}

export function isDigitDecompositionEventDescriptor(
  descriptor: EventDescriptor
): descriptor is DigitDecompositionEventDescriptor {
  return 'base' in descriptor
}

export interface EnumEventDescriptor {
  outcomes: string[]
}

export interface DigitDecompositionEventDescriptor {
  base: number
  isSigned: boolean
  unit: string
  precision: number
  nbDigits: number
}
