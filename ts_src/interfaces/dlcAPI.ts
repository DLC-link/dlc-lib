import { AnyContract } from '../models';
import { Network } from 'bitcoinjs-lib';

export interface DlcAPI {
  getAllContracts(): Promise<AnyContract[]>;

  processContractOffer(offer: string): Promise<AnyContract>;

  processContractSign(sign: string): Promise<AnyContract>;

  getContract(contractId: string): Promise<AnyContract>;

  acceptContract(contractId: string, btcAddress: string, btcPublicKey: string, btcPrivateKey: string, btcNetwork: Network): Promise<AnyContract>;

  rejectContract(contractId: string): Promise<AnyContract>;
}
