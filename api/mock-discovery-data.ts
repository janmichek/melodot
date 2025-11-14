// Toggle mock data: set to true for mock data (with 3 second delay), false for real Shazam API
export const USE_MOCK_DATA = true;

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateMockDiscoveryData() {
  const artistId = "52iWG2c2P0K6HmGrAAUyoP";
  const trackId = "2hjqwkuGTp5h6KYHuKt9NI";
  const artistName = process.env.MOCK_ARTIST_NAME || "Honey T";
  const trackTitle = process.env.MOCK_TRACK_TITLE || "Sweet Like Honey";

  return {
    track: {
      title: trackTitle,
      subtitle: artistName,
      images: {
        coverart: "https://i.scdn.co/image/ab67616d0000b2739c1f9a6e6b4c4e8b6d5e5f5f"
      },
      hub: {
        providers: [{
          type: "SPOTIFY",
          actions: [{
            type: "uri",
            uri: `spotify:track:${trackId}`
          }]
        }]
      },
      sections: [{
        type: "SONG",
        metadata: [
          { title: "Album", text: "Single" },
          { title: "Released", text: "2024" }
        ]
      }],
      artists: [{ adamid: artistId }]
    },
    artistInfo: {
      socialLinks: {
        spotify: `https://open.spotify.com/artist/${artistId}`
      }
    }
  };
}
