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
