# Posting a finished video (push, connect, unpublish)

vfrey posts through the platforms' official APIs, from the person's own machine, to accounts the person connected. Nothing posts by itself except a **live** series on autopilot. Every post carries the platform's AI label.

## What posting needs

`npx vfrey push` works; it is not disabled. It needs two things: the person's own YouTube developer app connected with `npx vfrey connect youtube --own-app` (vfrey's own apps are off for now), and a series that is **live** (`desk series live --id <id> --confirm <channel id>`: a new series is a dry run and uploads nothing). `push` itself asks before it posts: it prints the plan and exits 2 until you rerun it with `--yes` after the person says yes to that video. Posting from the person's machine costs no credits.

## The rule

**Never push, schedule or unpublish without the person's explicit yes for that specific video.** A yes to one video is not a yes to the next. Run `--dry-run` first, show them the plan it prints (where, how visible, when, the AI label), ask, and only after they say yes run the same command with `--yes`. Never add `--yes` on your own, and never set a video public (`--public`) unless they asked for public.

## Accounts (the bank)

Every connected social account lives once in the person's accounts bank: many per platform (two YouTube channels, three TikToks). A series posts to the accounts it picks. `npx vfrey connect list` shows each account (id, platform, name, @handle, state, series). `npx vfrey desk series targets <series id>` lists the accounts a series posts to; `--add <id|@handle>`, `--remove <id|@handle>` and `--visibility <id|@handle>=private|public` change them (Instagram and Facebook are always public). To add a second account, run `connect` again and have the person pick the other account on the platform's sign-in page; do not sign in for them. Pictures are saved locally; never paste or print a picture link or token.

## Connect (once per account)

`npx vfrey connect list` shows who is connected and whether the sign-in still works.

`npx vfrey connect youtube|tiktok|instagram|facebook --own-app` opens the platform's sign-in in the browser (relay the link it prints if no browser opens). It needs the person's own developer app: its client id and secret go on the dashboard Keys page (or `GOOGLE_CLIENT_ID`/`SECRET`, `TIKTOK_CLIENT_KEY`/`SECRET`, `META_APP_ID`/`SECRET`), and the redirect address `http://127.0.0.1:47615/oauth/callback` must be registered in that app. Nothing needs setting up for the encryption key: vfrey makes one on first use and keeps it in the macOS Keychain or Linux Secret Service (else a private file in the vfrey folder), and `CREDENTIALS_KEY` in the environment still wins when set. Tokens are encrypted with it and never printed. On the dashboard, Publish, Accounts walks the person through the developer-app keys and the sign-in in one flow. Never ask the person to paste a token into chat.
- Without `--own-app`, vfrey asks the console to broker the sign-in. While the console does not, the command stops with a `Fix:` line saying to use `--own-app`. Relay it.
- Facebook and Instagram: if the login manages several Pages, rerun with `--page <id>`. Instagram needs a Business or Creator account linked to a Page. Connections made through vfrey (without `--own-app`) use Instagram Login instead, which needs no Page; with your own app, `npx vfrey connect instagram --own-app --instagram-login` does the same (paste the Instagram app id and secret from the app's Instagram API setup with Instagram login on the Keys page).
- `npx vfrey connect remove <id|@handle>` removes one account (its tokens and series links go; posts already made stay). Ask first.
- Without `--series`, a project with one series gets the new account as a target; with several it lands in the bank only and the output says to run `desk series targets <id> --add <account>`.
- A TikTok app that has not passed TikTok's audit can only post privately. Say so. A Google app left in "Testing" loses its sign-in after 7 days; the fix is the consent screen set to "In production". `connect list` shows "sign-in ends <date>" where the platform says one (Instagram, TikTok) and the Google test-app line for YouTube; 7 days and 1 day before an end the desk writes a warning with the reconnect command, so run `npx vfrey connect <platform>` then, not after a post fails.

## Push

`npx vfrey push <run id or video file> [--to youtube,tiktok] [--account <id|@handle> ...] [--schedule 2026-11-02T18:00 --tz Asia/Ho_Chi_Minh] [--private|--public] [--dry-run] [--yes]`
- **Pick accounts with `--account`.** `--to youtube` uses the series' YouTube accounts; if the series posts to none of several YouTube accounts the command exits 2 and lists them: ask the person which, then pass `--account`. With neither flag it posts to every account the series posts to. Each account is its own post. Name the accounts in the plan you show the person, and never push without their yes for those accounts.
- Ids and files: `npx vfrey videos`. A run still waiting for review or without an mp4 cannot be pushed.
- **Questions first (exit 2, a `?` line).** The first push asks the description and the cover. Ask the person, then pass `--description auto` or `--description-text "their words"`, and `--thumbnail same`, `--thumbnail generate` or `--thumbnail-file <image>`.
- Visibility: private on YouTube and TikTok unless `--public`. Instagram and Facebook posts are always public (`--private` is refused for them), so say that before asking for a yes.
- Schedule: local time in an IANA zone (`--tz`, default the series' zone), never a UTC offset. YouTube publishes a scheduled video itself, and it becomes public then (needs `--public`). TikTok, Instagram and Facebook post from this machine at that time on the next tick after it (the background worker or `npx vfrey tick`), so say the machine must be running. On a daylight-saving day a time that does not exist is moved forward and one that happens twice uses the first; the plan says so.
- AI label on every post: YouTube `status.containsSyntheticMedia`, TikTok `is_aigc`, Instagram `is_ai_generated`, Facebook a `#AIgenerated` line in the description. It cannot be turned off.
- `npx vfrey push list` shows what posted, what waits (`will post at ...`) and what is paused.

## When a sign-in expires

A refused or expired token pauses that account; the job does not fail and the other accounts carry on. The command and the dashboard say `Reconnect TikTok <name>: ... Fix: npx vfrey connect tiktok (sign in as @handle)`. Relay it. After the reconnect, the waiting posts go out on the next tick. Autopilot skips only that account until then.

## Take a post down

`npx vfrey unpublish <run id> --from youtube|facebook [--account <id|@handle>] [--hide] --yes` (ask first; it is not undone). YouTube deletes, or `--hide` sets it private. Facebook deletes. TikTok and Instagram do not allow deleting through their API: the command says so and prints the link; tell the person to delete it in the app. The run keeps its history.

Exit codes: `0` done, `1` refused or failed (a `✗` line and a `Fix:` line), `2` a question to ask. Never name the data provider.
