// 즐겨찾는 통화 — 이 브라우저에만 저장 (localStorage · 보내지 않음) · 목록 맨 위에 (작업 0089)
//   저장소를 못 쓰는 브라우저(사생활 보호 모드 등)에서는 그냥 빈 목록 — 화면은 그대로 동작
import { useSyncExternalStore } from "react";

export const FAVORITES_KEY = "tripfx:favorites";
const MAX = 20;

/** 저장된 글 → 통화 코드 목록 (모양이 틀리면 빈 목록 · 중복 · 이상한 값은 버림) */
export function parseFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return [...new Set(v.filter((c): c is string => typeof c === "string" && /^[A-Z]{3}$/.test(c)))].slice(0, MAX);
  } catch {
    return [];
  }
}

/** 있으면 빼고 없으면 끝에 더함 (최대 20개) */
export function toggleFavorite(list: string[], code: string): string[] {
  return list.includes(code) ? list.filter((c) => c !== code) : [...list, code].slice(-MAX);
}

/** 즐겨찾기를 고른 순서대로 앞에 · 나머지는 원래 순서 */
export function favoritesFirst<T extends { currency: string }>(items: T[], favs: string[]): T[] {
  const rank = new Map(favs.map((c, i) => [c, i]));
  const picked = items.filter((i) => rank.has(i.currency)).sort((a, b) => (rank.get(a.currency) ?? 0) - (rank.get(b.currency) ?? 0));
  return [...picked, ...items.filter((i) => !rank.has(i.currency))];
}

// ── 브라우저 저장소 (같은 탭 · 다른 탭 모두 바로 반영)
const listeners = new Set<() => void>();
let cache: { raw: string | null; list: string[] } = { raw: null, list: [] };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(FAVORITES_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cache.raw) cache = { raw, list: parseFavorites(raw) };
  return cache.list;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => e.key === FAVORITES_KEY && fn();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: string[] = [];

/** [즐겨찾기 목록, 켜고 끄기] — 서버 그림(빌드)에서는 빈 목록 */
export function useFavorites(): [string[], (code: string) => void] {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = (code: string) => {
    const next = toggleFavorite(read(), code);
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      return; // 저장 못 하면 바꾸지 않음
    }
    for (const fn of listeners) fn();
  };
  return [list, toggle];
}
