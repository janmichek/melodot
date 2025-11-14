// Toggle mock data: set to true for mock data (with 3 second delay), false for real Shazam API
export const USE_MOCK_DATA = false;

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const mockDiscoveryData = {

    track: {
      title: "Sweet Like Honey",
      subtitle: "Honey T",
      images: {
        coverart: "https://i.scdn.co/image/ab67616d0000b2739c1f9a6e6b4c4e8b6d5e5f5f"
      },
      hub: {
        providers: [{
          type: "SPOTIFY",
          actions: [{
            type: "uri",
            uri: `spotify:track:2hjqwkuGTp5h6KYHuKt9NI`
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
      artists: [{ adamid: "52iWG2c2P0K6HmGrAAUyoP" }]
    },
    artistInfo: {
      socialLinks: {
        spotify: `https://open.spotify.com/artist/52iWG2c2P0K6HmGrAAUyoP`
      }
    },
    spotifyInfo: {
      id: "2hjqwkuGTp5h6KYHuKt9NI",
      name: "Sweet Like Honey",
      artists: [{
        id: "52iWG2c2P0K6HmGrAAUyoP",
        name: "Honey T",
        url: "https://open.spotify.com/artist/52iWG2c2P0K6HmGrAAUyoP"
      }],
      album: {
        id: "album123",
        name: "Sweet Like Honey - Single",
        releaseDate: "2024-01-15",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2739c1f9a6e6b4c4e8b6d5e5f5f",
        url: "https://open.spotify.com/album/album123"
      },
      durationMs: 195000,
      popularity: 75,
      previewUrl: null,
      url: "https://open.spotify.com/track/2hjqwkuGTp5h6KYHuKt9NI"
    }
  };

