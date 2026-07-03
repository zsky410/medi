# Mê Đi Mobile (Expo)

React Native / Expo scaffold for the Mê Đi travel app.

## Features (MVP)

- Email/password login (JWT, shared API with web)
- Trip list screen with pull-to-refresh
- Secure token storage via `expo-secure-store`

## Setup

```bash
# From monorepo root
pnpm install

# Set API URL for your machine (use LAN IP for physical device)
# Edit apps/mobile/app.json → expo.extra.apiUrl

cd apps/mobile
pnpm dev
```

Scan the QR code with Expo Go, or press `a` / `i` for Android / iOS simulator.

## Demo account

`demo@medi.app` / `medi1234` (after `pnpm db:seed` on API)

## Limitations

- Read-only trip list (no itinerary editing on mobile yet)
- No push notifications or offline sync
- Point `apiUrl` at your machine's LAN IP when testing on a physical device
