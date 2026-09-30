# 05: 배포

**What to build:** 누구나 공개 주소로 방명록에 접속해 글을 남기고, 수정하고, 삭제할 수 있다. GitHub 저장소·Vercel 프로젝트·Neon 프로젝트 이름은 모두 `guestbook-202204260`이다. 스펙: [spec.md](../spec.md) (Further Notes)

**Blocked by:** 02, 03, 04

**Status:** ready-for-human (GitHub 저장소 생성과 push는 에이전트가, Vercel 가져오기와 환경변수 등록은 개발자가 한다)

- [ ] Neon `guestbook-202204260` DB에 설정 스크립트로 스키마가 적용되어 있다
- [ ] GitHub에 **public** 저장소 `guestbook-202204260`이 있고 코드가 올라가 있다 (`.env.local`은 올라가지 않는다)
- [ ] Vercel 프로젝트 `guestbook-202204260`이 그 저장소를 가져와 배포되어 있고, 환경변수 `DATABASE_URL`이 등록되어 있다
- [ ] 배포된 주소에서 작성·목록·수정·삭제·비밀번호 불일치 안내가 동작하고, 개발자 정보가 보인다
- [ ] README에 배포 주소와 GitHub 주소가 적혀 있다
