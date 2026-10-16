---
name: receipt-tape
description: "Reel theme: receipt tape. Hard cuts between the speaker full screen with the real background (no cutout) and full-screen dark charcoal desk pages: thermal receipt slips that print out line by line (Space Mono rows with dot leaders), manila data-file cards with tab labels, rubber stamps, barcodes, dashed arrows, mono kicker + Archivo Black headings, and a flickering power-failure blackout. Captions in Archivo with the spoken word on a receipt-paper chip. Ambient electronic music with printer, tear, stamp and beep SFX. No banners or plates. Load it when editing a reel with reel-studio about logs, transactions, databases, recovery, queues or anything ledger-like, or when the user wants cuts instead of a split layout and a dark look."
---

# Theme: Receipt Tape

```
THEME_DIR=${CLAUDE_SKILL_DIR}/theme
```
Pass `THEME_DIR` to reel-studio's `prepare.sh`. The full reference reel is `theme/example/Video.tsx` (How write-ahead logging works, 106 s, 17 cuts, 10 page scenes).

**Identity:** desk #1D1C1A under a warm spotlight with grain, receipt paper #F6F3EA, manila #E8D6AE, ink #1A1A1A, thermal red #D7262E, teal #0E8C7F for success, amber #E8A33B for pending/highlight. Space Mono for receipts and labels, Archivo Black headings, Archivo 800 captions.

## Layout
- `cfg.cuts`: `{a, b, m}` with `m = 'talk' | 'page'`. Talk = the source video full screen, untouched. Page = the desk feeds down from the top with a zigzag torn edge (0.3 s) and feeds back up at its end.
- Scenes play only on pages; several scenes can share one page cut (they crossfade). Content lives between y 140 and y 1570. `Head` puts a red mono kicker ("// THE PROBLEM") and a white title at x 110, y 140 (size 80; keep titles under about 20 characters).
- Captions: talk frames y 1480; page frames y 1610.

## Components (`./theme/kit`)
`Slip x y w h t0 d` (receipt that prints downward), `Row t0 left right rcolor` (types in, dot leaders), `Rule`, `Mono`, `Card label icon` (manila data file), `Stamp text color`, `Arrow` (dashed, draws on), `Barcode`, `Chip`, `Head kicker title`, `Blackout a b label sub` (power failure), `Icon` (Phosphor duotone in public/icons), `Logo`, `At`, `Appear`, `PopIn`. The example adds `DRow` (data row), `Swap` (value change), `Blink`, `DbBox` (logo box) and a generic S3-style `Bucket`.

## Sound
`sound.py`: ambient electronic bed at 100 bpm (pad, soft sub pulse, glassy pluck arpeggio, light clicks). SFX: `print`, `tear` (page in), `whoosh` (page out), `stamp`, `beep`, `powerdown`, `powerup`, `tick`, `pop`, `ding`, `error`.

## Do / don't
- No banners or plates; everything sits on the desk.
- Label example values (LSNs, user ids, balances) as illustrative.
- Keep every title on one line; never leave a single word alone on a line.
