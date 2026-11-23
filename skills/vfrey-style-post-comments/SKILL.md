---
name: vfrey-style-post-comments
description: "Use when the chosen video style is Post and comments (vfrey-style-post-comments), or the person asks for a Reddit story, a Threads post with replies, 'read this thread', an AskReddit-style answers video or a post-and-comments short. Teaches how to source one public post and its top comments through vfrey only (never a logged-in scrape), credit the poster on screen and in the description, and build, animate and score clean post and comment cards read out with captions in a vfrey HTML scene, for any topic."
allowed-tools: Bash Read Write
version: 1.0.0
license: Proprietary
metadata:
  product: vfrey
  category: style
  style-name: Post and comments
  style-summary: A public Reddit or Threads post and its top comments as clean cards, read aloud with captions and credited on screen.
  style-best-for: reddit stories, askreddit answers, threads replies, community opinions, story time, hot takes
  style-poster: post-comments.jpg
  style-preview: post-comments.mp4
---
<!-- style-bible: v2 -->

# Video style: Post and comments

This file teaches a look and a sourcing rule, never a topic. Apply it to the scene you write (`scenes/<idea>/index.html`, HTML + CSS + GSAP, engine `vfrey-render`); the script and the framing words are yours, the post and comments are the poster's and the commenters'. The vfrey skill's `scenes/craft.md` still holds for everything not said here. Start the scene with `npx vfrey styles start post-comments scenes/<idea> --source <post url>`: it reads the post, writes it into `index.html` (from `starter.html` next to this file) and into `post.json`, and prints the credit lines. Code patterns are in `helpers.md` next to this file; the music script is `make-bed.py` next to this file.

Script pace: size the script from a voice sample, as `voice.md` in the vfrey skill says (`lineGap`; sample with `npx vfrey voice sample <voice> --script <file> --no-browser` and size the script by the words a second that sample prints for your voice).

## The sourcing rules (read before anything else, and follow every one)

1. **Only vfrey reads the post.** `--source <url>` takes the post from a vfrey research run on this machine first (`npx vfrey research` with a post-comments step; free to read again, it was already paid for), then from Reddit's own read endpoints (Reddit's API when `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are set, else the public JSON of the post). Threads posts come only from a research run. Never open a browser session, never log in, never scrape a page, never write your own fetcher, never copy text out of a screenshot.
2. **Public posts only.** No private, members-only, quarantined or age-gated community; no direct messages; no screenshots someone sent the person.
3. **Skip NSFW, deleted and removed.** `--source` refuses an NSFW (over 18) post and a deleted or removed one, and drops deleted, removed, pinned, moderator and bot comments. Do not add them back by hand. A comment that is cruel about a private person, sexual, or about a minor: leave it out too.
4. **Trim personal details.** `--source` removes e-mail addresses, phone numbers, links and "my name is ..." from every text. Read the rest yourself and also remove any full name (unless it is the public handle), street, workplace, school, licence plate or face description of a private person, in the script and on screen.
5. **Credit on screen, all film.** The starter's credit bar shows `window.POST.credit.onScreen` ("r/community, u/handle on Reddit", or "@handle on Threads") from the first frame to the last. Each card shows its author's handle. Never hide, shrink or cover them.
6. **Credit in the description.** Put the line `styles start` printed into the script as `"credit": "Source: a public Reddit post by u/handle in r/community, <url>"`. vfrey adds it to the end of the description. The `frames.credit` check fails a video that reads a post (its scene holds `post.json`) and is not credited on screen and in the description.
7. **Add something of your own.** YouTube, TikTok and Instagram treat a post read word for word with nothing added as reused or unoriginal content. Your hook frames the question, you react or connect the comments between them, and your last line is your own takeaway. Read the post and comments faithfully (do not change what someone said), but trim long ones. Never present a comment as fact; say "one person said".
8. **No impersonation, no fakes.** Never invent a post, a comment, a score or a handle, never edit what someone wrote to change its meaning, and never use the platform's logo: the cards are a neutral design, not a copy of the app.

## Plan before coding

The three rules every vfrey style follows (a film that breaks them reads as dead air; `frames.still` fails an 8-second hold and `frames.numbers` a number the script does not say):
1. **Change the hero picture on every script line, and finish the change before that line ends.** No hold past 3 seconds; a long line gets a second or third beat. Do not plan in acts of several lines: one line, one change.
2. **The only numeral on a frame is the one that line says.** A count-up must not pass through other values while a different number is spoken: show the figure whole, on its line, and take it away before the next.
3. **Frame 0 already shows a whole word and a picture of the first noun.** Nothing is still entering: no half-typed title, no cut-off glyph, no counter at 0.

Keep scene graphics out of the bottom-right corner: the burned-in `AI-GENERATED` label owns it (about 322 x 58 px, right margin 72, bottom margin 56).

## 1. The look in three sentences, and the signature traits

One clean white post card floats on a dark, softly glowing ground, the title large and bold, the body below, the score and comment count under it. As the voice reaches each top comment, the post folds up to its header and the comment card rises in beneath it on a thread line, one at a time. A credit bar at the top names the community, the poster and the platform all film, and a white caption plate holds the spoken words in vfrey's caption band.

Signature traits (each checkable on a frame):
1. Ground `#0f1218` with a warm glow top-left and a cool glow bottom-right, never flat black.
2. White cards, radius 34, soft deep shadow; nothing else is white except the caption plate.
3. A credit bar at y 212: a round platform mark and the credit text in white on a translucent pill.
4. Every card has an avatar circle with the handle's first letter, the handle in 32 px bold, a muted line under it.
5. The post title 40 to 56 px 800 weight; body 32 to 40 px; comment text 34 to 46 px 600 weight.
6. ONE accent `#ff6a3d` (Reddit) or `#7b61ff` (Threads): score arrows, glows, and (darkened) the caption chip.
7. Only one comment card on screen at a time, under the folded post.
8. The score line under each card (`▲ 8.1k`), the comment count on the post.
9. The caption plate is white, one line, active word on an accent chip.
10. Nothing readable sits below y 1200 except the captions.

## 2. Palette

| Role | Hex | Use |
|---|---|---|
| Ground | `#0f1218` to `#0b0d12` | backdrop gradient |
| Warm glow | `rgba(255,106,61,.22)` | top-left radial |
| Cool glow | `rgba(90,120,255,.16)` | bottom-right radial |
| Card | `#ffffff` | post and comment cards |
| Ink | `#14171f` | titles, comment text |
| Body | `#2b3040` | post body |
| Muted | `#6b7385` | handles' second line, meta |
| Accent | `#ff6a3d` / `#7b61ff` | score arrow, platform mark, glows |
| Caption chip | `#c9431b` / `#5b45d6` | the accent darkened, so the white active word reads at 4.5:1 |
| Avatars | `#e48a5c #5aa6a0 #9a7bd8 #d0698a #5c8fd6 #7aa35a` | only on avatar circles |

Ratios: dark ground at least 45% of the frame; white at most 45%; accent under 5%. Never use: the platforms' logos or exact app colours for the cards, red or green "good/bad" labels, a second accent. `brand.json` wins for the accent: swap the one value.

## 3. Shapes and line

- Cards: left 50, width 890 (inside the safe area 50 to 940), radius 34, padding 34/38, shadow `0 30px 80px rgba(0,0,0,.45), 0 4px 14px rgba(0,0,0,.25)`.
- Avatars 72 px circles; credit bar 72 px tall, radius 36, 2 px border `rgba(255,255,255,.16)`; platform mark 50 px circle in the accent.
- Light from above: shadows fall down only. No borders on cards. No texture on cards; the ground has two soft radial glows and one moving white glow.

## 4. Characters and objects

There are no characters. People are avatar circles with a letter, and their handles. Objects:
1. Post card: head (avatar, handle, "r/community, Reddit"), title, body, meta row (score, comment count).
2. Comment card: head (avatar, handle, "Top comment"), text, meta (score).
3. Credit bar: platform mark ("R" or "@") and `POST.credit.onScreen`.
4. Caption plate: white stadium in the caption band.

## 5. Typography

Google Sans Flex (fallback "Baloo 2", sans-serif) for everything. Sizes step down with the text's length (the starter's `fit`), never below 32 px on a card:

| Role | px | weight | colour |
|---|---|---|---|
| Post title | 40 to 56 | 800 | ink |
| Post body | 32 to 40 | 400 | body |
| Comment text | 34 to 46 | 600 | ink |
| Handle | 32 | 800 | ink |
| Where line | 26 | 600 | muted |
| Meta | 28 | 800 | muted, arrow in accent |
| Credit bar | 30 | 700 | white |
| Caption | 62 | 800 | ink, active word white on accent chip |

Sentence case, as the poster wrote it (fix nothing but personal details). Caption plate: `rgba(255,255,255,.97)`, radius 40, left/right 36, height 205, top = `captionBox.top + captionBox.height - 180`, one line (`maxWords: 3`).

## 6. Composition

- Safe area: credit bar at y 212, cards between y 320 and y 1200; the plate owns the caption band at `--vf-caption-at`; the bottom-right 322 x 58 corner stays clear for the `AI-GENERATED` label.
- Full frame around the caption band: the dark ground and its glows run to the bottom edge behind the plate; nothing is cut off at any edge.
- The post card starts centred near the top (y 320) at full size, large enough to read on a phone; when the first comment arrives it folds to its head and title (scale 0.9) and the comment sits at y 700 under it.
- Long text: `--source` keeps comments to about 70 words; the card shows the start and the voice can read on. A body longer than about 80 words: show the first part on the card and read the rest, or split it over two cards.

Named shot types:
```
A  Post hook            B  Fold + comment         C  Next comment          D  Takeaway
[ credit bar   ]        [ credit bar   ]          [ credit bar   ]         [ credit bar   ]
[ POST CARD    ]        [ post head    ]          [ post head    ]         [ post head    ]
[ title        ]        [ | comment 1  ]          [ | comment 2  ]         [ | last card  ]
[ body, meta   ]        [ | text, meta ]          [ | text, meta ]         [   (holds)    ]
[ plate ]               [ plate ]                 [ plate ]                [ plate ]
```

## 7. Motion

Calm and readable: the words are the picture.
- Post in: from y +60, scale .96, opacity 0, 0.6 s `power3.out` at 0; credit bar drops in 0.5 s.
- Fold: body and meta collapse (height 0) 0.5 s `power3.inOut` while the card scales to 0.9 from its top.
- Comment in: from 140 px lower and scale .97, 0.6 s `power3.out` with a light `back.out(1.6)` on scale, 0.15 s before the voice reads it.
- Comment out: lifts 60 px and fades 0.35 s `power2.in` just before the next comes in.
- Ambient: the white glow drifts 60 px and grows 15% over the whole film (one tween), and the whole stack leans in (scale 1.03, up 14 px) over the film.
- Reading: each word of the card being read turns from grey `#8e95a6` to ink as the voice reaches it, with a short accent marker under the spoken word (0.2 s `power2.out`). It keeps a long post or comment moving under the voice, so `frames.still` (8 s of one picture while the voice speaks) never fails the starter; keep it, or give a long hold another motion.
- Holds: a card stays until the next one; at least 2.5 s each. Cut long threads rather than flash cards.
- Forbidden: typing the text letter by letter, shaking cards, `repeat: -1`, flashing, spinning, cards flying across the caption plate.

## 8. Transitions

1. Post to first comment: the fold (above). 2. Comment to comment: lift-out, rise-in. 3. A second post in one video: the whole stack slides up 300 px and fades in 0.6 s, the new post rises in. Forbidden: hard cuts, wipes, zoom blur, glitch.

## 9. Sound

A soft lo-fi bed: warm electric-piano chords on 4-second bars, a muffled kick and a brushed hat, about 82 BPM, never busy. Accents: a soft `pop` when a card rises in, a `swish` on the fold, a `tick` on the last card. Mix: bed volume -14 in the script (vfrey normalises to -14 LUFS), quieter than the voice; if `audio.voice-clear` warns, lower `volume`.

vfrey has no built-in music; it mixes a track you give it (the vfrey skill's `music.md`). `make-bed.py` needs only `python3` (standard library) and always writes the same file for the same input.
1. Make the video once without music so `vfrey/timing.json` holds the real voice times.
2. From the project folder: `python3 "$(npx vfrey styles path post-comments)/make-bed.py" --timing scenes/<idea>/vfrey/timing.json --out music/<idea>-bed.wav` (add `--cues scenes/<idea>/cues.json` with your card times; format at the top of `make-bed.py`).
3. Add to the script: `"music": {"file": "music/<idea>-bed.wav", "source": "generated:make-bed.py (vfrey post and comments style)", "volume": -14, "duck": false}` and make it again with `--rerender`.
One pass instead: `--duration 45` with no `--timing` writes a bed with no accents before the first render. No `python3` (`python3 --version` fails): leave `music` out, say the video has no music and why, install nothing unasked.

## 10. Shot plan template (30 to 50 s)

| Time | Beat | Shot | Script line |
|---|---|---|---|
| 0 to 4 s | Hook: your framing | A post hook | your own question or claim about the thread |
| 4 to 12 s | The post | A | read the title, then the body (or its first part) |
| 12 to 20 s | Top comment | B fold + comment | "The top answer:" then the comment |
| 20 to 34 s | More comments | C | one line of yours linking them, then each comment |
| 34 to 40 s | Takeaway | D | your own conclusion, a question to the viewer |

The starter matches each card to the first spoken line that starts with that card's first words, so write those lines as the comment begins; or set `SHOW = [0, 3, 5, 7]` (the line index each card appears on).

## 11. Reference frames

Saved in this style's package folder, not installed into projects (the recipe in your project is `starter.html`): look at them before drawing.
- `ref-1.jpg`: post hook. Copy the large post card, the credit bar, the plate.
- `ref-2.jpg`: fold. Copy the post folded to head and title, the first comment under it.
- `ref-3.jpg`: second comment. Copy one comment at a time, avatar colour changing.
- `ref-4.jpg`: last card held, glow drifted.

## 12. Reference implementation

`starter.html` next to this file is a working scene: credit bar, post card, comment cards, the fold, caption plate. `styles start --source` replaces the demo post between `/* POST:BEGIN` and `POST:END */` with the real one; without `--source` the demo text stays, and the `frames.starter-text` check fails it. Check a frame with `npx vfrey render --scene scenes/<idea> --script scripts/<idea>.json --frame <t> out.png`.

## 13. Do, don't, and the final checklist

Do:
1. Source with `styles start post-comments --source <url>` only.
2. Keep the credit bar and every handle on screen.
3. Put the printed `credit` line in the script.
4. Frame the thread in your own words first and last.
5. Read comments faithfully; trim, never change their meaning.
6. Keep one comment on screen at a time.
7. Keep card text 32 px or larger.
8. Captions sit on a plate: white, same place all film.

Don't:
1. Read a private, NSFW, deleted or removed post, or fetch it any other way.
2. Show a full name, address, workplace or school of a private person.
3. Invent or edit a post, comment, score or handle.
4. Use a platform's logo or copy its app screens.
5. Put a card under the caption band or the AI label corner.
6. Leave the demo PLACEHOLDER text in.

Final checklist on the 12-frame contact sheet (`ffmpeg -v error -y -i "videos/<file>.mp4" -vf "fps=12/<seconds>,scale=270:480,tile=6x2" -frames:v 1 -update 1 contact.jpg`; also check stills at each card's start):
- Credit bar readable in every tile, with community, handle and platform.
- Cards white on the dark ground, one comment at a time, text large and inside the safe area.
- Every handle is a public handle; no personal details on any card.
- Caption plate white, same place in every tile, active word on an accent chip.
- The description ends with the credit line (`frames.credit` passes).

Pitfalls: a very long post body shrinks to 32 px and still runs past its card: show part of it. Fonts load late, so sizes come from text length, not measuring. `frames.text-overlap` may warn where the plate covers the ground glow (intended).
- Numbers on screen (scores, counts) are the post's own; never round them up in the script. The score line is marked `data-vfrey-keep`, so `frames.numbers` does not ask the voice to say it; any other figure you put on screen must be one the script says.
