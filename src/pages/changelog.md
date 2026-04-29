---
layout: layouts/page.njk
title: Changelog
permalink: /changelog/
---

# mala-editor

## 0.13.0

### Minor Changes

- 0aa9aba: Add silent auto-update with "Restart to update" prompt in TopBar.

## 0.12.3

### Patch Changes

- 0b65a48: fix(ci): publish releases to public mala-website repo for accessible download links

## 0.12.2

### Patch Changes

- 53e3954: Fix release workflow not triggering after version tag push

  Switch the versioning job to use a PAT (`VERSIONING_TOKEN`) instead of `GITHUB_TOKEN` when pushing the release commit and tag. GitHub Actions does not trigger downstream workflows from pushes made with `GITHUB_TOKEN`; using a PAT causes the tag push to be attributed to a real user, which correctly fires `release.yml`.

## 0.12.1

### Patch Changes

- ce78a09: Add automated release workflow
  - Add `release.yml` GitHub Actions workflow: builds macOS and Windows installers on tag push, creates a GitHub Release with changelog notes, uploads artifacts, and dispatches to the website repo to publish a release post
  - Remove spaces from installer filenames (`MalaEditor-{version}-{arch}.{ext}`) to avoid URL-encoding issues in download links

## 0.12.0

### Minor Changes

- d4fd7da: Add DOCX export; move font, paperSize, chapterNumbering, quoteStyle, and format into a new persisted export section in project.json

### Patch Changes

- 136e14c: Add Open in default app button to unsupported file type view

## 0.11.0

### Minor Changes

- 789e433: Rework export panel UI and manuscript config types
  - Replace `numberChapters`/`smartQuotes`/`primaryQuote` fields in `ManuscriptConfig` with `chapterNumbering` (enum: `none` | `arabic` | `roman`) and `quoteStyle` (enum: `smart-double` | `smart-single` | `straight`)
  - Add `ShellOpenPath` IPC channel so the renderer can open exported files in the OS default application
  - Overhaul `ExportPanel`: editable file-pattern input, font/paper-size/chapter-numbering/quote-style `<select>` controls (replacing checkboxes and radio buttons), and an Open button that reveals the exported file
  - Add CSS classes `export-button` and `export-open-button` to `progress.module.css`
  - `BottomBar` always renders the word-count metric button; shows a book icon as placeholder when no file is open

### Patch Changes

- 60b3aca: Fix race condition in useMenuAction IPC listener registration

  `useMenuAction` was spreading `callback` and `deps` into its `useEffect` dependency array, causing the IPC listener to be unregistered and re-registered on every render. If a `menu-action` message arrived during the gap between cleanup and re-registration it was silently dropped. This manifested as the "close current tab" keyboard shortcut occasionally failing after the export panel was added (which introduced async project-settings loading and more renders).

  Fix: use a `useRef` to hold the latest callback and a `useLayoutEffect` to keep the ref current. The `window.electronAPI.on` subscription is now stable for the lifetime of the `menuAction` value.

- 412b508: Refactor IPC and file-watcher infrastructure.
  - Replace four separate watcher registries with a single `ProjectWatcher` class that uses one recursive `fs.watch` call, eliminating inode-breakage issues on macOS atomic-rename writes.
  - Add typed `sendToRenderer` wrapper with `isDestroyed()` guard.
  - Extract `collectManuscriptFiles`, `parseManuscript`, and `writeDailyStats` into dedicated handler modules; `writeDailyStats` uses a per-project serialisation queue to prevent write races.
  - Rename IPC channels for consistency: `GetRecentProjects` → `ReadRecentProjects`, `GetWordCounts` → `ReadWordCounts`, `UpdateDailyStats` → `WriteDailyStats`.
  - Remove `ProjectSettingsUpdated` push channel; `ProjectSettingsProvider` now re-reads settings via the existing `FileContentUpdated` event when `project.json` changes.
  - Fix unhandled promise rejections in async watcher callbacks (changed `throw err` to `console.error` for non-ENOENT errors that were fired-and-forgotten).
  - Fix E2E focus-mode test: restore `enter-full-screen` event gate to ensure macOS fullscreen animation is complete before `GetFullScreen` is invoked.

## 0.10.0

### Minor Changes

- 6e10d4d: Add daily word count statistics: tracks words written each day in progress.csv with gap-filling, optional daily target, and a "Words Today" section in the Progress panel.
- d03a2eb: Add manuscript export: parses manuscript Markdown files into a structured JSON document. Export panel in the left sidebar lets you configure title, author, quote style, and other options, then export to JSON. The file pattern field is renamed from progressFilePattern to manuscriptFilePattern and promoted to the top level of project.json.
- 41c4514: Move progress targets to project.json in the project root — settings are now portable across machines and can be version-controlled alongside the project.

### Patch Changes

- 2df0f54: Bottom bar word count is now clickable and cycles through file words, project words, and words today. Selected mode is persisted in user settings.

## 0.9.0

### Minor Changes

- a2e06da: Add a line-numbers toggle button to the BottomBar, persisted in user settings, with custom `LineNumbersOn` / `LineNumbersOff` icons.

## 0.8.1

### Patch Changes

- 85d1453: Replace ad-hoc `SpellCheckIcon` with named `SpellCheckOn` / `SpellCheckOff` custom icons and add a barrel `src/renderer/icons/index.ts`.
- aa41c3c: Achieve 100% unit test coverage (statements, branches, functions, lines) across all covered files.

## 0.8.0

### Minor Changes

- c8b1fe6: - Add project-wide find and replace: search all text files with keyboard-navigable results tree, match highlighting in editor, and bulk replace.

### Patch Changes

- e3d14bc: - Refine progress panel styling: slim down progress bar track and remove redundant font-size declarations

## 0.7.2

### Patch Changes

- b5f7bb7: Fix toggleProgress targeting the right panel instead of the left panel where the Progress tab lives
- 4905318: fix: panel resize and tab drag-and-drop work with PDF viewer

  The PDF viewer iframe was swallowing mouse and drag events, preventing sidebar
  resize handles, pane splitters, and tab drag-and-drop from working when the
  cursor moved over the iframe. A `data-interaction-lock` attribute is now set on
  the document element during resize and drag operations, and a global CSS rule
  disables `pointer-events` on all iframes while the lock is active.

## 0.7.1

### Patch Changes

- 7f61e33: Isolate data storage between dev, E2E, and production environments
  - Redirect `userData` to a `-dev` suffixed directory when `NODE_ENV=development`, preventing dev sessions from polluting production data (window state, recent projects, localStorage settings)
  - All E2E test fixtures now launch Electron with an isolated `--user-data-dir` temp directory and clean up after each test
  - Remove `globalTeardown.ts` — no longer needed since all E2E tests use isolated user data dirs
  - Fix focus-mode E2E test leaving fullscreen without cleanup, causing the next test to fail

- 249bd26: Fix menu actions targeting wrong window in multi-window sessions

  Menu click handlers now use the BrowserWindow provided by Electron's MenuItem.click callback instead of a captured reference, ensuring actions like "Open Folder" and "Toggle Left Sidebar" target the focused window rather than always the last-created one.

- 8c00a61: fix: exit focus mode preserves previous fullscreen state

  Exiting focus mode no longer forces the window out of fullscreen when it was
  already fullscreen before entering. A new `GetFullScreen` IPC invoke channel
  queries the current fullscreen state on entry so the exit path can restore it
  correctly. Sidebar toggles that exit focus mode also respect the saved state.

## 0.7.0

### Minor Changes

- 24ce9c9: Add local find/replace to text editors
  - Install `@codemirror/search` and wire search extension into TextEditor
  - Custom React search panel with lucide icons (ArrowUp/Down, CaseSensitive, Regex, WholeWord, Replace, ReplaceAll, ChevronRight/Down)
  - Match case, regex, and whole word toggle buttons
  - Collapsible replace section (hidden by default, expand via chevron toggle)
  - Match count display ("X of Y")
  - Next/previous navigation with arrow icon buttons
  - Replace single and Replace All with icon buttons
  - Search match highlighting using theme-aware CSS variables
  - ⌘F opens find panel, ⌘H opens find panel with replace expanded
  - Each editor pane has an independent search panel
  - Only enabled for editable text files
  - Fix drag overlay z-index to paint above search panel
  - Styled to match light and dark themes

## 0.6.0

### Minor Changes

- ca3351a: Add focus mode button to top bar and multiple bug fixes
  - feat: add focus mode button to the top bar for quick access
  - fix: correct context menu and resize offset when app is zoomed
  - fix: remove list tag from markdown syntax highlighting
  - fix: disable typewriter scrolling and enable scrollPastEnd
  - perf: hide BrowserWindow until ready-to-show to eliminate white flash on startup
  - docs: document commit changes workflow in AGENTS.md
  - chore: update configs, e2e tests, docs, and dependencies

## 0.5.2

### Patch Changes

- 94b65d3: Change default editor font size from 12px to 14px.

## 0.5.1

### Patch Changes

- f57c487: Include `dist/shared/` in electron-builder files so the packaged app can resolve `../shared/ipc-channels`

## 0.5.0

### Minor Changes

- 31c7368: - Add single-word spellcheck with nspell (Hunspell-compatible).
  - Misspelled words are underlined in markdown and plain text files.
  - Right-click or press `Cmd+.` (`Ctrl+.` on Windows/Linux) for spelling suggestions.
  - Per-project custom dictionary and ignore list persisted in spellings.json.
  - Toggle spellcheck from the bottom bar or View menu.
  - Supports EN-GB & EN-US
  - Adds custom icon `SpellCheckIcon`
  - Fix custom words not loaded into nspell on restart (racing effects).
  - Fix stale dictionary persisting when switching to an unsupported language.
  - Fix external edits to spellings.json not picked up by spellcheck.

## 0.4.2

### Patch Changes

- 9821fd4: - Skip pre-commit hook in CI release commit; use `--no-verify` flag.
  - Tweak GHA summary output

## 0.4.1

### Patch Changes

- fb439ef: Add GitHub Actions job summaries for Preflight, E2E, and Versioning jobs.

## 0.4.0

### Minor Changes

- d93baa8: ### New Features
  - **Icon Tabs** — tabbed navigation for left panel (Explorer, Search, Progress) and right panel (AI, Help)
  - **Focus Mode** — hides sidebars, enters fullscreen, restores state on exit (Escape or menu toggle)
  - **Progress Panel** — live word-count tracking with file patterns, per-file and project targets, percentage display, and green highlight when targets are met; refreshes on file save
  - **Undo / Redo** — Edit menu and keyboard shortcuts wired to CodeMirror history
  - **Theme-aware syntax highlighting** — JSON and CSV files use the active editor theme

  ### Fixes
  - Allow collapsing Explorer folders containing the active file
  - Handle ENOENT gracefully when opening a deleted file
  - Exclude apostrophes in contractions from quoted-text highlighting
  - Style tab-panel drag handles to match side panels

## 0.3.4

### Patch Changes

- 2c3921a: Achieve 100% unit test coverage across all metrics (statements, branches, functions, lines).

  Added and expanded tests for `FileTabs.tsx`, `ProjectSettingsProvider.tsx`, `useTabLayoutManager.ts`, `PaneContent.tsx`, and `EditorLayoutContent.tsx`. Unreachable defensive branches annotated with `/* v8 ignore next -- @preserve */` to survive esbuild transpilation.

## 0.3.3

### Patch Changes

- 52b725f: Build out a basic markdown editor with full file management and persistent UI state.

  **Editor**
  - Syntax-highlighted markdown editor with configurable wrap column
  - Theme toggle (One Dark / light) synced across editor and UI chrome
  - App-level zoom (increase / decrease / reset) with menu actions and keybindings
  - Per-tab cursor position and scroll state restored when switching tabs
  - Word count displayed in the bottom bar for the active text file

  **File management**
  - File tabs with dirty indicator, save (Cmd/Ctrl+S), save-all, and close
  - New File / New Folder via menu and context menu in the directory explorer
  - Rename and delete files/folders via context menu
  - Path separator validation on rename/create
  - Internal and inbound file drag-and-drop support
  - Keyboard navigation (arrow keys, Enter) in the directory tree
  - Active file synced between directory tree and file tabs
  - Ctrl+Tab tab-selector overlay with MRU ordering

  **Panels and layout**
  - Resizable left and right panels with 100 px minimum content area
  - Left/right panel toggle buttons in the top bar
  - Resize handle floats over panel edges
  - Unified 34 px top bar, tab bar, and bottom bar heights

  **Persistence**
  - Window size and position remembered between sessions
  - Recent projects list on the Welcome screen
  - Per-user theme and zoom level persisted across sessions
  - Per-project panel widths, visibility, and directory expansion state persisted

  **Other**
  - New Window menu item; IPC handlers scoped per window
  - PDF viewer URL param fixes
  - Sidebar resize update-loop fix
  - Right panel hidden by default

## 0.3.2

### Patch Changes

- 6ba5cd4: Flatten monorepo structure: merge packages/main, packages/preload, and packages/renderer into a single root package under src/

