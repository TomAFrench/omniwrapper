import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumberish } from '@ethersproject/bignumber';
import { AddressZero, Zero } from '@ethersproject/constants';
import { getDefaultProvider } from '@ethersproject/providers';

import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { OmniWrapper } from '../src';
import { TokenWrapper } from '../src/types';

chai.use(spies);

describe('Wrapper', () => {
  const provider = getDefaultProvider('mainnet');
  const testTokenWrapper: TokenWrapper = {
    name: 'Test wrapper',
    wrapperAddress: 'wrapperAddress',
    underlyingAddress: 'underlyingAddress',
    nativeAsset: false,
    allowsUnwrapping: true,
    abi: [],
    wrapFunction: 'wrap',
    unwrapFunction: 'unwrap',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    quoteWrap: (underlyingAmount: BigNumberish, provider?: Provider | Signer) => Promise.resolve(Zero),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    quoteUnwrap: (wrappedAmount: BigNumberish, provider?: Provider | Signer) => Promise.resolve(Zero),
  };

  describe('getWrapper', () => {
    const wrapper = new OmniWrapper(provider);

    it('returns the expected token wrapper', () => {
      const ethAddress = AddressZero;
      const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      const weth = wrapper.getWrapper(wethAddress, ethAddress);

      expect(weth.name).to.be.eq('WETH');
      expect(weth.underlyingAddress).to.be.eq(ethAddress);
      expect(weth.wrapperAddress).to.be.eq(wethAddress);

      const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
      const wstethAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
      const wstETH = wrapper.getWrapper(wstethAddress, stethAddress);

      expect(wstETH.name).to.be.eq('wstETH');
      expect(wstETH.underlyingAddress).to.be.eq(stethAddress);
      expect(wstETH.wrapperAddress).to.be.eq(wstethAddress);
    });

    describe('when asked for an unknown pair of assets', () => {
      it('throws', () => {
        expect(() => wrapper.getWrapper(AddressZero, AddressZero)).to.throw('Wrapper not found');
      });
    });
  });

  describe('quoteWrap', () => {
    const wrapper = new OmniWrapper(provider, [testTokenWrapper]);

    it('calls quoteWrap on the expected TokenWrapper', () => {
      const spy = chai.spy.on(testTokenWrapper, 'quoteWrap');
      wrapper.quoteWrap(testTokenWrapper.wrapperAddress, testTokenWrapper.underlyingAddress, 100);
      expect(spy).to.have.been.called.with(100, provider);
      chai.spy.restore();
    });
  });

  describe('quoteUnwrap', () => {
    const wrapper = new OmniWrapper(provider, [testTokenWrapper]);

    it('calls quoteWrap on the expected TokenWrapper', () => {
      const spy = chai.spy.on(testTokenWrapper, 'quoteUnwrap');
      wrapper.quoteUnwrap(testTokenWrapper.wrapperAddress, testTokenWrapper.underlyingAddress, 100);
      expect(spy).to.have.been.called.with(100, provider);
      chai.spy.restore();
    });
  });

  describe('quoteConvert', () => {
    const wrapper = new OmniWrapper(provider, [testTokenWrapper]);

    context('when trying to convert fron underlying to wrapped', () => {
      it('calls quoteWrap on the expected TokenWrapper', () => {
        const spy = chai.spy.on(testTokenWrapper, 'quoteWrap');
        wrapper.quoteConvert(testTokenWrapper.underlyingAddress, testTokenWrapper.wrapperAddress, 100);
        expect(spy).to.have.been.called.with(100, provider);
        chai.spy.restore();
      });
    });

    context('when trying to convert fron wrapped to underlying', () => {
      it('calls quoteUnwrap on the expected TokenWrapper', () => {
        const spy = chai.spy.on(testTokenWrapper, 'quoteUnwrap');
        wrapper.quoteConvert(testTokenWrapper.wrapperAddress, testTokenWrapper.underlyingAddress, 100);
        expect(spy).to.have.been.called.with(100, provider);
        chai.spy.restore();
      });
    });
  });

  describe('prepareWrap', () => {
    const wrapper = new OmniWrapper(provider);

    context('when trying to wrap a native token', () => {
      const ethAddress = AddressZero;
      const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      const WETH = wrapper.getWrapper(wethAddress, ethAddress);

      const underlyingAmount = '100';

      it('attaches the underlyingAmount as the transaction value', async () => {
        const [wrapperAddress, abi, functionName, args, overrides] = await wrapper.prepareWrap(
          wethAddress,
          ethAddress,
          underlyingAmount
        );
        expect(wrapperAddress).to.be.eq(wethAddress);
        expect(abi).to.be.eq(WETH.abi);
        expect(functionName).to.be.eq(WETH.wrapFunction);
        expect(args).to.be.deep.eq([]);
        expect(overrides).to.be.deep.eq({ value: underlyingAmount });
      });
    });

    context('when trying to wrap an ERC20 token', () => {
      const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
      const wstethAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
      const wstETH = wrapper.getWrapper(wstethAddress, stethAddress);
      const underlyingAmount = '100';

      it('attaches zero value to the transaction', async () => {
        const [wrapperAddress, abi, functionName, args, overrides] = await wrapper.prepareWrap(
          wstethAddress,
          stethAddress,
          underlyingAmount
        );
        expect(wrapperAddress).to.be.eq(wstethAddress);
        expect(abi).to.be.eq(wstETH.abi);
        expect(functionName).to.be.eq(wstETH.wrapFunction);
        expect(args).to.be.deep.eq([underlyingAmount]);
        expect(overrides).to.be.deep.eq({});
      });
    });
  });

  describe('prepareUnwrap', () => {
    const wrapper = new OmniWrapper(provider);

    const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
    const wstethAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
    const wstETH = wrapper.getWrapper(wstethAddress, stethAddress);

    const underlyingAmount = '100';

    it('sends a transaction to the wrapper contract', async () => {
      const [wrapperAddress, abi, functionName, args, overrides] = await wrapper.prepareUnwrap(
        wstethAddress,
        stethAddress,
        underlyingAmount
      );
      expect(wrapperAddress).to.be.eq(wstethAddress);
      expect(abi).to.be.eq(wstETH.abi);
      expect(functionName).to.be.eq(wstETH.unwrapFunction);
      expect(args).to.be.deep.eq([underlyingAmount]);
      expect(overrides).to.be.deep.eq({});
    });
  });
});
