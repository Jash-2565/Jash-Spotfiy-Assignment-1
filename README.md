# The Soundtrack of Seven Years

An editorial data story built from a Spotify Extended Streaming History export:
98,111 streams between 23 August 2019 and 2 August 2026.

**[index.html](index.html)** is the whole thing — one self-contained page. No build
step, no server, no network calls: open it from disk and it works. Every chart is
hand-drawn SVG and all artwork is inlined as data URIs.

## What's in it

Eight chapters, each with its own colour and sequential ramp:

| | Chapter | |
|---|---|---|
| I | Who you are | the four numbers, one screen each |
| II | The obsession | 369 hours of one artist |
| III | The anthem | the top song, and the life of the top ten |
| IV | Every day | 2,469 listening days as one ring per year |
| V | The records | the eight albums, as records |
| VI | Surprises | eight things the data noticed |
| VII | How it changed | timeline, yearly turnover, eras, library growth |
| VIII | Your week | the hour-by-hour heatmap, and listening habits |

## How it was built

```
build_wrapped.py   exports  ->  wrapped_data.json     the main aggregates
build_extras.py    exports  ->  wrapped_extras.json   the surprises
fetch_covers.py    Spotify oEmbed -> covers.json      artwork, inlined
render_v2.py       template_v2.html + the JSON -> index.html
```

## Notes on the data

- A stream counts at 30 seconds or more of playback, which is Spotify's own
  threshold, so shorter taps sit outside every ranking.
- Timestamps are converted from UTC to IST.
- Spotify re-chunks the entire history on every export, so the files overlap;
  duplicate rows are dropped on the full `(timestamp, track uri, ms_played)` triple.
- The export credits only the album artist, so featured artists are parsed out of
  track titles and offered as a separate view rather than silently merged.
