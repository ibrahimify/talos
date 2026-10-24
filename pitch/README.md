# TALOS finals pitch

The final pitch of team TALOS (4:06), Siemens Healthineers Hackathon 2026, Challenge 2.
A single web page that works like PowerPoint.

## Present

Open the GitHub Pages link (or `index.html` from a downloaded copy; it runs offline) in Chrome or Edge, press `F`.

| Key | Action |
|---|---|
| → · Space · PgDn · Enter · clicker | next step |
| ← · PgUp · Backspace | back |
| `F` | fullscreen |
| `N` | speaker notes for the current slide |
| `B` or `.` | blank (dark) screen |
| `R` · Home | restart · End = last step |
| `A` | the fine print (Q&A only); `A` or any arrow returns to the same step |

Clicking never advances, so a stray click can't skip a beat. The address bar keeps `#slide.step`: reloading
returns to exactly the same step. Going back always shows the finished state of the previous step.

## Teleprompter

`teleprompter/index.html`: the word-for-word script per slide with a 4:06 clock and per-slide targets.
A red `→` marks where to press the key on the deck. Works on a phone or a second laptop.

Alp Eldam presents the full pitch.
The clock allocates 4:06: six seconds on the black opening slide, then the original four minutes. Rehearse with the clips playing to check actual delivery time.

## Edit

- `index.html`: one `<section>` per slide. `data-step="k"` makes an element appear at press k (0 = on entry);
  `data-only="k"` shows it at press k only. `data-note` holds the speaker text.
  `data-auto="ms"` plays all of a slide's steps from one press, one every ms (numbers, nurses and "It fails" slides);
  the next press leaves the slide.
- `deck.css`: colours and type on `:root` (`#0A0A0A`, `#F5F3EE`, `#CC0000`, Inter Tight + JetBrains Mono).
- `deck.js`: the engine and the animated parts (count-ups, the loop dot, the 30-scenario grid). The grid uses the
  real per-scenario outcomes of evaluation set E from the team's paired audit.

Rule for every change: motion only where it explains something; nothing flashes or turns the whole screen bright.

The deck opens on a single word, **Problem.** (`#1.1`), held while the problem is stated in one line before any number appears.
The headline keeps its original wording: **It fails. It learns. It adapts.** People generate data, run training
and choose the model. The numbers slide retains its original colours and focus changes, without number-pop effects.
The closing uses a short, smooth fade and settle. Reduced-motion preferences disable non-essential transitions.
The numbers slide's nurse calls are a team-reported activity, and so is the closing remark that the count after an
operation takes much of the nurses' time (not recorded or quantified). The 173 demonstrations are the total generated dataset,
while the selected round-two model used the earlier 114-episode dataset.

## The FAIL | PASS slide

Plays `media/sim/fail_pass.mp4`: the scored round-1 (left) and round-2 (right) evaluation episodes of scenario
e_002, replayed in Isaac Sim from their recorded actions; each replay ends within 4 mm of the official final box
position (round 1: never picked up; round 2: placed). 74.9 s of simulation in 10 s (7.5x). One clip cut into two
rounded panels, so both halves stay frame-locked; the verdicts appear at the second they become visible. The clip
shows the Siemens Healthineers simulator scene and is published with the permission of the TALOS repository owner
and Siemens Healthineers, as relayed by Alp on 2026-10-24. Other simulator files in `media/sim/` stay git-ignored.
If the clip is missing, the deck skips the slide automatically.

The comparison reports final placement, rather than verified complete handover. The clips are recorded action
replays, not a live inference demonstration. Round two scored 15/30 after changes to both data and training length,
against round one's 4/30, on scenarios that also informed development. People ran the improvement workflow and
selected the model. [Source and limitations](https://github.com/crystalfruit2/siemens_healthineers/blob/main/docs/evidence/host-verification.md).

The webcam extension counts instruments and flags detected contact. The nurses slide names these two features
COUNTING and STERILITY; STERILITY means a possible-touch warning. Its colour state cannot establish biological
sterility. The future-scope slide lists in-and-out counting (count before surgery = count after) and new test scenarios. The count-discrepancy statistic describes events during 19 of 148 observed operations in
[Greenberg et al. 2008](https://pubmed.ncbi.nlm.nih.gov/18650646/), not unresolved counts at the end of surgery.

## Credits

- Inter Tight and JetBrains Mono: SIL Open Font License 1.1 (`fonts/OFL-*.txt`).
- Photo and webcam video: the team's own material, shown with consent.
- Simulator clip: see above.
- QR code: generated offline with qrcode-generator 1.4.4 (MIT, Kazuhiko Arase), error correction M, styled with black
  rounded modules on white. It points to https://github.com/crystalfruit2/siemens_healthineers (code, docs and
  findings). Only the resulting SVG ships.
- No third-party code; no network requests.
