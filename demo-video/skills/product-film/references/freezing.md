# Freezing real screens

`tools/snap.mjs` opens a route in headless Chromium, answers its API reads with sample data, runs actions to reach
the state you want, and saves the DOM plus the stylesheets' source text as a static page in `snap/<name>/`. The film
loads each frozen page into an iframe and animates its own DOM.

## A shot list
```js
// shots/desk.mjs
import { api, LEAD } from "../data/sample.mjs";
const rec = (name, state, tab = "conversation", extra = {}) => ({
  name, path: `/dashboard/leads/${LEAD}/${tab}`, w: 1470, h: 860, scheme: "dark", api: api(state), wait: 6000, ...extra });
export default [
  rec("d-talk", "nocall"),
  rec("d-talk-peek", "nocall", "conversation", { actions: async page => { await page.getByTestId("score-pill").click(); await page.waitForTimeout(800); } }),
  rec("d-menu", "call", "conversation", { actions: async page => { await page.getByRole("button", { name: /More actions/ }).click(); } }),
  rec("d-b1", "call", "conversation", { query: "?action=contract", actions: async page => { /* open the builder, press Continue n times */ } }),
];
```
Fields: `name`, `path`, `w`, `h` (desktop 1470 × 860 fits a 1920 × 1080 film with captions; phones 390 × 800 so a status
bar fits above), `scheme`, `api(url, method, req)`, `auth` (false for public pages), `init` (a script run before the
page), `wait` (ms), `actions(page)`, `apiPrefix` (default `/api/`), `remove` (selectors to delete, default the Next.js
dev overlay).

`api()` returns: a JSON value; `{ __status, __body }`; `{ __raw, __type }` for non-JSON; or `undefined` to let the read
through to the real server. Run with `DEBUG=1` to see every answered and passed-through read.

## One shot per state
Freeze each distinct state as its own page (menu open, step 2 of a sheet, the call expanded), then cross-fade between
them in the film. Small changes inside one state (typing, a counter, a message appearing, a pill changing word) are
done in the film by editing the frozen DOM, which is smoother than swapping pages.

## Sample data
- Build it from the product's own test fixtures where they exist: the shapes match the real API, and the screens
  render the way they really do.
- One subject carried through the whole film. Other rows (the rest of an inbox) can be the website's other people.
- Our side is named for the real team; customers are invented. Never use real customer data.
- A function `api(state)` that returns a different answer per state (`"nocall"`, `"call"`, `"signed"`, `"converted"`)
  keeps one data file for the whole film.

## Never write
`snap.mjs` aborts every non-GET request, answered or not. Keep it that way: a local dev server may be wired to a live
database. If a page needs a write to reach a state, answer the read that shows the state instead.

## Signed-in routes
Save a Playwright storage state from a test account (sign in once with a script, `context.storageState({ path })`)
and pass `--auth auth.json`. Use a test account, never a person's real one, and keep the file out of the film folder and
out of git (a scratch folder), because it holds live cookies. Delete it when the film is done.

## Screens that render on the server from the database
Some tabs read the database on the server, so answering API reads does not reach them. Add a dev-only route in a
throwaway branch or worktree that renders the real client component with sample props (for example
`src/app/dev/demo-film/page.tsx` rendering `<ContractDraftPanel {...sample} />`), freeze that route, and keep a copy of
the route in the film folder (`fixture-src/`). Never merge it.

## Check every freeze
`node tools/check-snap.mjs <name>` renders the frozen page from disk (no server) to `snap/<name>/frozen.png`. Compare it
with `ref.png` (the live screenshot). Common differences and fixes are in `gotchas.md`: missing fonts, an empty panel
(an entry animation), a dropped sticky footer, a select showing the wrong option.

## Small text changes
Fix demo-only text in the film's `init()` rather than in the product: e.g. replace the test account's company name in
the top bar with the sample landlord's, by walking text nodes in the frozen document.
