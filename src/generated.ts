import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// donate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const donateAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'ArtistAlreadyClaimed' },
  { type: 'error', inputs: [], name: 'EmptyArtistId' },
  { type: 'error', inputs: [], name: 'InvalidDonationAmount' },
  { type: 'error', inputs: [], name: 'InvalidRecipientAddress' },
  { type: 'error', inputs: [], name: 'NoBalanceToClaim' },
  { type: 'error', inputs: [], name: 'NoBalanceToPayout' },
  { type: 'error', inputs: [], name: 'NoBalanceToWithdraw' },
  { type: 'error', inputs: [], name: 'NotArtistClaimed' },
  { type: 'error', inputs: [], name: 'OwnableUnauthorized' },
  { type: 'error', inputs: [], name: 'PayoutFailed' },
  {
    type: 'error',
    inputs: [
      { name: 'max', internalType: 'uint256', type: 'uint256' },
      { name: 'actual', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'PlatformFeeExceededMaxFeeBps',
  },
  {
    type: 'error',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'PlatformFeeInvalidRecipient',
  },
  { type: 'error', inputs: [], name: 'PlatformFeeUnauthorized' },
  { type: 'error', inputs: [], name: 'WithdrawalFailed' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'donor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'artistId',
        internalType: 'string',
        type: 'string',
        indexed: true,
      },
      {
        name: 'donatedAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'artistFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DonationMade',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'platformFeeRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'platformFeeBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PlatformFeeInfoUpdated',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'artistIds',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    outputs: [],
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
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'donations',
    outputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'isClaimed', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'getArtistInfo',
    outputs: [
      { name: 'artistBalance', internalType: 'uint256', type: 'uint256' },
      { name: 'isClaimed', internalType: 'bool', type: 'bool' },
    ],
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
    inputs: [],
    name: 'getPlatformFeeBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformFeeInfo',
    outputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'artistId', internalType: 'string', type: 'string' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'payoutDonations',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'setOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_platformFeeRecipient',
        internalType: 'address',
        type: 'address',
      },
      { name: '_platformFeeBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPlatformFeeInfo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'withdrawPlatformFees',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 *
 */
export const donateAddress = {
  420420422: '0x4a52d7e06D83eb0f320EC80b3ccd3828899bF02B',
} as const

/**
 *
 */
export const donateConfig = { address: donateAddress, abi: donateAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__
 *
 *
 */
export const useReadDonate = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"artistIds"`
 *
 *
 */
export const useReadDonateArtistIds = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'artistIds',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"balance"`
 *
 *
 */
export const useReadDonateBalance = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'balance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"donations"`
 *
 *
 */
export const useReadDonateDonations = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'donations',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"getArtistInfo"`
 *
 *
 */
export const useReadDonateGetArtistInfo = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'getArtistInfo',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"getArtistsCount"`
 *
 *
 */
export const useReadDonateGetArtistsCount = /*#__PURE__*/ createUseReadContract(
  { abi: donateAbi, address: donateAddress, functionName: 'getArtistsCount' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"getPlatformFeeBalance"`
 *
 *
 */
export const useReadDonateGetPlatformFeeBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'getPlatformFeeBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"getPlatformFeeInfo"`
 *
 *
 */
export const useReadDonateGetPlatformFeeInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'getPlatformFeeInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"owner"`
 *
 *
 */
export const useReadDonateOwner = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__
 *
 *
 */
export const useWriteDonate = /*#__PURE__*/ createUseWriteContract({
  abi: donateAbi,
  address: donateAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"claimArtist"`
 *
 *
 */
export const useWriteDonateClaimArtist = /*#__PURE__*/ createUseWriteContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'claimArtist',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"donateToArtist"`
 *
 *
 */
export const useWriteDonateDonateToArtist =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'donateToArtist',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"payoutDonations"`
 *
 *
 */
export const useWriteDonatePayoutDonations =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'payoutDonations',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"setOwner"`
 *
 *
 */
export const useWriteDonateSetOwner = /*#__PURE__*/ createUseWriteContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'setOwner',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"setPlatformFeeInfo"`
 *
 *
 */
export const useWriteDonateSetPlatformFeeInfo =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'setPlatformFeeInfo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"withdrawPlatformFees"`
 *
 *
 */
export const useWriteDonateWithdrawPlatformFees =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'withdrawPlatformFees',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__
 *
 *
 */
export const useSimulateDonate = /*#__PURE__*/ createUseSimulateContract({
  abi: donateAbi,
  address: donateAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"claimArtist"`
 *
 *
 */
export const useSimulateDonateClaimArtist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'claimArtist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"donateToArtist"`
 *
 *
 */
export const useSimulateDonateDonateToArtist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'donateToArtist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"payoutDonations"`
 *
 *
 */
export const useSimulateDonatePayoutDonations =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'payoutDonations',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"setOwner"`
 *
 *
 */
export const useSimulateDonateSetOwner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'setOwner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"setPlatformFeeInfo"`
 *
 *
 */
export const useSimulateDonateSetPlatformFeeInfo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'setPlatformFeeInfo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"withdrawPlatformFees"`
 *
 *
 */
export const useSimulateDonateWithdrawPlatformFees =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'withdrawPlatformFees',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__
 *
 *
 */
export const useWatchDonateEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: donateAbi,
  address: donateAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"DonationMade"`
 *
 *
 */
export const useWatchDonateDonationMadeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'DonationMade',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"OwnerUpdated"`
 *
 *
 */
export const useWatchDonateOwnerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'OwnerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"PlatformFeeInfoUpdated"`
 *
 *
 */
export const useWatchDonatePlatformFeeInfoUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'PlatformFeeInfoUpdated',
  })
