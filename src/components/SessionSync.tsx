"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Компонент для синхронизации сессии Supabase при загрузке приложения.
 * Вызывает refreshSession() чтобы убедиться, что куки актуальны.
 */
export function SessionSync() {
  useEffect(() => {
    const supabase = createBrowserClient();
    
    // Обновляем сессию при монтировании
    supabase.auth.refreshSession().catch(() => {
      // Игнорируем ошибки при автоматическом обновлении
    });
  }, []);

  return null;
}
