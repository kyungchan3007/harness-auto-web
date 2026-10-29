import { BigNumber } from "@hav/ui/big-number";
import { Button } from "@hav/ui/button";
import { Card } from "@hav/ui/card";
import { NavBar } from "@hav/ui/nav-bar";
import { Section } from "@hav/ui/section";
import { SignalBadge } from "@hav/ui/signal-badge";
import { Tabs } from "@hav/ui/tabs";
import { Tooltip } from "@hav/ui/tooltip";
import type { Metadata } from "next";
import { Characters } from "./characters";

export const metadata: Metadata = { title: "디자인 시스템 · Tripfx" };

// 디자인 시스템 확인용 — 숫자는 모두 예시 (실제 데이터 아님)
export default function DesignPage() {
  return (
    <>
      <NavBar
        title="Tripfx"
        links={[
          { href: "#numbers", label: "큰 숫자" },
          { href: "#cards", label: "카드" },
          { href: "#tabs", label: "탭" },
          { href: "#light", label: "밝은 섹션" },
          { href: "#characters", label: "캐릭터" },
        ]}
        action={<Button>바로 계산</Button>}
      />

      <Section id="numbers" eyebrow="디자인 시스템" title="오늘, 달러는 싼 편입니다.">
        <BigNumber label="예시 · 미국 달러" value="1,312" unit="원" />
        <div className="mt-8 flex flex-wrap gap-3">
          <SignalBadge signal="cheap" />
          <SignalBadge signal="normal" />
          <SignalBadge signal="expensive" />
        </div>
      </Section>

      <Section id="cards" surface="elevated" eyebrow="요약 카드" title={<>숫자는 크게,<br />설명은 짧게.</>}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card icon="💵" title="달러">
            <SignalBadge signal="cheap" />
          </Card>
          <Card icon="💴" title="엔">
            <SignalBadge signal="normal" />
          </Card>
          <Card icon="💶" title="유로">
            <SignalBadge signal="expensive" />
          </Card>
        </div>
      </Section>

      <Section id="tabs" eyebrow="탭 · 툴팁 · 버튼" title="여행지를 골라 보세요.">
        <Tabs
          items={[
            { value: "jp", label: "일본", content: "예시 · 엔화 기준 여행 물가 자리" },
            { value: "us", label: "미국", content: "예시 · 달러 기준 여행 물가 자리" },
            { value: "eu", label: "유럽", content: "예시 · 유로 기준 여행 물가 자리" },
          ]}
        />
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button>바로 계산</Button>
          <Button variant="secondary">자세히</Button>
          <Tooltip content="최근 90일 안에서 오늘 값의 위치 (예측 아님)">
            <Button variant="ghost">신호는 어떻게 계산하나요?</Button>
          </Tooltip>
        </div>
      </Section>

      <Section id="light" surface="light" eyebrow="밝은 섹션" title={<span className="text-aurora">밝은 배경에서도 읽히게.</span>}>
        <p>밝은 섹션은 2~3곳에만. 포인트 · 신호 색은 대비 4.5 이상인 진한 값으로 바뀝니다.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <SignalBadge signal="cheap" />
          <SignalBadge signal="normal" />
          <SignalBadge signal="expensive" />
          <Button>바로 계산</Button>
        </div>
      </Section>
      <Section id="characters" eyebrow="3D 캐릭터" title="고양이 두 마리.">
        <Characters />
      </Section>
    </>
  );
}
