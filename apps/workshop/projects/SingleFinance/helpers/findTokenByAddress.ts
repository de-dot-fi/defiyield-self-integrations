import { Token } from '@defiyield/sandbox';
import { isSameAddr } from '../helpers/isSameAddress';

export const findTokenByAddress = (tokens: Token[], tokenAddr: string): Token | undefined =>
  tokens.find((token) => isSameAddr(token.address, tokenAddr));
