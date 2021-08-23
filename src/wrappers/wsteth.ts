import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumberish } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { TokenWrapper } from '../types';

export const wstETH: TokenWrapper = {
  name: 'wstETH',
  wrapperAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  underlyingAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  nativeAsset: false,
  allowsUnwrapping: true,
  abi: [
    'function wrap(uint256 stETHAmount) external returns (uint256)',
    'function unwrap(uint256 wstETHAmount) external returns (uint256)',
    'function getWstETHByStETH(uint256 _stETHAmount) external view returns (uint256)',
    'function getStETHByWstETH(uint256 _wstETHAmount) external view returns (uint256) ',
  ],
  wrapFunction: 'wrap',
  unwrapFunction: 'unwrap',
  quoteWrap: async (underlyingAmount: BigNumberish, provider?: Provider | Signer) => {
    if (!provider) throw new Error('Provider required');
    return new Contract(wstETH.wrapperAddress, wstETH.abi, provider).getWstETHByStETH(underlyingAmount);
  },
  quoteUnwrap: async (wrappedAmount: BigNumberish, provider?: Provider | Signer) => {
    if (!provider) throw new Error('Provider required');
    return new Contract(wstETH.wrapperAddress, wstETH.abi, provider).getStETHByWstETH(wrappedAmount);
  },
};
