import type { ReactNode } from "react";

/** 아래에서 살짝 떠오름 — CSS 만 (자바스크립트를 기다리지 않음 · tokens.css 의 .hav-reveal)
 *  예전엔 motion 이 opacity 0 으로 숨겨 두고 JS 가 돈 뒤에야 보여서 첫 큰 글자(LCP)가 1.6초 늦었음 (작업 0060)
 *  스크롤 진행을 아는 브라우저는 화면에 들어올 때 · 모르면 처음 그릴 때 한 번 · "움직임 줄이기"면 globals 가 멈춤 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="hav-reveal" style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
