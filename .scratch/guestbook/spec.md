Status: ready-for-agent

# 미니 방명록 v1

용어는 [CONTEXT.md](../../CONTEXT.md)를 따른다. 관련 결정: [ADR-0001](../../docs/adr/0001-per-entry-password-no-accounts.md)(계정 없음, 글마다 글 비밀번호, 시도 횟수 제한 없음), [ADR-0002](../../docs/adr/0002-neon-postgres-raw-sql.md)(Neon Postgres, ORM 없는 SQL, PGlite 테스트).

## Problem Statement

방문자가 이름과 메시지를 남기고, 다른 사람들이 남긴 글을 시간 순으로 읽을 수 있는 가벼운 공간이 필요하다. 회원가입이나 로그인 같은 절차는 부담스럽지만, 그렇다고 아무나 남의 글을 고치거나 지울 수 있어서도 안 된다. 글쓴이는 나중에 자기 글의 오타를 고치거나 글을 지우고 싶을 때, 자기가 쓴 글이라는 것을 간단히 증명할 수 있어야 한다.

## Solution

한 페이지짜리 방명록을 만든다. 위에는 글쓰기 폼(이름·메시지·글 비밀번호), 그 아래에는 모든 Entry(글)가 작성 시각 최신순으로 쌓인 목록, 맨 아래에는 개발자 정보("개발자: 이주표 (202204260)")가 보인다. 각 Entry에는 [수정]·[삭제] 버튼이 있고, 누르면 그 Entry 안에 입력칸이 펼쳐진다. 글 비밀번호가 맞으면 Message(메시지)가 고쳐지거나 Entry가 지워지고, 틀리면 거부되며 그 자리에 "비밀번호가 일치하지 않습니다."라고 안내한다.

## User Stories

### 글 남기기

1. As a Visitor, I want to enter my Name, a Message and an Entry Password and submit them, so that my Entry appears in the guestbook.
2. As a Visitor, I want to leave an Entry without signing up or logging in, so that I can write something right away.
3. As a Visitor, I want my new Entry to appear at the top of the list immediately after submitting, so that I can confirm it was saved.
4. As a Visitor, I want the Message and Entry Password fields to clear after a successful submit while my Name stays filled in, so that I can write another Entry easily.
5. As a Visitor, I want to be told "이름은 1~20자로 입력해 주세요." under the Name field when my Name is empty or longer than 20 characters, so that I know how to fix it.
6. As a Visitor, I want to be told "메시지는 1~500자로 입력해 주세요." under the Message field when my Message is empty or longer than 500 characters, so that I know how to fix it.
7. As a Visitor, I want to be told "비밀번호는 4~30자로 입력해 주세요." under the Entry Password field when it is shorter than 4 or longer than 30 characters, so that I know how to fix it.
8. As a Visitor, I want everything I typed to stay in the form when it is rejected, so that I don't have to type it again.
9. As a Visitor, I want leading and trailing spaces of my Name and Message to be ignored, so that a field containing only spaces is treated as empty.
10. As a Visitor, I want line breaks in my Message to be kept, so that a multi-line Message reads the way I wrote it.
11. As a Visitor, I want the same input rules to apply even if the form is bypassed, so that invalid Entries never get stored.

### 글 읽기

12. As a Visitor, I want to see every Entry on one page, so that I can read the whole guestbook without paging.
13. As a Visitor, I want Entries ordered from the newest Created At to the oldest, so that the latest Entries are seen first.
14. As a Visitor, I want each Entry to show its Name, Message and Created At, so that I know who wrote what and when.
15. As a Visitor, I want Created At shown in Korean time as "2026-09-30 14:05", so that the time matches my clock regardless of where the server runs.
16. As a Visitor, I want a Message containing HTML to be shown as plain text, so that nobody can inject markup or scripts into the page.
17. As a Visitor, I want to see "아직 남겨진 글이 없습니다. 첫 글을 남겨 주세요!" when there are no Entries, so that an empty guestbook doesn't look broken.
18. As a Visitor, I want to see "개발자: 이주표 (202204260)" on the page, so that I know who built the app.

### 글 수정

19. As an Author, I want a [수정] button on each Entry that opens an inline form inside that Entry, so that I can edit without leaving the page.
20. As an Author, I want the edit form to be pre-filled with the current Message, so that I only need to change the part I want.
21. As an Author, I want to change my Message by entering the Entry Password I set, so that only I can edit my Entry.
22. As an Author, I want the edit form to close and the new Message to appear after a successful edit, so that I can see the result.
23. As a Visitor, I want an edited Entry to show "(수정됨)" next to its Created At, so that I know the Message has been changed since it was written.
24. As a Visitor, I want an edited Entry to keep its position in the list, so that editing doesn't bump an old Entry to the top.
25. As an Author, I want my Name and Created At to stay unchanged when I edit, so that the Entry still reflects when and by whom it was written.
26. As an Author, I want to see "비밀번호가 일치하지 않습니다." in red inside the edit form when my Entry Password is wrong, so that I know the edit was refused and why.
27. As an Author, I want my edited Message and typed password to stay in the form after a refusal, so that I can retry without retyping.
28. As an Author, I want the same Message rules (1~500자, trimmed) to apply when editing, so that an edit cannot produce an invalid Entry.
29. As an Author, I want to be told "이미 삭제된 글입니다." and see the list refreshed when the Entry I'm editing has already been deleted, so that I'm not left editing something that doesn't exist.
30. As an Author, I want to be able to cancel an open edit form, so that I can back out without changing anything.

### 글 삭제

31. As an Author, I want a [삭제] button on each Entry that opens an inline form asking for the Entry Password, so that I can delete without leaving the page.
32. As an Author, I want entering the correct Entry Password and pressing [삭제 확인] to delete my Entry with no further confirmation, so that deleting is quick while still deliberate.
33. As an Author, I want the Entry to disappear from the list after a successful delete, so that I can see it is gone.
34. As an Author, I want to see "비밀번호가 일치하지 않습니다." in red inside the delete form when my Entry Password is wrong, so that I know the delete was refused and why.
35. As an Author, I want to be told "이미 삭제된 글입니다." and see the list refreshed when the Entry has already been deleted, so that I understand what happened.
36. As an Author, I want to be able to cancel an open delete form, so that I can back out without deleting.

### 보안

37. As an Author, I want my Entry Password never stored in readable form, so that it stays secret even if the database leaks.
38. As an Author, I want each Entry to have its own Entry Password, so that knowing one Entry's password gives no power over other Entries.

## Implementation Decisions

- **방명록 도메인 모듈 (deep module)**: Entry에 관한 모든 규칙을 한 모듈이 가진다. `Db`와 시계(`now()`)를 받는 팩토리로 만들고, 네 가지 동작을 공개한다.
  - `create({ name, message, password })` → 만들어진 Entry, 또는 칸별 검증 오류
  - `list()` → 모든 Entry를 Created At 내림차순으로 돌려준다(같으면 id 내림차순). 각 Entry는 id, Name, Message, Created At, Edited 여부를 가지며, 비밀번호 해시는 절대 밖으로 내보내지 않는다.
  - `edit(id, { message, password })` → 수정된 Entry, 또는 검증 오류(message) / `wrong_password` / `not_found`
  - `remove(id, password)` → 성공, 또는 `wrong_password` / `not_found`
  - 결과는 예외를 던지지 않고 판별 유니온(discriminated union)으로 돌려준다. UI는 결과 종류마다 한국어 안내 문구를 붙이기만 한다.
- **입력값 검증**: Name은 앞뒤 공백을 지운 뒤 1~20자, Message는 앞뒤 공백을 지운 뒤 1~500자, Entry Password는 공백을 지우지 않고 4~30자. 글자 수는 유니코드 코드포인트로 세서 한글 한 글자를 1자로 친다. 검증은 도메인 모듈에 있으며 작성·수정 때마다 서버에서 실행된다.
- **비밀번호 해시**: Node 내장 `crypto.scrypt`에 Entry마다 무작위 16바이트 솔트를 붙인다. 솔트와 해시는 한 컬럼에 함께 저장하고, 비교는 `timingSafeEqual`로 한다. 시도 횟수 제한은 없다(ADR-0001).
- **스키마**: 테이블 `entries` 하나.
  - id (identity, 기본키), name (text), message (text), password_hash (text)
  - created_at (timestamptz, 기본값 now), updated_at (timestamptz, null 허용, 수정 시 기록)
  - updated_at이 null이 아니면 "수정됨"이다.
  - 스키마는 Neon과 PGlite 양쪽에서 도는 순수 SQL 파일 하나로 두고, `create table if not exists`로 여러 번 실행해도 안전하게 만든다. Neon에는 작은 설정 스크립트로 적용한다.
- **Db 인터페이스**: voting-app과 같은 최소 SQL 실행 인터페이스(`query(text, params)`). 운영용 Neon 구현과 테스트용 PGlite 구현을 둔다. ORM은 쓰지 않는다(ADR-0002).
- **시각**: Created At은 주입된 시계로 정해서 테스트에서 시각을 통제할 수 있게 한다. 화면 표시는 `Asia/Seoul` 시간대를 명시해 `YYYY-MM-DD HH:mm` 형식으로 만든다.
- **UI**: `/` 경로 하나.
  - Server Component가 `list()`를 읽어 목록을 그린다.
  - 작성·수정·삭제는 Server Action이 도메인 모듈을 호출한 뒤 `/`를 재검증(revalidate)한다.
  - 폼 상태는 Client Component에서 `useActionState`로 관리한다. Entry마다 자기만의 인라인 수정·삭제 폼이 있고, 한 Entry에서는 한 번에 하나만 열린다.
  - Message는 React 기본 이스케이프로 일반 텍스트로 보여주고, `white-space: pre-wrap`으로 줄바꿈을 유지한다.
  - 푸터에 "개발자: 이주표 (202204260)"를 표시한다.
- **결과 → 안내 문구 (UI 층)**:
  - `wrong_password` → "비밀번호가 일치하지 않습니다." (해당 Entry 폼 안에 빨간 글씨, 입력값 유지)
  - `not_found` → "이미 삭제된 글입니다." 그리고 목록 재검증
  - 검증 오류 → 유저 스토리 5~7의 칸별 문구
- **환경변수**: 필요한 것은 `DATABASE_URL`(Neon 연결 문자열) 하나. 로컬은 `.env.local`, Vercel은 프로젝트 환경변수에 둔다.

## Testing Decisions

- **테스트 경계는 하나, 방명록 도메인 모듈이다.**
  - 실제 스키마를 올린 PGlite 인메모리 Postgres와 주입한 시계로, 공개된 동작만 통해 테스트한다.
  - 확인하는 것은 `list()`가 돌려주는 내용과 각 동작의 결과처럼 밖에서 보이는 동작뿐이다. SQL이나 내부 도우미 함수는 검사하지 않는다.
- 다룰 동작:
  - 작성하면 Name, Message, Created At을 가진 채 목록에 나오고, 수정됨이 아니다.
  - 최신순 정렬이 지켜지고, 수정한 뒤에도 순서가 바뀌지 않는다.
  - 맞는 비밀번호로 수정하면 Message가 바뀌고 수정됨이 되며, Name과 Created At은 그대로다.
  - 틀린 비밀번호로 수정·삭제하면 거부되고 Entry는 바뀌지 않는다.
  - 없는 id를 수정·삭제하면 `not_found`가 돌아온다.
  - 맞는 비밀번호로 삭제하면 목록에서 사라진다.
  - 검증 경계값: 이름 0/1/20/21자, 메시지 0/1/500/501자, 비밀번호 3/4/30/31자, 공백만 입력, 한글 한 글자가 1자로 세어지는지.
  - 저장된 행에 비밀번호 원문이 없고, 같은 비밀번호로 쓴 두 Entry의 해시가 서로 다르다.
- KST 표시 함수는 작은 순수 함수라 따로 단위 테스트한다. 예: UTC로 자정 직전인 시각은 KST로 다음 날이 된다.
- 참고 사례: voting-app의 도메인 모듈 테스트. `Db`와 시계를 주입하는 팩토리 구조이고, 파일마다 PGlite를 한 번 띄운 뒤 테스트마다 비운다.
- Server Action과 React 컴포넌트는 얇은 연결 층이므로 자동 테스트 대신 앱을 실제로 실행해 확인한다. v1에는 Playwright E2E 테스트가 없다.

## Out of Scope

- 계정, 회원가입, 로그인, 남의 글을 고치거나 지울 수 있는 관리자
- 잊어버린 글 비밀번호 찾기·재설정
- 비밀번호 오입력 횟수 제한·잠금 (ADR-0001)
- 이름 수정, 작성 후 글 비밀번호 변경
- 페이지 나누기, 검색, 정렬 옵션, 새로고침 없는 실시간 갱신
- 스팸 필터, CAPTCHA, 욕설 필터, 메시지 안의 서식·이미지
- 브라우저 자동 테스트(E2E)

## Further Notes

- 이름 규칙: GitHub 저장소(public), Vercel 프로젝트, Neon 프로젝트 모두 `guestbook-202204260`. Neon 프로젝트는 이미 만들어졌고, `.env.local` 설정과 연결 확인까지 끝났다.
- Vercel 프로젝트는 개발자가 Vercel 웹 대시보드에서 GitHub 저장소를 가져오고(Import) `DATABASE_URL`을 등록해 만든다.
- 처음 쓰기 전에 설정 스크립트로 Neon DB에 스키마를 한 번 적용해야 한다.
