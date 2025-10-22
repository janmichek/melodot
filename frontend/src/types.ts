// Shared component props
export interface ButtonProps {
  onClick: () => void;
}

// Shazam API response types
export interface DiscoveryResult {
  track?: {
    layout?: string;
    type?: string;
    key?: string;
    title?: string;
    subtitle?: string;
    share?: {
      subject?: string;
      text?: string;
      href?: string;
      image?: string;
      twitter?: string;
      html?: string;
      avatar?: string;
      snapchat?: string;
    };
    images?: {
      background?: string;
      coverart?: string;
      coverarthq?: string;
      joecolor?: string;
    };
    hub?: {
      type?: string;
      image?: string;
      actions?: Array<{
        name?: string;
        type: string;
        id?: string;
        uri?: string;
      }>;
      options?: Array<{
        caption?: string;
        actions?: Array<{
          name?: string;
          type?: string;
          uri?: string;
        }>;
        beacondata?: {
          type?: string;
          providername?: string;
        };
        image?: string;
        type?: string;
        listcaption?: string;
        overflowimage?: string;
        colouroverflowimage?: boolean;
        providername?: string;
      }>;
      providers?: Array<{
        caption?: string;
        images?: {
          overflow?: string;
          default?: string;
        };
        actions?: Array<{
          name?: string;
          type?: string;
          uri?: string;
        }>;
        type?: string;
      }>;
      explicit?: boolean;
      displayname?: string;
    };
    sections?: Array<{
      type?: string;
      metapages?: Array<{
        image?: string;
        caption?: string;
      }>;
      tabname?: string;
      metadata?: Array<{
        title?: string;
        text?: string;
      }>;
    }>;
    url?: string;
    artists?: Array<{
      id?: string;
      adamid?: string;
    }>;
    isrc?: string;
    genres?: {
      primary?: string;
    };
    urlparams?: {
      [key: string]: string;
    };
    myshazam?: {
      apple?: {
        actions?: Array<{
          name?: string;
          type?: string;
          uri?: string;
        }>;
      };
    };
    highlightsurls?: {
      artisthighlightsurl?: string;
      trackhighlighturl?: string;
    };
    relatedtracksurl?: string;
  };
  matches?: Array<{
    id?: string;
    offset?: number;
    timeskew?: number;
    frequencyskew?: number;
  }>;
  location?: {
    accuracy?: number;
  };
  timestamp?: number;
  timezone?: string;
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
