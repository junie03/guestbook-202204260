"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { subtleButton } from "./ui";

const REFRESH_DELAY_MS = 3000;

/** 다른 곳에서 이미 지워진 Entry에 대한 안내. 잠시 보여준 뒤(또는 [확인]을 누르면) 목록을 새로 고친다. */
export function GoneNotice() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div role="alert" className="flex items-center justify-between gap-3 text-sm text-red-600 dark:text-red-400">
      <span>이미 삭제된 글입니다.</span>
      <button type="button" onClick={() => router.refresh()} className={subtleButton}>
        확인
      </button>
    </div>
  );
}
