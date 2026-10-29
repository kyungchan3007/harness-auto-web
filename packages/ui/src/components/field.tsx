// 입력 칸 · 선택 상자 — 통화 둘러보기 찾기 · 직구 계산기가 같이 씀 (작업 0067)
// 테두리는 칸 안쪽 border 1px (ring 은 칸 밖에 그려져 스크롤 영역에서 잘렸음) · 모서리는 radius-field · 높이 48px 로 통일
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const fieldClass =
  "h-12 w-full rounded-field border border-line bg-surface-2 px-4 text-base text-fg placeholder:text-fg-2 transition-colors hover:border-fg-2 focus:border-accent focus:outline-none";

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...rest} />;
}

/** 브라우저 기본 화살표 대신 같은 모양의 화살표 (칸마다 화살표 모양이 달랐음) */
export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select className={`${fieldClass} appearance-none pr-11 ${className}`} {...rest}>
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-fg-2">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
