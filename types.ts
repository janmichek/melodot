import type {ReactNode} from "react"

// Core types
export type Address = `0x${string}`;

export interface Image {
  url: string;
}

export interface ErrorWithStatus extends Error {
  status?: number;
}

// API types
export interface TokenResponse {
  access_token: string;
}

export interface BioResponse {
  isStatus: boolean;
  errorId?: string;
  biography?: string;
  description?: string;
  about?: string;
  artist?: {
    biography?: string;
    description?: string;
    about?: string;
    [key: string]: unknown;
  };
  data?: {
    biography?: string;
    description?: string;
    about?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface TrackInfoResponse {
  artists: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  previewUrl?: string | null;
}

export interface VerifyResponse {
  verified: boolean;
}

// Spotify API types
export interface SpotifyArtistResponse {
  id: string;
  name: string;
  images: Image[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrackResponse {
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  preview_url: string | null;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrackResponse[];
  };
}

// Discovery types
export interface DiscoveryResult {
  track?: {
    title?: string;
    subtitle?: string;
    images?: {
      coverart?: string;
    };
    hub?: {
      actions?: Array<{
        type: string;
        uri?: string;
      }>;
    };
    artists?: Array<{
      adamid: string;
      alias: string;
      id?: string;
    }>;
  };
  spotifyInfo?: {
    artists: Array<{
      id: string;
      name: string;
      url: string;
    }>;
    previewUrl: string | null;
  } | null;
}

// Artist types
interface BaseArtist {
  id: string;
  name: string;
}

export interface ArtistData extends BaseArtist {
  images: Image[];
}

export interface ArtistInfo extends ArtistData {
  external_urls?: { spotify: string };
}

export interface Artist extends BaseArtist {
  url: string;
}

export interface ArtistsMap {
  [artistId: string]: ArtistInfo;
}

// Donation types
export interface DonationTransaction {
  txHash: Address;
  donor: Address;
  artistId: string;
  donatedAmount: bigint;
  artistReward: bigint;
  platformFee: bigint;
  timestamp?: number;
  blockNumber: bigint;
}

export type Donation = DonationTransaction;

export interface DonationTx {
  hash: Address;
  artistId: string;
  artistName: string;
  isConfirmed: boolean;
}

export interface DonorStats {
  donor: Address;
  totalDonated: bigint;
  transactionCount: number;
}

export interface ArtistStats {
  artistId: string;
  totalDonated: bigint;
  totalArtistReward: bigint;
  totalPlatformFee: bigint;
  transactionCount: number;
}

// Audio component props
export interface AudioControlsProps {
  hasPermission: boolean;
  isRecording: boolean;
  isDiscovering: boolean;
  onStart: () => void;
  onStop: () => void;
}

export interface AudioRecorderProps {
  onDiscoveryComplete: (data: DiscoveryResult) => void;
}

export interface AudioRecorderState {
  mediaRecorder: MediaRecorder | null;
  audioBlob: Blob | null;
  permission: boolean;
  errorMessage: string | null;
  isRecording: boolean;
}

// Discovery & donation props
export interface DiscoveryCardProps {
  discovery: DiscoveryResult;
  onDiscoverAgain?: () => void;
}

export interface DonationFormProps {
  artists?: Artist[] | null;
  onSuccess?: () => void;
  onDiscoverAgain?: () => void;
}

export interface DonationAmountControlsProps {
  selectedAmount: number | null;
  onAmountChange: (amount: number) => void;
}

export interface DonationCalculationProps {
  selectedAmount: number | null;
  selectedCount: number;
  totalDonation: number;
  isDonating: boolean;
  isWriting: boolean;
  isAllConfirmed: boolean;
  isConnected: boolean;
  onDonate: () => void;
}

export interface DonationArtistControlsProps {
  artists: Artist[];
  selectedArtists: Set<string>;
  onToggleArtist: (artistId: string) => void;
  isDisabled?: boolean;
}

// Claim component props
export interface ClaimCardProps {
  contractAddress: Address | undefined;
}

export type StepStatus = "completed" | "active" | "disabled" | "pending";

export interface Step {
  number: number;
  title: string;
  description: string;
  status: StepStatus;
  content?: React.ReactNode;
}

export interface StepperProps {
  steps: Step[];
  isProcessing?: boolean;
  processingStepNumber?: number;
}

export interface ArtistCardProps {
  artistBalance: bigint;
  isArtistClaimed: boolean;
  contractAddress?: Address;
  artistData?: ArtistData | null;
  isLoadingArtist?: boolean;
}

// Payout component props
export interface ArtistPayoutFormProps {
  contractAddress: Address;
  artistId: string;
  artistBalance: bigint | null;
  onPayoutSuccess?: () => void;
}

export interface OwnerWithdrawFormProps {
  contractAddress: Address;
  ownerAddress: Address;
  platformFeeBalance: bigint;
}

// Donations table props
export interface RecentDonationTransactionsProps {
  donations: Donation[];
  artistId?: string;
}

export interface DonationTransactionsProps {
  artistId?: string;
}

export interface DonationsDonorsTableProps {
  donations: Donation[];
}

export interface DonationsArtistsTableProps {
  donations: Donation[];
  contractAddress?: Address;
  limit?: number;
}

// UI component props
export interface BalanceLabelProps {
  balance?: bigint;
  label?: string;
  showSymbol?: boolean;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | null;
  isDisabled?: boolean;
  showValidation?: boolean;
  className?: string;
}

export interface TxNotificationProps {
  hash?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  isProcessing?: boolean;
  error?: string | null;
  title?: string;
  successMessage?: string;
  pendingMessage?: string;
  errorMessage?: string;
  processingMessage?: string;
  progress?: { confirmed: number; total: number };
  transactions?: Array<{
    hash: string;
    label?: string;
    description?: string;
  }>;
  blockExplorerBaseUrl?: string;
  blockExplorerUrl?: string;
  onDismiss?: () => void;
  autoHideSuccess?: boolean;
  autoHideDelay?: number;
  className?: string;
  showTransactionList?: boolean;
}

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">

export interface SidebarContextProps {
  state: "expanded" | "collapsed";
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  isOpenMobile: boolean;
  setOpenMobile: (isOpenMobile: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface CheckButtonProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export type LogoSize = "sm" | "md" | "lg" | "xl" | "full"

export interface LogoProps {
  size?: LogoSize
  className?: string
  animated?: boolean
}

// Test types
export type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

export type TestLogger = {
  banner: (msg: string) => void;
  section: (msg: string) => void;
  step: (msg: string) => void;
  ok: (msg: string) => void;
  fail: (msg: string) => void;
};
