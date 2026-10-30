// 오늘(2026-10-30) 만든 기능이 실제 브라우저에서 도는지 — 값은 날마다 바뀌어서 동작 · 모양만 봄 (작업 0101)
import { type Page, expect, test } from "@playwright/test";

/** 페이지 오류 · 하이드레이션 어긋남 모으기 */
function watchErrors(page: Page) {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && /hydrat|#418|#425|#423/i.test(m.text())) errs.push(m.text());
  });
  return errs;
}

for (const path of ["/", "/currencies/USD", "/prices", "/calc", "/log"]) {
  test(`${path} — 페이지 오류 없음 · 가로로 넘치지 않음`, async ({ page }) => {
    const errs = watchErrors(page);
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(errs).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}

test("환율 계산기 — 원화를 넣으면 외화 칸이 바뀜 (작업 0086)", async ({ page }) => {
  await page.goto("/currencies/USD");
  const box = page.locator('section[aria-labelledby="converter-title"]');
  const [usd, won] = [box.locator("input").nth(0), box.locator("input").nth(1)];
  await won.fill("100000");
  await expect(usd).not.toHaveValue("");
  await expect(usd).toHaveValue(/^\d[\d,]*(\.\d+)?$/);
  await usd.fill("abc");
  await expect(page.locator("#converter-note")).toContainText("0 이상의 숫자");
});

test("흐름 기간 — 1개월을 누르면 제목이 바뀜 (작업 0087)", async ({ page }) => {
  await page.goto("/currencies/USD");
  await page.getByRole("group", { name: "기간" }).getByRole("button", { name: "1개월" }).click();
  await expect(page.getByText(/최근 1개월 흐름/)).toBeVisible();
});

test("여행 예산 — 주소의 나라가 골라지고 결과가 나옴 (작업 0088 · 0100)", async ({ page }) => {
  await page.goto("/prices?country=THA#budget");
  await expect(page.locator("#budget select")).toHaveValue("THA");
  await expect(page.locator("#budget")).toContainText("태국 물가는 한국보다");
});

test("즐겨찾기 — 맨 위로 · 새로 고침 뒤에도 (작업 0089)", async ({ page }) => {
  await page.goto("/currencies/USD");
  const list = page.getByRole("navigation", { name: "통화 목록" });
  await list.getByRole("button", { name: "바트 즐겨찾기" }).click();
  await expect(list.locator("li").first()).toContainText("바트");
  await page.reload();
  await expect(list.locator("li").first()).toContainText("바트");
});

test("작업 일지 — 요청 원문이 보임 (작업 0090)", async ({ page }) => {
  await page.goto("/log");
  const first = page.locator("#journal details").first();
  await expect(first).toContainText("요청 원문");
  await expect(page.locator("#journal a", { hasText: ".agents/specs" })).toHaveAttribute("href", /^https:\/\/github\.com\//);
});

test("통화 목록 정렬 — 싸진 순이면 변화율이 보임 (작업 0099)", async ({ page }) => {
  await page.goto("/currencies/USD");
  await page.getByRole("group", { name: "정렬" }).getByRole("button", { name: "1개월 많이 싸진 순" }).click();
  await expect(page.getByRole("navigation", { name: "통화 목록" }).locator("li").first()).toContainText(/[+-]\d+\.\d%/);
});
