import { useEffect, useRef, useState } from 'react';
import { WebSocketService } from '../services/sockets';

interface BattleUpdate {
  // Определите структуру данных обновления битвы
  type: string;
  payload: any;
}

export function useBattleUpdates(battleId: string) {
  const [updates, setUpdates] = useState<BattleUpdate[]>([]);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    const url = `/ws/battle/${battleId}/`;
    wsRef.current = new WebSocketService(url);

    wsRef.current.connect((event) => {
      try {
        const data = JSON.parse(event.data);
        setUpdates((prev) => [...prev, data]);
      } catch (e) {
        // обработка ошибок парсинга
      }
    }, () => {
      // обработка закрытия соединения
    });

    return () => {
      wsRef.current?.close();
    };
  }, [battleId]);

  return updates;
}
