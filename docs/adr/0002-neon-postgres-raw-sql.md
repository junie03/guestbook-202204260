# 데이터는 Neon Postgres에 ORM 없이 직접 쓴 SQL로 저장하고, 테스트는 PGlite로 돌린다

과제 조건에 따라 데이터베이스는 Neon Postgres를 쓰고, `@neondatabase/serverless` 드라이버로 SQL을 직접 작성한다. 테이블이 `entries` 하나뿐이라 ORM과 마이그레이션 도구가 주는 이득보다 배워야 할 것이 더 많다고 판단했다. 테스트는 실제 Neon DB 대신 메모리에서 도는 Postgres인 PGlite에 같은 스키마를 만들어 돌리므로, 두 환경에서 모두 동작하는 표준 Postgres SQL만 쓴다.
