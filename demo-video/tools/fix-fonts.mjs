// After tools/snap.mjs: point every frozen screen at the locally saved fonts (snap/assets/fonts/local.css).
// The film renders with the network blocked, so Google Fonts must be local, and an @import only works as the
// stylesheet's first rule. Run: node tools/fix-fonts.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const IMPORT = '@import url("../assets/fonts/local.css");';
const snap = path.join(ROOT, "snap");
for (const name of fs.readdirSync(snap)) {
  const file = path.join(snap, name, "style.css");
  if (!fs.existsSync(file)) continue;
  let css = fs.readFileSync(file, "utf8");
  css = css.replace(/@import url\("https:\/\/fonts\.googleapis\.com\/css2[^"]*"\);?/g, "").split(IMPORT).join("");
  fs.writeFileSync(file, IMPORT + "\n" + css.replace(/^\n+/, ""));
  console.log("fonts →", name);
}
