# 01: 글 남기기와 목록 보기

**What to build:** Visitor가 `/`에서 이름·메시지·글 비밀번호를 입력해 Entry를 남기면, 목록 맨 위에 바로 나타난다. 목록은 Created At 최신순이고, 각 Entry는 이름·메시지·작성 시각(KST, `YYYY-MM-DD HH:mm`)을 보여준다. 페이지 아래에는 개발자 정보가 보인다. 이 과정에서 스키마, DB 연결, 테스트 하네스, 방명록 도메인 모듈 뼈대가 함께 만들어진다. 스펙: [spec.md](../spec.md) (User Stories 1–4, 10, 12–18, 37–38)

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] 스키마 SQL 파일 하나가 `entries` 테이블을 정의하고, 여러 번 실행해도 안전하다
- [ ] `DATABASE_URL`로 Neon에 스키마를 적용하는 설정 스크립트가 있고, 사용법이 README에 있다
- [ ] 방명록 도메인 모듈이 `Db`와 시계를 주입받는 팩토리로 만들어지고 `create`, `list`를 공개한다
- [ ] Vitest + PGlite 하네스가 실제 스키마를 적용하고 테스트마다 DB를 비운다
- [ ] 테스트: 작성한 Entry가 Name·Message·Created At을 가진 채 목록에 나오고, 수정됨이 아니다
- [ ] 테스트: 여러 Entry가 Created At 최신순으로 나온다
- [ ] 테스트: 저장된 행에 비밀번호 원문이 없고, 같은 비밀번호로 쓴 두 Entry의 해시가 다르다. `list()`는 해시를 내보내지 않는다
- [ ] 테스트: KST 표시 함수가 UTC 자정 직전 시각을 KST 다음 날로 표시한다
- [ ] 화면: 글쓰기 폼 → 제출 → 메시지·비밀번호 칸만 비워지고 이름은 남으며, 새 Entry가 맨 위에 보인다
- [ ] 화면: 메시지의 HTML은 글자로 보이고 줄바꿈은 유지된다
- [ ] 화면: Entry가 없으면 "아직 남겨진 글이 없습니다. 첫 글을 남겨 주세요!"가 보인다
- [ ] 화면: 푸터에 "개발자: 이주표 (202204260)"가 보인다
