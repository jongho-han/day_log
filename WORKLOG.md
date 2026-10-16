# WORKLOG

## 2026-10-16 09:47:17 KST
- 프롬프트: CLAUDE.md 지침(커뮤니케이션·Git·디자인·코드 품질·설계·문서·.bat·WORKLOG 규칙) 추가
- 작업: CLAUDE.md 에 공통 규칙 섹션 추가. 다른 프로젝트 전용 내용(singlefile 빌드, jsdom 테스트, menu-spec 흐름, Starbucks 디자인, 메뉴정의서)은 이 저장소에 해당하지 않아 제외하고, 디자인 규칙은 토스 디자인 / `src/style.css` 토큰 기준으로 바꿈. WORKLOG.md 생성

## 2026-10-16 09:48:27 KST
- 프롬프트: 커밋하고 푸시
- 작업: CLAUDE.md, WORKLOG.md 를 `claude/toss-design-ui-nsr4tw` 브랜치에 커밋·푸시 (698dc67)

## 2026-10-16 09:56:45 KST
- 프롬프트: claude.md 규칙에 따라 리팩토링 진행
- 작업: 프론트엔드를 core / domain / data(repository) / providers / widgets / controllers 계층으로 재구성하고 main.js 를 의존성 주입 컴포지션 루트로 변경. 전역 state 제거, 항목 변경은 entryProvider 구독으로 재렌더. 등록 폼·편집 시트 입력 필드 공용 위젯화. 백엔드 공통 코드를 api/_lib 로 분리하고 server.js 가 운영 핸들러를 재사용하도록 통일(로컬 저장 400 오류 해소), 미사용 data.json 삭제. 인라인 style 제거. 빌드·순수 함수·API 핸들러 검증 통과. 커밋 안 함

## 2026-10-16 11:01:12 KST
- 프롬프트: 커밋하고 푸시
- 작업: 리팩토링 변경분 전체(src 계층 구조, api/_lib, server.js, CLAUDE.md, WORKLOG.md)를 `claude/toss-design-ui-nsr4tw` 브랜치에 커밋·푸시. 푸시 전 키·계정·개인정보 포함 여부 점검

## 2026-10-16 11:02:43 KST
- 프롬프트: day-log-one.vercel.app 배포
- 작업: PR #1(claude/toss-design-ui-nsr4tw → main) 생성 후 머지(aa57154). Vercel Git 연동으로 main 운영 배포 진행. PR 미리보기 배포 성공 확인

## 2026-10-16 11:09:12 KST
- 프롬프트: 모든 사용자 로그인 시 pw 체크
- 작업: 관리자만 하던 비밀번호 확인을 모든 회원으로 확대. POST /api/members 가 members.pw 로 모든 회원 확인(비밀번호 미설정 회원은 로그인 불가). 로그인 화면 비밀번호 입력 상시 노출, authProvider·loginController 정리, CLAUDE.md 인증 설명 갱신. 빌드·로그인 로직·API 스텁 검증 통과. 커밋 안 함

## 2026-10-16 11:12:49 KST
- 프롬프트: 커밋하고 푸시
- 작업: 전 사용자 비밀번호 확인 변경분을 `claude/toss-design-ui-nsr4tw` 브랜치에 커밋·푸시. 푸시 전 키·계정·개인정보 포함 여부 점검

## 2026-10-16 11:13:59 KST
- 프롬프트: 배포
- 작업: PR #2(전 사용자 비밀번호 확인) 생성 후 main 머지(c3b31f8). Vercel Git 연동으로 운영 배포 진행. PR 미리보기 배포 성공 확인

## 2026-10-16 11:17:32 KST
- 프롬프트: npm install / npm run dev
- 작업: npm install 실행(package-lock.json 갱신, 취약점 28건 보고). 사용자 재요청으로 클라우드 세션에서 npm run dev 실행: API(3001)·Vite(5173) 기동 확인, .env.local 부재로 /api 는 500(supabaseUrl is required)

## 2026-10-16 11:18:48 KST
- 프롬프트: package-lock.json npm 사용
- 작업: 패키지 매니저를 npm 으로 통일. pnpm-lock.yaml 삭제, 갱신된 package-lock.json 유지(npm ci 정합 확인), CLAUDE.md 에 npm 사용 명시

## 2026-10-16 11:19:24 KST
- 프롬프트: 개발 서버 끄고 커밋하고 푸시
- 작업: 개발 서버 종료. 브랜치를 최신 main 에서 재시작 후 npm 통일(pnpm-lock.yaml 삭제, package-lock.json 갱신)·CLAUDE.md·WORKLOG 변경분 커밋·푸시
