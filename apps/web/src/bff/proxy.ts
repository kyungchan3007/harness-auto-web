// BFF — 같은 주소의 /bff/* 를 API Worker 로 넘긴다 (Pages Functions · 서비스 바인딩 · functions/bff/[[path]].ts 가 부름)
// 브라우저는 이 주소만 안다: CORS 없음 · API 주소가 화면 코드에 없음 · 캐시를 여기 한곳에서 정함
// 읽기 경로만 허용 — 쓰기(POST /activity) · 관리(/fx/collect · /prices/collect)는 여기서 안 보임
import type { ApiError } from "@hav/shared/errors";

export type ApiBinding = { fetch(request: Request): Promise<Response> };

/** [경로, 캐시 초] — 위에서부터 먼저 맞는 것 */
const ROUTES: [RegExp, number][] = [
  [/^\/activity$/, 3], // 만드는 중 페이지가 몇 초마다
  [/^\/fx\/latest$/, 300],
  [/^\/fx\/[A-Za-z]{3}\/history$/, 300],
  [/^\/signal(\/[A-Za-z]{3})?$/, 300],
  [/^\/prices\/levels$/, 300],
  [/^\/tasks$/, 60], // 지난 작업 · 작업 이름 (GitHub Actions 가 저장)
];

export const BFF_PREFIX = "/bff";

const error = (status: number, message: string) => {
  const body: ApiError = { error: message };
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
};

export async function handleBff(request: Request, api: ApiBinding): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return error(405, "읽기만 됩니다");
  const url = new URL(request.url);
  const path = url.pathname.startsWith(BFF_PREFIX) ? url.pathname.slice(BFF_PREFIX.length) : url.pathname;
  const route = ROUTES.find(([re]) => re.test(path));
  if (!route) return error(404, "없는 경로입니다");

  let res: Response;
  try {
    // 쿠키 · 인증 머리글은 넘기지 않음 — 공개 읽기만
    res = await api.fetch(new Request(`https://api${path}${url.search}`, { method: request.method, headers: { accept: "application/json" } }));
  } catch {
    return error(502, "API 에 닿지 못했습니다");
  }
  const headers = new Headers({ "content-type": res.headers.get("content-type") ?? "application/json" });
  // 실패 응답은 캐시하지 않음 (잠깐 실패가 5분 동안 보이지 않게)
  headers.set("cache-control", res.ok ? `public, max-age=${route[1]}` : "no-store");
  return new Response(res.body, { status: res.status, headers });
}
