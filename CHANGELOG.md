# Changelog

## v0.6.1

- Replaced the detailed house-and-checklist favicon with a simpler house-and-checkmark mark.
- Made the checkmark the left slope of the roof.
- Added a transparent SVG favicon and regenerated transparent 16px, 32px, 48px, and ICO browser icons.
- Regenerated Apple touch and Android/PWA icons with the same approved mark on a quiet rounded tile.
- Updated cache-busting references and the application version to `0.6.1`.
- Preserved the uploaded `chore_list.js` without modification.

**Why this release mattered:** The new mark remains legible at favicon size and gives Chorey a simpler, more distinctive identity without changing the application itself.

## v0.6.0

- Added the house-and-checklist visual identity.
- Added browser favicon, Apple touch icon, and 192px/512px app icons.
- Added `site.webmanifest` for installable-app metadata and future PWA work.
- Added a dedicated application version constant separate from storage schema version.
- Displayed the app version in the hidden developer menu.
- Added version query strings to CSS, JavaScript, icons, and manifest references to reduce stale GitHub Pages caching during development.
- Documented identity, versioning, and the difference between resetting local data and refreshing cached application files.

**Why this release mattered:** Chorey now has a recognizable identity and a repeatable release/versioning system while remaining a simple static GitHub Pages application.

## v0.5.1

- Expanded README with project philosophy and design principles.
- Documented current-cycle data model.
- Added guidance for progressive disclosure and Chorey 2 direction.

## v0.5.0

- Hardened storage and schema migrations.
- Added developer menu and time travel.
- Added person assignment icon.
- Improved scheduler cleanup.
