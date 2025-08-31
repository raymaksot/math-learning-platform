import { useEffect } from "react";

export function useBattleUpdates(battleId: string | undefined) {
  useEffect(() => {
    if (!battleId) return;
    // Заглушка подписки на обновления (WebSocket/SSE/polling)
    const interval = setInterval(() => {
      // тут могли бы дергать refetch() или обрабатывать входящие события
      console.debug("[useBattleUpdates] tick for battle:", battleId);
    }, 5000);

    return () => clearInterval(interval);
  }, [battleId]);
}
