# craigmcnaughton portfolio — session notes

## Completed (2026-05-02)

- Audited all `portfolio__attributes` badge lists in `src/pages/index.html` against actual project `package.json` files
- Updated badges for 6 projects:
  - **currency**: Webpack → Vite; removed Sass (no SCSS in project)
  - **markdown**: Gulp → Vite; JavaScript → TypeScript
  - **unixtime**: Tailwind CSS → FontAwesome (Tailwind not in package.json)
  - **colours**: Full stack refresh — replaced HTML5/CSS3/JS/Nunjucks/Gulp with React/TypeScript/Sass/Vite
  - **words**: Gulp → Vite
  - **order**: HTML5/JavaScript → React/TypeScript

## Completed (2026-05-20)

- Added **sudoku** portfolio section to `src/pages/index.html` as the last entry
  - Description: browser-based Sudoku game, four difficulty levels, pencil marks, undo, hints, timer
  - Tech badges: TypeScript, Vite, Vitest
  - Screenshot: `src/img/sudoku.png` added
- Removed all `section--alt` from individual `<section>` elements — `<main class="sections--alternating">` handles the alternating pattern via CSS; per-section modifier was redundant

## Next / In Progress

- None

## Key Decisions

- Kept **AWS badge on currency** — project uses a custom AWS API Gateway reverse proxy for an HTTP-only exchange rate API
- Replaced HTML5/JavaScript with React/TypeScript for projects that had fully migrated (colours, order) rather than adding alongside the old badges
- Dropped `section--alt` per-section modifier in favour of the parent `sections--alternating` class — cleaner, single source of truth for the alternating style

## Open Questions

- None currently
