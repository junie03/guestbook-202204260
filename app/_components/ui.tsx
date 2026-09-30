// 폼 공통 스타일과 작은 표시 컴포넌트. 상태가 없어 서버·클라이언트 어디서나 쓴다.

export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";
export const buttonClass =
  "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
export const dangerButtonClass =
  "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50";
export const subtleButtonClass =
  "rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

const WRONG_PASSWORD = "비밀번호가 일치하지 않습니다.";

/** 입력칸 아래에 붙는 빨간 안내 문구. 없으면 아무것도 그리지 않는다. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

/** 수정·삭제 폼의 글 비밀번호 칸. 비밀번호가 틀렸으면 칸 아래에 안내를 띄운다. */
export function EntryPasswordField({
  value,
  onChange,
  label,
  wrongPassword,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  wrongPassword: boolean;
}) {
  return (
    <div className="flex-1 space-y-1">
      <input
        name="password"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="글 비밀번호"
        aria-label={label}
        autoComplete="current-password"
        className={inputClass}
      />
      <FieldError message={wrongPassword ? WRONG_PASSWORD : undefined} />
    </div>
  );
}
