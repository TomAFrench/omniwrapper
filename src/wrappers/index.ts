import { TokenWrapper } from '../types';
import { WETH } from './weth';
import { wstETH } from './wsteth';

export const defaultWrappers: TokenWrapper[] = [WETH, wstETH];
