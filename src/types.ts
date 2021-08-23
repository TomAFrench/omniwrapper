import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { ContractInterface } from '@ethersproject/contracts';

export type TokenWrapper = {
  name: string;
  wrapperAddress: string;
  underlyingAddress: string;
  nativeAsset: boolean;
  allowsUnwrapping: boolean;
  abi: ContractInterface;
  wrapFunction: string;
  unwrapFunction: string;
  quoteWrap: (underlyingAmount: BigNumberish, provider?: Provider | Signer) => Promise<BigNumber>;
  quoteUnwrap: (wrappedAmount: BigNumberish, provider?: Provider | Signer) => Promise<BigNumber>;
};
