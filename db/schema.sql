-- 방명록 스키마. Neon과 PGlite(테스트) 양쪽에서 그대로 실행되며, 여러 번 실행해도 안전하다.
create table if not exists entries (
  id            integer generated always as identity primary key,
  name          text        not null,
  message       text        not null,
  -- scrypt 해시와 솔트를 "salt:hash"(hex) 형태로 함께 저장한다. 비밀번호 원문은 저장하지 않는다.
  password_hash text        not null,
  created_at    timestamptz not null default now(),
  -- 메시지를 한 번이라도 고치면 기록된다. null이 아니면 "수정됨".
  updated_at    timestamptz
);

create index if not exists entries_created_at_idx on entries (created_at desc, id desc);
