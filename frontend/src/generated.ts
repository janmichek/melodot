//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Donate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const donateAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'artists',
    outputs: [
      { name: 'musicId', internalType: 'string', type: 'string' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
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
    inputs: [{ name: 'id', internalType: 'string', type: 'string' }],
    name: 'donateToArtist',
    outputs: [],
    stateMutability: 'payable',
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
    inputs: [],
    name: 'tip',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const


export const donateAddress = {
  420420422: "0x990E1A3A29a729aa8F7E4671Bc3803c2190B2D60",
} as const;

/**
 * Complete contract configuration for Wagmi
 */
export const donateConfig = {
  address: donateAddress,
  abi: donateAbi,
} as const;

// todo is this necessary?
// Legacy exports for backward compatibility
export const donateModuleDonateConfig = donateConfig;

