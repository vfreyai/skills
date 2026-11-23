# Post and comments: helpers

Code patterns for `starter.html` next to this file. Paste them into the scene's `<script>`; they use the starter's `$`, `tl`,
`cards` and `starts`.

## Where the post comes from

```bash
# A Reddit post: a vfrey research run on this machine first, else Reddit's own API or public JSON. Writes index.html and post.json.
npx vfrey styles start post-comments scenes/<idea> --source https://www.reddit.com/r/<community>/comments/<id>/<slug>/ --comments 4

# From research to video: collect posts and their comments with vfrey search (it costs credits: --quote, then ask the person),
# read DIR/summary.md, pick one post, and start the scene in the folder that holds the run (no second read, no network).
npx vfrey research run --plan plan.json --quote
npx vfrey research run --plan plan.json --max-credits N --out research/<name>
npx vfrey styles start post-comments scenes/<idea> --source <a post url from research/<name>/summary.md>
```

A research plan that collects a thread: a `posts` step on reddit or threads, then a `comments` step for the posts you keep
(`npx vfrey research --help` lists the ops). Threads posts can only come from a run like this.

`post.json` holds what the scene shows: `platform`, `community`, `author`, `title`, `body`, `score`, `commentCount`,
`comments[{author, text, score}]`, `credit.onScreen`, `credit.description`, `via` and `notes` (what was trimmed or left out).
Read the notes: they say which comments were dropped and which personal details were removed.

## The script around a thread

```json
{
  "title": "<your title: the question the thread answers>",
  "hook": "<your own framing of the thread>",
  "lines": [
    "<your own framing of the thread>",
    "<the post title, as written>",
    "<the post body, or its first part>",
    "<the first comment's opening words, then the comment>",
    "<your one-line link between the comments>",
    "<the next comment>",
    "<your takeaway, in your own words>"
  ],
  "hashtags": ["#reddit", "#askreddit"],
  "credit": "Source: a public Reddit post by u/<handle> in r/<community>, https://www.reddit.com/r/<community>/comments/<id>/"
}
```

The starter shows a comment card when a spoken line starts with that comment's first three or four words. If your lines
introduce a comment first ("The top answer:"), keep the introduction in its own line, or set `SHOW`.

## Set the card times yourself

```js
// One entry per card: the post, then each comment. The value is the index of the spoken line it appears on.
const SHOW = [0, 3, 5, 7];
```

## Two posts in one video

```js
// Call after the first post's cards: slide the whole stack up and bring in a second post card from window.POST2.
const at2 = vfrey.line(8).start - 0.2;
tl.to("#stack .card", { y: "-=300", opacity: 0, duration: 0.6, ease: "power3.inOut" }, at2);
// ...build the second post's cards with card("post", ...) and time them from at2 the same way.
```
Credit every post: a second credit bar line and a second sentence in `credit`.

## Highlight the spoken words on the card

```js
// Mark the sentence being read on the card with the accent underline (.hl), from the line's start to its end.
function highlightLine(cardEl, lineIndex) {
  const t = cardEl.querySelector(".text, .body");
  const L = vfrey.line(lineIndex);
  tl.set(t, { className: (t.className.includes("hl") ? t.className : t.className + " hl") }, L.start);
  tl.set(t, { className: t.className.replace(/\s*hl/, "") }, L.end);
}
```

## Cues for the sound bed

```js
// Print these from the scene once (console.log) and save as scenes/<idea>/cues.json for make-bed.py.
const cues = { pop: starts.slice(1).map((t) => Math.max(0.2, t - 0.05)), swish: [Math.max(0.2, starts[1] - 0.15)], tick: [starts[starts.length - 1]], duration: vfrey.timing.durationSec };
```

## Threads

`window.POST.platform === "threads"` switches the accent to `#7b61ff` and the platform mark to `@`. There is no community:
the credit reads `@handle on Threads`. Threads replies come from the research run's comments.
