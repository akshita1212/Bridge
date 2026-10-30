// Shots for tools/snap.mjs: each one opens a route, answers its API reads with sample data, runs actions, and freezes it.
// node tools/snap.mjs shots/example.mjs --origin http://localhost:8765
//
// Fields: name (snap/<name>/), path, w × h (the viewport: desktop 1470 × 860, phone 390 × 800), scheme ("dark" | "light"),
// api(url, method, request) → a JSON-able answer, or { __status, __body }, or { __raw, __type }, or undefined to let it
// pass, auth (false = no stored sign-in), init (a script run before the page), wait (ms after load), actions(page).
import { api } from "../data/sample.mjs";

export default [
  { name: "app", path: "/index.html", w: 1470, h: 860, scheme: "dark", auth: false, api, wait: 1200 },
];
