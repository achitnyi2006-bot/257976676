# NEON RUSH 3D

A mobile-first Three.js endless traffic-dodge prototype prepared for GitHub Pages and Telegram Mini Apps.

## Files
- `index.html` — game UI, Telegram Web App script, Adsgram SDK script
- `style.css` — responsive neon UI
- `src/main.js` — Three.js scene, traffic, coins, controls, scoring and Adsgram placeholder

## Run locally
Because this uses JavaScript modules, open it from an HTTPS host or a local web server. Do not open `index.html` as a `file://` URL.

## Publish with GitHub Pages (free for public repositories)
1. Create a public repository named `neon-rush-3d`.
2. Upload all files in this ZIP so `index.html` is at the repository root.
3. Repository → Settings → Pages → Build and deployment → Deploy from a branch.
4. Choose branch `main`, folder `/(root)`, then Save.
5. Wait for the Pages URL, usually `https://YOUR-USERNAME.github.io/neon-rush-3d/`.

## Enable Adsgram
1. Open the Adsgram publisher dashboard and copy the numeric `blockId` for your ad unit.
2. In `src/main.js`, replace `YOUR_ADSGRAM_BLOCK_ID` with your actual block ID.
3. Commit the change and wait for GitHub Pages to redeploy.
4. Test in the Telegram Mini App and follow Adsgram's current publisher requirements. The prototype intentionally does not award bonus coins unless the rewarded-ad promise reports completion.

Never put passwords, bot tokens, or private API keys in this public repository.

## Connect Telegram
1. Create or choose a bot via `@BotFather`.
2. In BotFather, configure a Mini App / Web App entry and use your deployed HTTPS GitHub Pages URL.
3. Launch it from Telegram and test on an actual phone.
4. For any server-side user identity or rewards, validate Telegram `initData` on a trusted server. `initDataUnsafe` is for display convenience only and must not be trusted for authentication.

## Notes
- This is a playable starter prototype, not a finished commercial game.
- It uses Three.js from jsDelivr and Google Fonts, so an internet connection is required.
- High scores are stored locally on the player's device only.
- GitHub Pages is static hosting; it does not provide a secure server or database.
