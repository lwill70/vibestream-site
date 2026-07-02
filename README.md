# VibeStream Website

Modern creator streaming dashboard — fully free, no subscriptions.

## Local Preview

1. Open this folder in VS Code.
2. Run a local server:

```bash
python -m http.server 5500
```

3. Open: `http://localhost:5500/index.html`

---

## Deploy FREE on GitHub Pages (Recommended)

### Step 1 — Push to GitHub

1. Create a free account at https://github.com
2. Create a **new public repository** named `vibestream-site`
3. Push this folder:

```bash
git init
git add .
git commit -m "VibeStream site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vibestream-site.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**, Folder: **/ (root)**
5. Click **Save** — GitHub will build your site in ~1 minute

---

## Connect Your GoDaddy Domain (vibestream.co.za)

### Step A — Add DNS records in GoDaddy

1. Log in to https://godaddy.com → **My Products** → **DNS** next to vibestream.co.za
2. Delete any existing **A** records for `@` (root)
3. Add these **4 A records** (all pointing `@` to GitHub's IPs):

| Type | Name | Value           |
|------|------|-----------------|
| A    | @    | 185.199.108.153 |
| A    | @    | 185.199.109.153 |
| A    | @    | 185.199.110.153 |
| A    | @    | 185.199.111.153 |

4. Add a **CNAME record** for `www`:

| Type  | Name | Value                                      |
|-------|------|--------------------------------------------|
| CNAME | www  | YOUR-USERNAME.github.io                    |

> Replace `YOUR-USERNAME` with your actual GitHub username.

5. Set TTL to **1 Hour** for all records, then **Save**

### Step B — Add custom domain in GitHub

1. In your GitHub repo → **Settings → Pages**
2. Under **Custom domain** enter: `www.vibestream.co.za`
3. Click **Save**
4. Tick **Enforce HTTPS** once it appears (may take 10–30 min for DNS to propagate)

### Step C — Verify

After 10–30 minutes open https://www.vibestream.co.za — your site will be live.

---

## Notes

- All data (uploads, queue, comments, profile) is stored in the browser's localStorage.
- Uploaded audio/video files play directly in the browser — no server needed.
- The **Go Live** button requests your real webcam or screen via the browser.
- The **Invite Creator** button copies the domain URL or uses the native share sheet on mobile.
- Profile edits are saved locally and persist across sessions.
