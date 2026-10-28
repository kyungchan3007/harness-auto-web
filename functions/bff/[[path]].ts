// Pages Functions — /bff/* 를 받는 자리 · 로직은 apps/web/src/bff/proxy.ts (테스트 있음)
// Pages 루트 디렉터리가 저장소 맨 위라 이 폴더도 맨 위에 둔다
import { type ApiBinding, handleBff } from "../../apps/web/src/bff/proxy";

type Context = { request: Request; env: { API: ApiBinding } };

export const onRequest = ({ request, env }: Context) => handleBff(request, env.API);
