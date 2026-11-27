// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {extractArtistId, extractTrackId, formatTrackResponse, isValidSpotifyId} from './utils'

const ARTIST = '4Z8W4fKeB5YxbusRsdQVPb'
const TRACK = '3n3Ppam7vgaVa1iaRUc9Lp'

describe('Spotify ID helpers', () => {
  it('validates 22-character base62 IDs', () => {
    expect(isValidSpotifyId(ARTIST)).toBe(true)
    expect(isValidSpotifyId('short')).toBe(false)
    expect(isValidSpotifyId('!'.repeat(22))).toBe(false)
  })

  it('extracts artist IDs from URLs and raw IDs', () => {
    expect(extractArtistId(`https://open.spotify.com/artist/${ARTIST}?si=x`)).toBe(ARTIST)
    expect(extractArtistId(ARTIST)).toBe(ARTIST)
    expect(extractArtistId('https://example.com/artist/' + ARTIST)).toBeNull()
  })

  it('extracts track IDs from URI and URL formats', () => {
    expect(extractTrackId(`spotify:track:${TRACK}`)).toBe(TRACK)
    expect(extractTrackId(`https://open.spotify.com/track/${TRACK}`)).toBe(TRACK)
    expect(extractTrackId('spotify:album:xxx')).toBe('')
  })
})

describe('formatTrackResponse', () => {
  it('maps Spotify fields to the public shape', () => {
    expect(
      formatTrackResponse({
        artists: [{id: ARTIST, name: 'Radiohead', external_urls: {spotify: 'https://spotify'}}],
        preview_url: 'https://preview',
      }),
    ).toEqual({
      artists: [{id: ARTIST, name: 'Radiohead', url: 'https://spotify'}],
      previewUrl: 'https://preview',
    })
  })
})
