// Shared component props
export interface ButtonProps {
  onClick: () => void;
}

// Simplified types for what we actually use in the app
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
    sections?: Array<{
      type?: string;
      metadata?: Array<{
        title?: string;
        text?: string;
      }>;
    }>;
    artists?: Array<{
      adamid?: string;
    }>;
  };
  artistInfo?: {
    type?: string;
    country?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      youtube?: string;
      tiktok?: string;
      soundcloud?: string;
      bandcamp?: string;
      website?: string;
    };
  } | null;
}
