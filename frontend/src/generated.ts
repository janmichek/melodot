//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Donate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const donateAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'artistIds',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'artists',
    outputs: [
      { name: 'totalBalance', internalType: 'uint256', type: 'uint256' },
      { name: 'isClaimed', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'balance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'claimArtist',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'donateToArtist',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'getArtistBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'getArtistStatus',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getArtistsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'artistId', internalType: 'string', type: 'string' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawDonate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 *
 */
export const donateAddress = {
  420420422: '0x1AeFE7B4Ef9D26C35050d1d8bBFC76c7B7b95fd5',
} as const

/**
 *
 */
export const donateConfig = { address: donateAddress, abi: donateAbi } as const
