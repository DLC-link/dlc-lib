import { AnyContract } from '../models';
import { NetworkType } from '../types/networkTypes';
export interface DlcAPI {
  getAllContracts(): Promise<AnyContract[]>;

  processContractOffer(offer: string): Promise<AnyContract>;

  processContractSign(contractId: string, btcPrivateKey: string, btcNetwork: NetworkType, counterpartyWalletURL: string): Promise<AnyContract>;

  getContract(contractId: string): Promise<AnyContract>;

  acceptContract(contractId: string, btcAddress: string, btcPublicKey: string, btcPrivateKey: string, btcNetwork: NetworkType): Promise<AnyContract>;

  rejectContract(contractId: string): Promise<AnyContract>;
}
