// Bridge screens for the film, frozen from the local dev server (vite on :5175) with the prototype's demo data.
// Every /api/ read is answered with a 404 so the screens use the built-in demo bridge; snap.mjs aborts any write.
const api = () => ({ __status: 404, __body: { error: "film" } });
const noBanner = page => page.evaluate(() => { for (const d of document.querySelectorAll("main div")) if (d.textContent.trim().startsWith("Local API not running")) { d.remove(); break; } });
const base = { w: 1470, h: 860, scheme: "light", auth: false, api, wait: 2500 };
const ask = async (page, q) => { await page.fill('input[placeholder="Type a message…"]', q); await page.keyboard.press("Enter"); await page.waitForTimeout(1500); };
// the agent is opened from the Overview scrolled down to its Timeline section (where scene 6 ends)
const openAgent = async page => { await page.click("[data-testid=timeline-chip]"); await page.waitForTimeout(1400); await page.click('[aria-label="Ask the agent"]'); await page.waitForTimeout(700); };
const OV = "/#/canvas/product-handoff";
export default [
  { ...base, name: "home", path: "/#/home", actions: noBanner },
  { ...base, name: "create", path: "/?create=1#/home", actions: async page => {
    await noBanner(page);
    await page.fill("#nb-name", "Product Handoff");
    await page.fill("#nb-about", "Hand the new assessment flow over to engineering");
    for (const [n, r] of [["Aditi Sharma", "Product Manager"], ["Rohan Mehta", "Engineer"], ["Jo Chen", "Researcher"]]) {
      await page.fill("[data-testid=invite]", n); await page.selectOption("[data-testid=invite-role]", r); await page.keyboard.press("Enter");
    }
    await page.waitForTimeout(400);
  } },
  { ...base, name: "ov", path: OV },
  // the evidence panel: the Overview scrolled to Key findings, one must-know card opened
  { ...base, name: "evidence", path: OV, actions: async page => {
    await page.evaluate(() => { const sc = document.querySelector("[data-testid=summary]").closest(".overflow-y-auto");
      const g = [...sc.querySelectorAll("p")].find(p => p.textContent.trim() === "Key findings");
      sc.scrollTop = g.getBoundingClientRect().top - sc.getBoundingClientRect().top - 20; });
    await page.waitForTimeout(400);
    await page.click("text=Timeline revised to March 15"); await page.waitForTimeout(1000);
  } },
  { ...base, name: "agent0", path: OV, actions: openAgent },
  { ...base, name: "agent1", path: OV, actions: async page => { await openAgent(page); await ask(page, "What's blocking us?"); } },
  { ...base, name: "agent2", path: OV, actions: async page => { await openAgent(page); await ask(page, "What's blocking us?"); await ask(page, "Make a 2-minute audio summary"); } },
  { ...base, name: "agent3", path: OV, actions: async page => { await openAgent(page); await ask(page, "Make a 2-minute audio summary"); await ask(page, "Now turn it into a short video"); } },
];
