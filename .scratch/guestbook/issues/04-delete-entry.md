# 04: 글 삭제

**What to build:** Author가 자기 Entry의 [삭제]를 누르면 글 비밀번호 칸과 [삭제 확인] 버튼이 그 Entry 안에 펼쳐진다. 비밀번호가 맞으면 Entry가 목록에서 사라지고, 틀리면 삭제가 거부되며 그 사실이 폼 안에 표시된다. 비밀번호 입력 자체가 확인이므로 추가 확인 창은 없다. 스펙: [spec.md](../spec.md) (User Stories 31–36)

**Blocked by:** 01 (글 남기기와 목록 보기)

**Status:** ready-for-agent

- [x] 도메인 모듈이 `remove(id, password)`를 공개하고 성공 / `wrong_password` / `not_found` 중 하나를 돌려준다
- [x] 테스트: 맞는 비밀번호로 삭제하면 목록에서 사라진다
- [x] 테스트: 틀린 비밀번호는 `wrong_password`이고 Entry는 남아 있다
- [x] 테스트: 없는 id는 `not_found`
- [x] 화면: [삭제] → 인라인 폼(비밀번호 + [삭제 확인]), [취소]로 닫힘
- [x] 화면: 성공 시 Entry가 목록에서 사라진다
- [x] 화면: 틀린 비밀번호면 폼 안에 빨간 글씨로 "비밀번호가 일치하지 않습니다."가 뜬다
- [x] 화면: 이미 삭제된 Entry면 "이미 삭제된 글입니다."가 뜨고 목록이 새로 고쳐진다
