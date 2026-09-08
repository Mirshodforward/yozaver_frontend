# Yozaver uz frontend

Next.js App Router frontend for **yozaver.uz**.

The practice page has one centered typing line. Characters move from right to left as the visitor types, keeping the active character beneath a fixed center caret. The minimal practice surface offers Uzbek/English word banks, time/word modes, a quiet synthesized keyboard click enabled by default, optional keyboard hints, and focus mode. `Space` advances a word; `Escape` restarts or leaves focus mode; `Tab` keeps normal keyboard navigation.

`/settings` provides six practice themes, ten animated premium backgrounds, six ambient tracks, six keyboard sounds, independent volume controls, typography, caret styles, reduced motion, smooth text movement, and practice defaults. Music and key sounds can be previewed before selection. Track previews stop after 12 seconds or on leaving settings. Selected music continues across client navigation using one native media element; files load only on playback. Media events drive loading/error indicators, and closed keyboard AudioContexts recover on the next interaction. Run `node scripts/generate-ambient.mjs` to regenerate the six original normalized WAV loops.

Premium scenes include Aurora, Orbital, Ocean, Prism, Cosmos, Mercury, Neon Tunnel, Kinetics, Digital Rain, and Firefly Garden. The second collection adds chrome morphing, forward travel, articulated hoops, streaming glyphs, and glowing particles. The two new canvas scenes render at most 24 FPS, preserve elapsed time across pauses, and use cached glow sprites. CSS perspective provides the orbital/prism geometry; the starfield uses depth projection on a canvas capped at 30 FPS and 1.25 device pixel ratio. Scenes load on demand only on the practice route, stop when hidden, and respect reduced motion.

Preferences persist in browser localStorage, with validated defaults and an in-memory fallback when storage is blocked. Signed-in users can select a gallery image: it is resized to at most 1920 pixels, compressed, and stored in IndexedDB under their user ID. These backgrounds are local to the current device, do not sync to the server, and are hidden on logout or account changes. Guests see the sign-in option. Users can adjust image dimming/blur, replace or remove the image, and reset settings with undo.

Completed tests generate real per-second WPM/raw-WPM samples. Up to 200 results are stored locally and displayed on `/analytics` with period filters, interactive charts, a weekly activity ring, and history. `/profile` also supports authenticated cloud history; `/leaderboard` and `/admin` retain their backend APIs. No sample scores are presented as real user results.

## Run

```sh
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend origin (local default: `http://localhost:4000`). A local word bank keeps practice usable if the words API cannot be reached. Account sign-in and global ranking require the backend and Google OAuth configuration.

## Validate

```sh
npm run lint
npx tsc --noEmit
npm run build
```

In environments that block Turbopack's CSS worker port binding, `npx next build --webpack` is supported and was verified. Geist fonts are bundled with their license in `src/app/fonts`, so builds do not fetch Google Fonts.

The browser checks cover centered single-line movement, 10-word completion, a 15-second timed test, persistent local results, analytics filters, optional keyboard/focus controls, keyboard sound being enabled by default, the help dialog, small screens, and blocked browser storage.

The music regression check is `node scripts/check-music.mjs` (requires Playwright; `PLAYWRIGHT_MODULE` can point to an existing installation). It measures decoded audio amplitude and checks mute, volume changes, looping, interruption, continuous playback across navigation, canceled loading, and retry after network or playback rejection. `node scripts/check-settings.mjs` verifies all presets, previews versus selection, keyboard audio recovery, persistent practice defaults, mobile layouts, and account-isolated image upload/removal. `node scripts/check-backgrounds.mjs` checks ten animated scenes, motion, tab visibility, reduced motion, mobile layout and the Google token-fragment callback. All checks accept `TEST_ORIGIN` for a running test server.

Domain metadata, icon, robots and sitemap target `https://yozaver.uz`. Hosting and DNS must be configured separately; see the root deployment guide.
