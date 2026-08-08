# Skool Layout Fix

Chrome/Edge extension for making Skool classroom pages usable on desktop.

What it does:

- moves the classroom layout left so empty gutter space is used
- widens the navigation sidebar
- makes the lesson video substantially larger
- keeps lesson text readable below the video
- adds a sidebar hide/show toggle

## Files

- `manifest.json` — MV3 extension manifest
- `content.js` — content script for DOM tagging and sidebar toggle state
- `content.css` — layout overrides for Skool classroom pages

## Load locally

1. Open `chrome://extensions` or `edge://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select this folder
5. Refresh the Skool classroom tab

## Usage

- Open a Skool classroom lesson page
- Use the floating `Hide` / `Show` button in the bottom-left corner to collapse or restore the sidebar
- Sidebar state is remembered in local storage

## Notes

- The current selectors are tuned for the Skool classroom DOM observed during development on August 7, 2026
- If Skool changes their generated class names or wrapper structure, the extension may need selector updates
