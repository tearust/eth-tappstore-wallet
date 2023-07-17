import {_} from 'tearust_utils';

export const ChainMap = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  11155111: 'Sepolia',
  421613: 'Arbitrum Goerli'
};


export const ContractMap = {
  'COFFEE': '0x41F2d9b281800b5C1219725C0CEF35912658beEa',
  'ERC20': '0x0000000000000000000000000000000000000000',  // tea_erc20
  'ERC721': '0x08e27b8CFB26580C301CF5322aEd20a8c12e9856',
  'STORAGE': '0x8A24Fd9977e995592eEbFBC768962E610edCc394',
  'LOCK': '0xFf675712BabA64dA7fF86e12105c9b35Fe7a48F6',
  'MAINTAINER': '0xc5376998Bd1E3bBDb81Db20ce5ea804e514c24Ac',
  'TOKENVESTING': '0x6b4280CB4ec594fa496abf8a1F9Ab261446DBDc1',
};

export const VestingUsers = _.map([
  '0xe0EdE3A80785654D6352B10a2Cdac142D7804fCC',
  '0xb24a7bDbb569dDaF6c4B5289E9201b56886B82f1',
  '0xcc3dbff214afe29e5d6026548e7b932a899c4e4f',
  '0xe9a0A467E97C8AA0184fF457552e5c008e6F396f',
  '0x2D02184Bf522c32697509C95760098d896d76843',
  '0xc766D5555FB1E4A802E6e7F81108ccfB8c8fC653',
  '0xd51552508bb13f5c7FF2C4516FFEE0DF8Aa8d656',
  '0xadA0E0BbEd3776991E62e0A913849f86bfd724e9',
  '0xB76f51FB37843333817E7d3Ea0eC210a971a5c5F',
  '0x09ECB43b5205217a293578B82f83658d870E05a7',
  '0x856Cf4f192E907eC74bE338331b8b70925e2a5FF',
  '0x2D02184Bf522c32697509C95760098d896d76843',
  '0x2ff22bfCD7CC16b5C4E816964674BeDe1C74f0e7',
  '0x025AC5FEFf461788dFa7e9918Bcba0FB3Afd706D',
  '0xFa91815214C738016Fe800A3ffCa9F5ca76225c9',
  '0x09732E2d1E891505CAFEA0acd5029112e50f14dc',
  '0xAB519c9aB727f39cAF97FdB84B21a9894E54349A',
  '0xf8c3e941f3247ae5a425823a402f6199f9c0CE3d',
  '0x6C0277a65bA0Bec558564a6F83e75ff005f84055',
  '0xd51552508bb13f5c7FF2C4516FFEE0DF8Aa8d656',
  '0xa9bA21a90Bb92Fcfbd52f2695A4dC31805Bb32C3',
  '0x8E5936b5107e8Cb86725C087E7998293A625b7D5',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0xe6b546c65bd1758c8c4ff9e850fe44ec552a3257',
  '0x76de295e07368c9f339ca4c323b7a33bf889614f',
  '0xcc71c8f84e97943f9f8e2f15c0d1a89c54d319ff',
  '0xbcec531576938ce9951d630c2197ec6c9f57a4bf',
  '0x05e59d6f7d572ffd9c1038d6325a95c2ece4619e',
  '0x77ba86b7743893ecb1a4b0a51be8a6026e50dfff',
  '0x9e3e862a846daf20b92dca54e11ee55c7cc864a5',
], (s)=>_.toLower(s));

