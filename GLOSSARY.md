# Glossary

- **Artist ID** — Spotify's 22-character base62 artist identifier. The contract key.
- **Claim authorisation** — EIP-712 signature over `(artistId, claimant, deadline)` issued after bio verification.
- **Claimant** — the wallet bound to an artist ID by `claimArtist`.
- **Discover** — record a short audio sample and resolve the track and artists.
- **Donation** — a payable `donateToArtist` call. Irreversible once confirmed.
- **Platform fee** — 1% of each donation, accrued by the contract.
- **Settle** — move an artist balance or accrued fees into `pendingWithdrawals`.
- **Tip** — a donation from a listener to one or more artists.
- **Withdraw** — pull a pending balance to a recipient address.
