# Mê Đi Mobile (Expo)

React Native / Expo scaffold for the Mê Đi travel app.

## Features (MVP)

- Email/password login (JWT, shared API with web)
- Register/login/logout with secure session restore
- Bottom-tab companion shell for Android: Trips, Today, Checklist, Expenses, Chat
- Trip list with pull-to-refresh and quick trip creation
- Trip detail timeline: view days, add/edit/delete places, move places between days, open external directions
- Checklist TODO/PACKING: add, check/uncheck, delete
- Expenses: budget summary, settlement suggestions, list and add group expenses
- Bookings: view attachments and import booking text
- Group chat via REST list/send
- Secure token storage via `expo-secure-store`

## Setup

```bash
# From monorepo root
pnpm install

# Optional: override API URL. By default app.config.js uses your LAN IP.
# EXPO_PUBLIC_API_URL=http://192.168.x.x:4000 pnpm mobile

cd apps/mobile
pnpm dev
```

Scan the QR code with Expo Go, or press `a` / `i` for Android / iOS simulator.

### Physical Android over USB

Install Android Platform Tools first:

```bash
sudo pacman -S --needed android-tools
```

Then enable USB debugging on the phone, accept the trust prompt, and run from the monorepo root:

```bash
pnpm mobile:usb
```

This uses `adb reverse` so the phone can reach Metro and API through USB:

- `127.0.0.1:8081` -> Metro
- `127.0.0.1:4000` -> API

## Demo account

`demo@medi.app` / `medi1234` (after `pnpm db:seed` on API)

## Limitations

- No native embedded map yet; directions open externally
- No AI generation, Creator Shop, PRO checkout, push notifications, or offline sync in V1
- Chat is REST refresh/list/send; realtime socket can be added after core Android flow is stable
- Physical devices cannot call laptop `localhost`; `app.config.js` resolves a LAN API URL automatically, or set `EXPO_PUBLIC_API_URL`
- If login times out on a physical phone, open `http://<your-laptop-lan-ip>:4000/health` in the phone browser first; if it does not load, the phone cannot reach the API over LAN.
