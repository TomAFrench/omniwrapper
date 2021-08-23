import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Contract, ContractInterface, ContractTransaction, PayableOverrides } from '@ethersproject/contracts';
import { defaultWrappers } from './wrappers';
import { TokenWrapper } from './types';

export class OmniWrapper {
  private provider: Provider | Signer;
  private wrappers: Record<string, TokenWrapper>;

  constructor(provider: Provider | Signer, wrappers: TokenWrapper[] = defaultWrappers) {
    this.provider = provider;
    this.wrappers = Object.fromEntries(
      wrappers.map((wrapper) => [wrapper.wrapperAddress.concat(wrapper.underlyingAddress).toLowerCase(), wrapper])
    );
  }

  getWrapper = (wrapperAddress: string, underlyingAddress: string): TokenWrapper => {
    const wrapper = this.wrappers[wrapperAddress.concat(underlyingAddress).toLowerCase()];
    if (!wrapper) throw new Error('Wrapper not found');
    return wrapper;
  };

  quoteWrap = (wrapperAddress: string, underlyingAddress: string, underlyingAmount: BigNumberish): Promise<BigNumber> =>
    this.getWrapper(wrapperAddress, underlyingAddress).quoteWrap(underlyingAmount, this.provider);

  quoteUnwrap = (wrapperAddress: string, underlyingAddress: string, wrappedAmount: BigNumberish): Promise<BigNumber> =>
    this.getWrapper(wrapperAddress, underlyingAddress).quoteUnwrap(wrappedAmount, this.provider);

  quoteConvert = async (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: BigNumberish
  ): Promise<BigNumber> => {
    try {
      return await this.quoteWrap(tokenOutAddress, tokenInAddress, amountIn);
    } catch {
      return this.quoteUnwrap(tokenInAddress, tokenOutAddress, amountIn);
    }
  };

  prepareWrap = (
    wrapperAddress: string,
    underlyingAddress: string,
    amount: BigNumberish,
    overrides: PayableOverrides = {}
  ): [string, ContractInterface, string, any[], PayableOverrides] => {
    const { abi, wrapFunction, nativeAsset } = this.getWrapper(wrapperAddress, underlyingAddress);
    if (nativeAsset) {
      return [wrapperAddress, abi, wrapFunction, [], { ...overrides, value: amount }];
    }
    return [wrapperAddress, abi, wrapFunction, [amount], overrides];
  };

  wrap = (
    wrapperAddress: string,
    underlyingAddress: string,
    amount: BigNumberish,
    overrides: PayableOverrides = {}
  ): Promise<ContractTransaction> =>
    this.sendTransaction(...this.prepareWrap(wrapperAddress, underlyingAddress, amount, overrides));

  prepareUnwrap = (
    wrapperAddress: string,
    underlyingAddress: string,
    amount: BigNumberish,
    overrides: PayableOverrides = {}
  ): [string, ContractInterface, string, any[], PayableOverrides] => {
    const { abi, unwrapFunction } = this.getWrapper(wrapperAddress, underlyingAddress);
    return [wrapperAddress, abi, unwrapFunction, [amount], overrides];
  };

  unwrap = (
    wrapperAddress: string,
    underlyingAddress: string,
    amount: BigNumberish,
    overrides: PayableOverrides = {}
  ): Promise<ContractTransaction> =>
    this.sendTransaction(...this.prepareUnwrap(wrapperAddress, underlyingAddress, amount, overrides));

  prepareConvert = (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: BigNumberish,
    overrides: PayableOverrides = {}
  ): [string, ContractInterface, string, any[], PayableOverrides] => {
    try {
      return this.prepareWrap(tokenOutAddress, tokenInAddress, amountIn, overrides);
    } catch {
      return this.prepareUnwrap(tokenInAddress, tokenOutAddress, amountIn, overrides);
    }
  };

  convert = async (
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: BigNumberish,
    overrides: PayableOverrides = {}
  ): Promise<ContractTransaction> =>
    this.sendTransaction(...this.prepareConvert(tokenInAddress, tokenOutAddress, amountIn, overrides));

  private sendTransaction = (
    contractAddress: string,
    abi: ContractInterface,
    functionName: string,
    args: any[],
    overrides: PayableOverrides = {}
  ) => new Contract(contractAddress, abi, this.provider)[functionName](...args, overrides);
}
