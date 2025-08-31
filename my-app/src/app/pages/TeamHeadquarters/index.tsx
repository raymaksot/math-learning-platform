import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, type Team } from "../../services/endpoints";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "../../shared/components/Card";
import Button from "../../shared/components/Button";

type TeamMember = { id: string; name: string; progress: number; role?: string };

export default function TeamHeadquarters() {
  const { data: team, isLoading, isError } = useQuery<Team>({
    queryKey: ["team", "current"],
    queryFn: endpoints.getTeam,
    staleTime: 30_000,
  });

  // Заглушка участников (можно заменить на реальные данные)
  const members: TeamMember[] = useMemo(
    () => [
      { id: "1", name: "Алия", progress: 78, role: "captain" },
      { id: "2", name: "Иван", progress: 52 },
      { id: "3", name: "Жан", progress: 34 },
    ],
    []
  );

  const columns = useMemo<ColumnDef<TeamMember>[]>(() => [
    { key: "name", header: "Участник" },
    {
      key: "role",
      header: "Роль",
      accessor: (m) => (m.role ? m.role : "—"),
      className: "capitalize",
    },
    {
      key: "progress",
      header: "Прогресс",
      cell: (m) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 rounded bg-gray-200">
            <div
              className="h-2 rounded bg-blue-600"
              style={{ width: `${m.progress}%` }}
            />
          </div>
          <span className="text-xs">{m.progress}%</span>
        </div>
      ),
    },
  ], []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Headquarters</h1>
        <Button variant="outline" onClick={() => alert("Пригласить участника")}>
          Пригласить
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Команда: {team?.name ?? "—"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="text-sm text-red-600">Не удалось загрузить данные команды</div>
          ) : (
            <DataTable<TeamMember>
              data={members}
              columns={columns}
              rowKey={(m) => m.id}
              isLoading={isLoading}
              emptyMessage="Нет участников"
              dense
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
