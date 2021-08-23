import { getDefaultProvider } from '@ethersproject/providers';

import { expect } from 'chai';
import { OmniWrapper } from '../../src';

describe('WETH', () => {
  const provider = getDefaultProvider('mainnet');
  const wrapper = new OmniWrapper(provider);
  const ethAddress = '0x0000000000000000000000000000000000000000';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const weth = wrapper.getWrapper(wethAddress, ethAddress);

  describe('quoteWrap', () => {
    it('returns the expected wrapped amount', async () => {
      const underlyingAmount = '100';
      const expectedWrappedAmount = '100';

      expect((await weth.quoteWrap(underlyingAmount)).toString()).to.be.eq(expectedWrappedAmount);
    });
  });

  describe('quoteWrap', () => {
    it('returns the expected unwrapped amount', async () => {
      const wrappedAmount = '100';
      const expectedUnderlyingAmount = '100';

      expect((await weth.quoteUnwrap(wrappedAmount)).toString()).to.be.eq(expectedUnderlyingAmount);
    });
  });
});
