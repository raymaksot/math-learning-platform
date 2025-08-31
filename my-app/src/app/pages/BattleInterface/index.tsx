// ...existing code...
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { endpoints, type Battle } from "../../services/endpoints";
import Button from "../../shared/components/Button.tsx";
import { Card, CardHeader, CardTitle, CardContent } from "../../shared/components/Card";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";
import { useBattleUpdates } from "../../hooks/useBattleUpdates";

export default function BattleInterface() {
  const { battleId } = useParams<{ battleId: string }>();
  const { data, isLoading, isError } = useQuery<Battle>({
    queryKey: ["battle", battleId],
    queryFn: () => endpoints.getBattle(battleId as string),
    enabled: Boolean(battleId),
    staleTime: 5_000,
  });
  const updates = useBattleUpdates(battleId ?? "");
  const battleState = updates.find((u) => u.type === "state")?.payload;
  const scoreUpdates = updates.find((u) => u.type === "score")?.payload;

  if (isLoading) {
    return <div className="text-center py-10 text-lg">Loading...</div>;
  }
  if (isError || !data) {
    return <div className="text-center py-10 text-lg text-red-600">Error!</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <BattleHeader
  title={data.name}
  status={data.status}
  startsAt={data.startsAt}
  round={battleState?.round ?? 1}
  timer={battleState?.timerSec ? `${battleState.timerSec}s` : "--:--"}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TaskViewer updates={updates} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ScoreBoard scoreUpdates={scoreUpdates} />
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline">Пауза</Button>
                <Button>Завершить</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** ---------- Вспомогательные блоки страницы (заглушки) ---------- */

function BattleHeader({
  title,
  status,
  startsAt,
  round,
  timer,
}: {
  title: string;
  status: string;
  startsAt?: string;
  round?: number;
  timer?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Battle: {title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-sm">
          <div>Статус: <span className="font-medium capitalize">{status}</span></div>
          <div>Старт: {startsAt ? new Date(startsAt).toLocaleString() : "—"}</div>
          <div>Раунд: {round ?? "—"}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-70">Таймер:</span>
          <div className="rounded-xl border px-3 py-1 text-lg font-semibold">
            {timer ?? "--:--"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useTasks } from "../../features/Tasks/useTasks";
function TaskViewer({ updates }: { updates: any[] }) {
  const { tasks, isLoading, isError, submitAnswer, isSubmitting } = useTasks();
  const currentTaskId = updates.find((u) => u.type === "currentTask")?.payload?.taskId;
  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? tasks[0];

  if (isLoading) {
    return <div className="text-center py-6">Загрузка задачи...</div>;
  }
  if (isError || !currentTask) {
    return <div className="text-center py-6 text-red-600">Ошибка загрузки задачи</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Текущая задача</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm">{currentTask?.title ?? "—"}</p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const answer = (form.elements.namedItem("answer") as HTMLInputElement)?.value;
            if (answer) {
              submitAnswer({ taskId: currentTask.id, answer });
            }
          }}
        >
          <input
            name="answer"
            type="text"
            className="border rounded px-2 py-1"
            placeholder="Ваш ответ"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>Отправить ответ</Button>
        </form>
      </CardContent>
    </Card>
  );
}

type Row = { team: string; score: number; penalty: number };
function ScoreBoard({ scoreUpdates }: { scoreUpdates?: any }) {
  // Получаем данные о счёте из обновлений
  const rows: Row[] = Array.isArray(scoreUpdates)
    ? scoreUpdates
    : [
        { team: "Альфа", score: 120, penalty: 10 },
        { team: "Бета", score: 110, penalty: 5 },
        { team: "Гамма", score: 90, penalty: 15 },
      ];
  const columns: ColumnDef<Row>[] = [
    { key: "team", header: "Команда" },
    { key: "score", header: "Очки" },
    { key: "penalty", header: "Штраф" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Счёт</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable<Row>
          data={rows}
          columns={columns}
          rowKey={(r) => r.team}
          dense
        />
      </CardContent>
    </Card>
  );
}
