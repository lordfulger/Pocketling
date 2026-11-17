# Pocketling

A tiny pocket pet that lives in real time. Pick an egg, raise it from baby to adult, decorate its room, play mini-games, and visit someone special so your pets can play, marry and start a family.

It runs in any browser and can be installed to a phone's home screen like an app.

## What's inside

- **8 animals**: kitten, bunny, puppy, bear, fox, penguin, frog and dragon. Each grows from baby to child to teen to adult, and turns into one of four adults (starry, sweet, easygoing or grumpy) depending on care.
- **The classic care loop**: hunger and happy hearts, meals and snacks, droppings to clean, sickness and medicine, bedtime with the light, manners and scolding, care mistakes, ageing and passing away.
- **12 mini-games**: Which way?, Star catch, Hop!, Memory, Copy me, Bop-a-mole, Perfect stop, Find the treat, Higher or lower, Rock paper scissors, Flutter and Fishing, plus five two-player games.
- **Decorating**: wallpaper, floors, windows, curtains, wall art, hanging decorations, corner furniture and rugs, plus colours, hats, faces and neckwear for the pet.
- **Together**: Google sign-in, a shared home with an invite link, pets that visit and play with each other on their own, friendship hearts, marriage, eggs from married pets, and generations that carry on after a pet passes away.
- **Personal touches**: whoever creates the home can set a welcome note, love letters the pet delivers, a birthday and an anniversary.
- **Coins and a shop**: earn coins from games, good care, daily visits, achievements and weekly goals. Spend them on 11 foods, new furniture, wallpapers and outfits.
- **Personalities and tastes**: every pet is playful, foodie, sleepy, neat, cuddly or brave, and has a favourite food and one it hates. Children inherit their parents' personalities.
- **Old age**: pets get white eyebrows and a walking stick near the end, and past pets rest in a memory garden.
- **Letters and gifts**: your pet carries a letter, coins or a treat to the other person's room and waits there until they open the app.
- **Shared photo album, weekly goals for two, and visiting each other's rooms.**
- **Two-player games**: Star catch, Tap race, Tug of war, Memory race and Fishing contest.
- **Achievements and daily streaks.**
- **Ambience**: the window shows your real local weather (optional), holidays decorate the room automatically, and optional chiptune music changes with the time of day.
- **Adventures**: send your pet to the meadow, the beach, the forest, the mountains or Star island for a few real hours. It comes back with a postcard story, coins, food and sometimes a rare find you can't buy. Two pets can go together.
- **Your photo as wall art**: pick a photo of you two and it becomes pixel art hanging in the room, visible in each other's rooms too.
- **Talking pets**: little speech bubbles that know her name, the time of day, what it needs and what's coming up.
- **Tricks**: practise six tricks, then show them off for coins (friends see it too).
- **Garden**: six plots, shared by everyone in your home. Plant, water at each stage and harvest food, coins, a flower vase and pumpkins.
- **Countdowns** to trips and dates, shared in your home, plus her birthday and your anniversary.
- **Reasons jar**: write reasons you love each other. Each of you draws one a day.
- **Family pet**: one shared pet for the whole home that wanders through your rooms and grows up as you all care for it.
- **Chat with emotes**: messages also pop up as speech bubbles over your pets.
- **"Thinking of you"** taps, **parties** with confetti and coins for everyone, **decoration gifts** by mail, and a **side-by-side** comparison of your pets.
- **Memory race and Fishing contest**, two new two-player games.
- **Seasonal shop**: some things are only sold in their months (snowman, pumpkin lantern, Santa hat, sun hat and more).
- **A quick tour** the first time you play (Settings → Show the tour to see it again).
- **Daily backups** saved in the browser and in your account. Restore one from Settings → Backups.
- **Phone notifications** when your pet is hungry, lonely, sleepy or messy, when a letter or a "thinking of you" arrives, when it's back from an adventure, and when the other person comes online. This needs one extra setup step (below).

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

1. Open **Build → Realtime Database** and click **Create database**. Pick **United States (us-central1)** and start in **locked mode**.
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

## Phone notifications (optional, about 10 more minutes)

Notifications need a small piece of server code (in [`functions/`](functions/)) that checks on pets every 10 minutes. Firebase only runs server code on its pay-as-you-go **Blaze** plan. For two people this stays inside the free allowance, so it should cost nothing, but Google asks for a card.

1. In the Firebase console, click **Upgrade** next to your plan and choose **Blaze**. While you're there, set a budget alert of $1 so you'd hear about any charge.
2. Open **Project settings → Cloud Messaging**. Under **Web Push certificates**, click **Generate key pair** and copy the key.
3. Edit [`public/config.js`](public/config.js) on GitHub again: paste the key into `vapidKey`, and copy `messagingSenderId` from the same `firebaseConfig` block as before. Commit.
4. Deploy the server code from your browser, with no installs, using Google Cloud Shell:
   1. Open [shell.cloud.google.com](https://shell.cloud.google.com) while signed in to the same Google account.
   2. Paste these lines one at a time, replacing `YOUR_PROJECT_ID` with the project ID from Project settings:

      ```bash
      git clone https://github.com/lordfulger/pocketling && cd pocketling
      npm --prefix functions install
      npx firebase-tools login --no-localhost
      npx firebase-tools deploy --only functions,database --project YOUR_PROJECT_ID
      ```

      The login step prints a link: open it, allow access, and paste the code back. The deploy takes a few minutes. If it asks to enable APIs, answer yes.
5. On each phone, open the site and go to **Settings → Phone notifications → Turn on**. On iPhone this only works from the Home Screen app (Share → Add to Home Screen first, then open it from there).

Keep the Realtime Database in the **United States (us-central1)** location so the server code can listen to it without extra settings.

## Updating the database rules

New versions sometimes add shared features (v6 added chat, the reasons jar, countdowns, the garden, the family pet and parties). After updating, open **Realtime Database → Rules** in the Firebase console, paste the new [`database.rules.json`](database.rules.json) and click **Publish**. If you deployed the notification code, run the Cloud Shell deploy step again so "thinking of you" taps buzz the phone.

## Putting it in the app stores (optional)

You don't need this: adding the site to the Home Screen already makes it behave like an app. If you'd like a real store listing:

**Android (Google Play)**: one-time $25 developer fee.
1. Go to [pwabuilder.com](https://www.pwabuilder.com), enter the site address and click **Start**. The manifest, icons, screenshot and offline support are already set up.
2. Choose **Package for stores → Android**, keep the defaults and download the package. It contains an `.aab` file and a signing key; keep the key safe, because every update needs it.
3. In the [Play Console](https://play.google.com/console), create an app, upload the `.aab` under **Testing → Internal testing** first (so just the two of you can install it), then fill in the store listing.
4. PWABuilder's download includes an `assetlinks.json` file. Put it in this repo at `public/.well-known/assetlinks.json` and push, so the app opens without a browser bar.

**iPhone (App Store)**: needs a Mac with Xcode and the $99/year Apple Developer Program. In PWABuilder choose **iOS**, open the downloaded project in Xcode, and upload it from there. Apple sometimes rejects apps that are mostly a website, so the Home Screen route is the easy option on iPhone.

If you add a store listing, Google sign-in also needs the app's package domain added under **Authentication → Settings → Authorized domains**.

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
- `src/net.js` handles Firebase sign-in, saving, homes, live presence, letters, the album, goals and notifications.
- `functions/index.js` is the server code that sends phone notifications.
- `src/main.js` holds the pet simulation, the interface and multiplayer.
- `public/` holds the page, styles, icons and the offline service worker.

Without a Firebase config the game still works fully offline and saves in the browser.
