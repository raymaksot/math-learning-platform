import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, type User } from "../../services/endpoints";
import { Card, CardHeader, CardTitle, CardContent } from "../../shared/components/Card";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";
import Button from "../../shared/components/Button";

type Achievement = { id: string; title: string; date: string; points: number };

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading, isError } = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => endpoints.getUser(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  // Заглушки достижений
  const achievements: Achievement[] = useMemo(
    () => [
      { id: "a1", title: "Первые 100 очков", date: "2025-02-10", points: 100 },
      { id: "a2", title: "Победа в битве", date: "2025-03-05", points: 250 },
    ],
    []
  );

  const columns = useMemo<ColumnDef<Achievement>[]>(() => [
    { key: "title", header: "Достижение" },
    {
      key: "date",
      header: "Дата",
      accessor: (a) => new Date(a.date).toLocaleDateString(),
      className: "whitespace-nowrap",
    },
    { key: "points", header: "Очки" },
  ], []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
        <Button variant="outline" onClick={() => alert("Редактировать профиль")}>
          Редактировать
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="text-sm text-red-600">Не удалось загрузить профиль</div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar name={data?.name ?? "User"} />
              <div className="text-sm">
                <div><span className="opacity-70">ID:&nbsp;</span>{data?.id ?? "—"}</div>
                <div><span className="opacity-70">Имя:&nbsp;</span>{data?.name ?? "—"}</div>
                <div className="capitalize"><span className="opacity-70">Роль:&nbsp;</span>{data?.role ?? "—"}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<Achievement>
            data={achievements}
            columns={columns}
            rowKey={(a) => a.id}
            isLoading={isLoading}
            emptyMessage="Пока нет достижений"
            dense
          />
        </CardContent>
      </Card>
    </div>
  );
}

/** Простой аватар по инициалам */
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid size-16 place-items-center rounded-2xl border text-lg font-semibold">
      {initials}
    </div>
  );
}
