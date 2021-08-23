import { getDefaultProvider } from '@ethersproject/providers';

import { expect } from 'chai';
import { OmniWrapper } from '../../src';

describe('wstETH', () => {
  const provider = getDefaultProvider('mainnet');
  const wrapper = new OmniWrapper(provider);
  const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
  const wstethAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
  const wsteth = wrapper.getWrapper(wstethAddress, stethAddress);

  describe('quoteWrap', () => {
    it('returns the expected wrapped amount', async () => {
      const underlyingAmount = '100';
      const expectedWrappedAmount = '96';

      expect((await wsteth.quoteWrap(underlyingAmount, provider)).toString()).to.be.eq(expectedWrappedAmount);
    });
  });

  describe('quoteWrap', () => {
    it('returns the expected unwrapped amount', async () => {
      const wrappedAmount = '100';
      const expectedUnderlyingAmount = '103';

      expect((await wsteth.quoteUnwrap(wrappedAmount, provider)).toString()).to.be.eq(expectedUnderlyingAmount);
    });
  });
});
