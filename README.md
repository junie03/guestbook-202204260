# 방명록 (guestbook-202204260)

이름, 메시지, 작성 시각이 쌓이는 미니 방명록. 회원가입 없이, 글을 쓸 때 정한 **글 비밀번호**로만 자기 글을 수정·삭제할 수 있다.

- 개발자: 이주표 (202204260)
- 배포: https://guestbook-202204260.vercel.app
- 기술 스택: Next.js (App Router) + TypeScript, Neon Postgres, Vercel
- 개발 방식: SDD — `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review`

## 문서

- 용어집: [CONTEXT.md](CONTEXT.md)
- 결정 기록: [docs/adr/](docs/adr/)
- 스펙과 티켓: [.scratch/guestbook/](.scratch/guestbook/)

## 로컬에서 실행하기

1. 의존성 설치

   ```bash
   npm install
   ```

2. 프로젝트 루트에 `.env.local`을 만들고 Neon 연결 문자열을 넣는다 (GitHub에는 올라가지 않는다)

   ```
   DATABASE_URL=postgresql://...
   ```

3. Neon DB에 테이블을 만든다 (여러 번 실행해도 안전하다)

   ```bash
   npm run db:setup
   ```

   스크립트 대신 Neon 대시보드의 **SQL Editor**에 [db/schema.sql](db/schema.sql) 내용을 붙여넣고 실행해도 된다.

4. 개발 서버 실행 → http://localhost:3000

   ```bash
   npm run dev
   ```

## 테스트

```bash
npm test          # Vitest + PGlite(인메모리 Postgres). 실제 Neon DB는 건드리지 않는다
npm run typecheck
npm run lint
```

## 배포

- 배포 주소: https://guestbook-202204260.vercel.app
- GitHub (public): https://github.com/junie03/guestbook-202204260
- Vercel 프로젝트 `guestbook-202204260`이 이 저장소의 `master` 브랜치와 연결되어 있어, push하면 자동으로 다시 배포된다.
- Vercel 프로젝트 환경변수에 `DATABASE_URL`(Neon `guestbook-202204260` 연결 문자열)이 등록되어 있어야 한다.
