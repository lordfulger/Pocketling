# Pocketling

A tiny pocket pet that lives in real time. Pick an egg, raise it from baby to adult, decorate its room, play mini-games, and visit someone special so your pets can play, marry and start a family.

It runs in any browser and can be installed to a phone's home screen like an app.

## What's inside

- **8 animals**: kitten, bunny, puppy, bear, fox, penguin, frog and dragon. Each grows from baby to child to teen to adult, and turns into one of four adults (starry, sweet, easygoing or grumpy) depending on care.
- **The classic care loop**: hunger and happy hearts, meals and snacks, droppings to clean, sickness and medicine, bedtime with the light, manners and scolding, care mistakes, ageing and passing away.
- **12 mini-games**: Which way?, Star catch, Hop!, Memory, Copy me, Bop-a-mole, Perfect stop, Find the treat, Higher or lower, Rock paper scissors, Flutter and Fishing, plus Star catch for two players.
- **Decorating**: wallpaper, floors, windows, curtains, wall art, hanging decorations, corner furniture and rugs, plus colours, hats, faces and neckwear for the pet.
- **Together**: Google sign-in, a shared home with an invite link, pets that visit and play with each other on their own, friendship hearts, marriage, eggs from married pets, and generations that carry on after a pet passes away.
- **Personal touches**: whoever creates the home can set a welcome note, love letters the pet delivers, a birthday and an anniversary.

## One-time setup (about 10 minutes, no coding)

The game saves pets and connects players through [Firebase](https://firebase.google.com), Google's free app backend. The free plan is plenty for this.

### 1. Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and sign in with your Google account.
2. Click **Create a project**, name it (for example `pocketling`), and finish the steps. Google Analytics isn't needed.

### 2. Turn on Google sign-in

1. In the left menu open **Build → Authentication** and click **Get started**.
2. Under **Sign-in method**, choose **Google**, switch it on, pick a support email and click **Save**.
3. Open the **Settings** tab → **Authorized domains** → **Add domain**, and add `lordfulger.github.io`.

### 3. Create the database

1. Open **Build → Realtime Database** and click **Create database**. Pick the location closest to you and start in **locked mode**.
2. Open the **Rules** tab, replace everything with the contents of [`database.rules.json`](database.rules.json) from this repo, and click **Publish**.

### 4. Connect the website to Firebase

1. Click the gear icon → **Project settings**. Under **Your apps**, click the web icon `</>`, give it a nickname and click **Register app** (skip Firebase Hosting).
2. Firebase shows a `firebaseConfig` block. In this repo, open [`public/config.js`](public/config.js), click the pencil icon to edit it on GitHub, and copy in the values for `apiKey`, `authDomain`, `databaseURL`, `projectId` and `appId`. If `databaseURL` is missing from the block, copy the address shown at the top of the Realtime Database page (it ends in `firebaseio.com` or `firebasedatabase.app`).
3. Commit the change.

These values aren't secret. The database rules are what keep each person's data private.

### 5. Turn on GitHub Pages

1. In this repo go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Every change pushed to `main` now rebuilds the site. The **Actions** tab shows progress, and **Settings → Pages** shows the address (normally `https://lordfulger.github.io/pocketling/`).

### 6. Invite her

1. Open the site, click **Sign in**, then **Create our home** in the *Play together* card.
2. Fill in **Make it personal** (only the person who created the home sees this panel).
3. Tap **Copy invite link** and send it to her. She opens it, signs in with Google and taps **Join this home**.

Tip: on a phone, use **Share → Add to Home Screen** (iPhone) or **Install app** (Android) so it opens like a normal app.

## Moving a pet from the old Claude page

On the old page, open **Settings → Move to another device → Copy save code**. On the new site, open the same setting, choose **Load a save code** and paste it.

## Working on the code

```bash
npm install
npm run build      # writes the site to dist/
npm run dev        # builds and serves dist/ locally
```

- `src/draw.js` holds the pixel art: animals, eggs, rooms and decorations.
- `src/games.js` holds the mini-games.
- `src/net.js` handles Firebase sign-in, saving, homes and live presence.
- `src/main.js` holds the pet simulation, the interface and multiplayer.
- `public/` holds the page, styles, icons and the offline service worker.

Without a Firebase config the game still works fully offline and saves in the browser.
