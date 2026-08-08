# Skool Layout Fix

Browser extension scaffold for making Skool course pages more usable on desktop.

## What exists now

- Manifest V3 extension
- Content script that marks Skool pages for styling
- First-pass CSS overrides to widen layout and media

## What we still need

1. Inspect the DOM structure of an actual Skool course lesson page.
2. Identify stable selectors for:
   - left navigation/sidebar
   - lesson video container
   - lesson text/content block
3. Replace the broad CSS with targeted layout rules.
4. Add an on/off toggle if you want this per-page or per-site.

## Load locally

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select this folder.

## Likely next iteration

The target desktop layout is:

- sidebar on the left
- large video in the primary column
- lesson text either to the right of the video or stacked below it

To finish that cleanly, I need either:

- the page HTML for a lesson page, or
- screenshots plus permission to inspect the page in-browser, or
- a copied DOM snippet from DevTools
