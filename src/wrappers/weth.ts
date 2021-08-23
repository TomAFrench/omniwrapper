import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { TokenWrapper } from '../types';

export const WETH: TokenWrapper = {
  name: 'WETH',
  wrapperAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  underlyingAddress: '0x0000000000000000000000000000000000000000',
  nativeAsset: true,
  allowsUnwrapping: true,
  abi: ['function deposit() public payable', 'function withdraw(uint256 wad) public'],
  wrapFunction: 'deposit',
  unwrapFunction: 'withdraw',
  quoteWrap: async (underlyingAmount: BigNumberish) => BigNumber.from(underlyingAmount),
  quoteUnwrap: async (wrappedAmount: BigNumberish) => BigNumber.from(wrappedAmount),
};
