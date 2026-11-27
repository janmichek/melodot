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
  {
    type: 'constructor',
    inputs: [
      { name: 'owner_', internalType: 'address', type: 'address' },
      { name: 'claimSigner_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'fallback', stateMutability: 'nonpayable' },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CLAIM_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_PLATFORM_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_ARTIST_ID_LENGTH',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_FEE_BPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'artistId', internalType: 'string', type: 'string' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'claimArtist',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimSigner',
    outputs: [{ name: 'signer', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'getArtistClaimant',
    outputs: [{ name: 'claimant', internalType: 'address', type: 'address' }],
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
    outputs: [{ name: 'count', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'artistId', internalType: 'string', type: 'string' },
      { name: 'claimant', internalType: 'address', type: 'address' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getClaimDigest',
    outputs: [{ name: 'digest', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformFeeBalance',
    outputs: [{ name: 'feeBalance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformFeeInfo',
    outputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'feeBps', internalType: 'uint16', type: 'uint16' },
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
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'pendingWithdrawals',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'claimSigner_', internalType: 'address', type: 'address' },
    ],
    name: 'setClaimSigner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient_', internalType: 'address', type: 'address' },
      { name: 'feeBps_', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPlatformFeeInfo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'artistId', internalType: 'string', type: 'string' }],
    name: 'settleDonations',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settlePlatformFees',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'artistId',
        internalType: 'string',
        type: 'string',
        indexed: true,
      },
      {
        name: 'claimant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ArtistClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldSigner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newSigner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ClaimSignerUpdated',
  },
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
        name: 'artistId',
        internalType: 'string',
        type: 'string',
        indexed: true,
      },
      {
        name: 'claimant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DonationsSettled',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
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
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
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
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRecipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'oldFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'PlatformFeeInfoUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PlatformFeesSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdrawn',
  },
  { type: 'error', inputs: [], name: 'ArtistAlreadyClaimed' },
  {
    type: 'error',
    inputs: [
      { name: 'length', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ArtistIdTooLong',
  },
  { type: 'error', inputs: [], name: 'ArtistNotClaimed' },
  { type: 'error', inputs: [], name: 'ClaimExpired' },
  { type: 'error', inputs: [], name: 'DirectEtherNotAccepted' },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  { type: 'error', inputs: [], name: 'EmptyArtistId' },
  { type: 'error', inputs: [], name: 'FallbackNotSupported' },
  {
    type: 'error',
    inputs: [
      { name: 'max', internalType: 'uint256', type: 'uint256' },
      { name: 'actual', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'FeeBpsTooHigh',
  },
  { type: 'error', inputs: [], name: 'InvalidClaimSignature' },
  { type: 'error', inputs: [], name: 'InvalidClaimSigner' },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'claimant', internalType: 'address', type: 'address' },
    ],
    name: 'NotArtistClaimant',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

/**
 *
 */
export const donateAddress = {
  420420417: '0x0000000000000000000000000000000000000000',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 *
 *
 */
export const useReadDonateBpsDenominator = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'BPS_DENOMINATOR',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"CLAIM_TYPEHASH"`
 *
 *
 */
export const useReadDonateClaimTypehash = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'CLAIM_TYPEHASH',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"DEFAULT_PLATFORM_FEE_BPS"`
 *
 *
 */
export const useReadDonateDefaultPlatformFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'DEFAULT_PLATFORM_FEE_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"MAX_ARTIST_ID_LENGTH"`
 *
 *
 */
export const useReadDonateMaxArtistIdLength =
  /*#__PURE__*/ createUseReadContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'MAX_ARTIST_ID_LENGTH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"MAX_FEE_BPS"`
 *
 *
 */
export const useReadDonateMaxFeeBps = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'MAX_FEE_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"claimSigner"`
 *
 *
 */
export const useReadDonateClaimSigner = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'claimSigner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"eip712Domain"`
 *
 *
 */
export const useReadDonateEip712Domain = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'eip712Domain',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"getArtistClaimant"`
 *
 *
 */
export const useReadDonateGetArtistClaimant =
  /*#__PURE__*/ createUseReadContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'getArtistClaimant',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"getClaimDigest"`
 *
 *
 */
export const useReadDonateGetClaimDigest = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'getClaimDigest',
})

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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"pendingOwner"`
 *
 *
 */
export const useReadDonatePendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"pendingWithdrawals"`
 *
 *
 */
export const useReadDonatePendingWithdrawals =
  /*#__PURE__*/ createUseReadContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'pendingWithdrawals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"totalBalance"`
 *
 *
 */
export const useReadDonateTotalBalance = /*#__PURE__*/ createUseReadContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'totalBalance',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 *
 */
export const useWriteDonateAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'acceptOwnership',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 *
 */
export const useWriteDonateRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"setClaimSigner"`
 *
 *
 */
export const useWriteDonateSetClaimSigner =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'setClaimSigner',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"settleDonations"`
 *
 *
 */
export const useWriteDonateSettleDonations =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'settleDonations',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"settlePlatformFees"`
 *
 *
 */
export const useWriteDonateSettlePlatformFees =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'settlePlatformFees',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"transferOwnership"`
 *
 *
 */
export const useWriteDonateTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"withdraw"`
 *
 *
 */
export const useWriteDonateWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: donateAbi,
  address: donateAddress,
  functionName: 'withdraw',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 *
 */
export const useSimulateDonateAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'acceptOwnership',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 *
 */
export const useSimulateDonateRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"setClaimSigner"`
 *
 *
 */
export const useSimulateDonateSetClaimSigner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'setClaimSigner',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"settleDonations"`
 *
 *
 */
export const useSimulateDonateSettleDonations =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'settleDonations',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"settlePlatformFees"`
 *
 *
 */
export const useSimulateDonateSettlePlatformFees =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'settlePlatformFees',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"transferOwnership"`
 *
 *
 */
export const useSimulateDonateTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link donateAbi}__ and `functionName` set to `"withdraw"`
 *
 *
 */
export const useSimulateDonateWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: donateAbi,
    address: donateAddress,
    functionName: 'withdraw',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"ArtistClaimed"`
 *
 *
 */
export const useWatchDonateArtistClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'ArtistClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"ClaimSignerUpdated"`
 *
 *
 */
export const useWatchDonateClaimSignerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'ClaimSignerUpdated',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"DonationsSettled"`
 *
 *
 */
export const useWatchDonateDonationsSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'DonationsSettled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 *
 *
 */
export const useWatchDonateEip712DomainChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 *
 *
 */
export const useWatchDonateOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 *
 */
export const useWatchDonateOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'OwnershipTransferred',
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

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"PlatformFeesSettled"`
 *
 *
 */
export const useWatchDonatePlatformFeesSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'PlatformFeesSettled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link donateAbi}__ and `eventName` set to `"Withdrawn"`
 *
 *
 */
export const useWatchDonateWithdrawnEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: donateAbi,
    address: donateAddress,
    eventName: 'Withdrawn',
  })
