import {DiscoveryResult} from "../types";

// Mock response data for development
// Using 'as any' because this mock data contains extended fields not in the simplified type definition
export const mockDiscoveryData: DiscoveryResult = {
  "track": {
    "layout": "5",
    "type": "MUSIC",
    "key": "90312839",
    "title": "You & Me (feat. Eliza Doolittle) [Flume Remix]",
    "subtitle": "Disclosure",
    "albumadamid": "1444219216",
    "url": "https://www.shazam.com/track/90312839/you-me-feat-eliza-doolittle-flume-remix",
    "artists": [
      {
        "id": "42",
        "adamid": "520848228"
      }
    ],
    "genres": {
      "primary": "Electronic"
    },
    "urlparams": {
      "{tracktitle}": "You+%26+Me+%28feat.+Eliza+Doolittle%29+%5BFlume+Remix%5D",
      "{trackartist}": "Disclosure"
    },
    "highlightsurls": {},
    "isrc": "GBUM71303827",
    "images": {
      "background": "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages126/v4/64/2d/48/642d48bd-3fc0-a824-7aa7-5d6be5655d87/9c7d2b0e-cb5b-47f9-80bd-07816c5bcdaf_ami-identity-16924f45842520e336c5f38a2fecdfe5-2023-07-17T16-01-05.957Z_cropped.png/800x800cc.jpg",
      "coverart": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/ad/39/bbad3922-2e60-a1c5-3116-deb0066a03b8/13UAEIM36387.rgb.jpg/400x400cc.jpg",
      "coverarthq": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/ad/39/bbad3922-2e60-a1c5-3116-deb0066a03b8/13UAEIM36387.rgb.jpg/400x400cc.jpg",
      "joecolor": "b:97774dp:020203s:040404t:201a12q:211b13"
    },
    "share": {
      "subject": "You & Me (feat. Eliza Doolittle) [Flume Remix] - Disclosure",
      "text": "You & Me (feat. Eliza Doolittle) [Flume Remix] by Disclosure",
      "href": "https://www.shazam.com/track/90312839/you-me-feat-eliza-doolittle-flume-remix",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/ad/39/bbad3922-2e60-a1c5-3116-deb0066a03b8/13UAEIM36387.rgb.jpg/400x400cc.jpg",
      "twitter": "I used @Shazam to discover You & Me (feat. Eliza Doolittle) [Flume Remix] by Disclosure.",
      "html": "https://www.shazam.com/snippets/email-share/90312839?lang=en&country=US",
      "avatar": "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages126/v4/64/2d/48/642d48bd-3fc0-a824-7aa7-5d6be5655d87/9c7d2b0e-cb5b-47f9-80bd-07816c5bcdaf_ami-identity-16924f45842520e336c5f38a2fecdfe5-2023-07-17T16-01-05.957Z_cropped.png/800x800cc.jpg",
      "snapchat": "https://www.shazam.com/partner/sc/track/90312839"
    },
    "hub": {
      "type": "APPLEMUSIC",
      "image": "https://images.shazam.com/static/icons/hub/android/v5/applemusic_{scalefactor}.png",
      "actions": [
        {
          "name": "apple",
          "type": "applemusicplay",
          "id": "1444219454"
        },
        {
          "name": "apple",
          "type": "uri",
          "uri": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/d4/39/de/d439de1d-9020-cc23-050a-e01b2567b2c8/mzaf_16770418752879162207.plus.aac.ep.m4a"
        }
      ],
      "providers": [
        {
          "caption": "Open in Spotify",
          "images": {
            "overflow": "https://images.shazam.com/static/icons/hub/android/v5/spotify-overflow_{scalefactor}.png",
            "default": "https://images.shazam.com/static/icons/hub/android/v5/spotify_{scalefactor}.png"
          },
          "actions": [
            {
              "name": "hub:spotify:searchdeeplink",
              "type": "uri",
              "uri": "spotify:search:You%20%26%20Me%20%28feat.%20Eliza%20Doolittle%29%20%5BFlume%20Remix%5D%20Disclosure"
            }
          ],
          "type": "SPOTIFY"
        },
        {
          "caption": "Open in YouTube Music",
          "images": {
            "overflow": "https://images.shazam.com/static/icons/hub/android/v5/youtubemusic-overflow_{scalefactor}.png",
            "default": "https://images.shazam.com/static/icons/hub/android/v5/youtubemusic_{scalefactor}.png"
          },
          "actions": [
            {
              "name": "hub:youtubemusic:androiddeeplink",
              "type": "uri",
              "uri": "https://music.youtube.com/search?q=You++Me+%28feat.+Eliza+Doolittle%29+%5BFlume+Remix%5D+Disclosure&feature=shazam"
            }
          ],
          "type": "YOUTUBEMUSIC"
        },
        {
          "caption": "Open in Deezer",
          "images": {
            "overflow": "https://images.shazam.com/static/icons/hub/android/v5/deezer-overflow_{scalefactor}.png",
            "default": "https://images.shazam.com/static/icons/hub/android/v5/deezer_{scalefactor}.png"
          },
          "actions": [
            {
              "name": "hub:deezer:searchdeeplink",
              "type": "uri",
              "uri": "deezer-query://www.deezer.com/play?query=%7Btrack%3A%27You++Me+%28feat.+Eliza+Doolittle%29+%5BFlume+Remix%5D%27%20artist%3A%27Disclosure%27%7D"
            }
          ],
          "type": "DEEZER"
        }
      ],
      "explicit": false,
      "displayname": "APPLE MUSIC",
      "options": [
        {
          "caption": "OPEN",
          "actions": [
            {
              "name": "hub:applemusic:deeplink",
              "type": "intent",
              "uri": "intent://music.apple.com/us/album/you-me-feat-eliza-doolittle-flume-remix/1444219216?i=1444219454&mttnagencyid=s2n&mttnsiteid=125115&mttn3pid=Apple-Shazam&mttnsub1=Shazam_android_am&mttnsub2=5348615A-616D-3235-3830-44754D6D5973&itscg=30201&app=music&itsct=Shazam_android_am#Intent;scheme=http;package=com.apple.android.music;action=android.intent.action.VIEW;end"
            },
            {
              "name": "hub:applemusic:connect",
              "type": "applemusicconnect",
              "id": "1444219454",
              "uri": "https://unsupported.shazam.com"
            },
            {
              "name": "hub:applemusic:androidstore",
              "type": "uri",
              "uri": "https://play.google.com/store/apps/details?id=com.apple.android.music&referrer=utm_source=https%3A%2F%2Fmusic.apple.com%2Fsubscribe%3Fmttnagencyid%3Ds2n%26mttnsiteid%3D125115%26mttn3pid%3DApple-Shazam%26mttnsub1%3DShazam_android_am%26mttnsub2%3D5348615A-616D-3235-3830-44754D6D5973%26itscg%3D30201%26app%3Dmusic%26itsct%3DShazam_android_am"
            }
          ],
          "beacondata": {
            "type": "open",
            "providername": "applemusic"
          },
          "image": "https://images.shazam.com/static/icons/hub/android/v5/overflow-open-option_{scalefactor}.png",
          "type": "open",
          "listcaption": "Open in Apple Music",
          "overflowimage": "https://images.shazam.com/static/icons/hub/android/v5/applemusic-overflow_{scalefactor}.png",
          "colouroverflowimage": false,
          "providername": "applemusic"
        }
      ]
    },
    "sections": [
      {
        "type": "SONG",
        "metapages": [
          {
            "image": "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages126/v4/64/2d/48/642d48bd-3fc0-a824-7aa7-5d6be5655d87/9c7d2b0e-cb5b-47f9-80bd-07816c5bcdaf_ami-identity-16924f45842520e336c5f38a2fecdfe5-2023-07-17T16-01-05.957Z_cropped.png/800x800cc.jpg",
            "caption": "Disclosure"
          },
          {
            "image": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/ad/39/bbad3922-2e60-a1c5-3116-deb0066a03b8/13UAEIM36387.rgb.jpg/400x400cc.jpg",
            "caption": "You & Me (feat. Eliza Doolittle) [Flume Remix]"
          }
        ],
        "tabname": "Song",
        "metadata": [
          {
            "title": "Album",
            "text": "Settle (The Remixes)"
          },
          {
            "title": "Label",
            "text": "Universal-Island Records Ltd."
          },
          {
            "title": "Released",
            "text": "2012"
          }
        ]
      },
      {
        "type": "RELATED",
        "tabname": "Related"
      }
    ]
  },
  "matches": [
    {
      "id": "209488235",
      "offset": 78.30427343699999,
      "timeskew": 0.000013232231,
      "frequencyskew": 0
    },
    {
      "id": "616239892",
      "offset": 84.126523437,
      "timeskew": 0.00020706654,
      "frequencyskew": 0.00012087822
    },
    {
      "id": "286192271",
      "offset": 192.9048125,
      "timeskew": -0.00003671646,
      "frequencyskew": 0
    },
    {
      "id": "254545267",
      "offset": 82.351195312,
      "timeskew": -0.0022509694,
      "frequencyskew": -0.00048315525
    }
  ],
  "location": {
    "accuracy": 0.01
  },
  "timestamp": 1761828119759,
  "timezone": "Europe/Guernsey",
  "artistInfo": null
} as unknown as DiscoveryResult;
