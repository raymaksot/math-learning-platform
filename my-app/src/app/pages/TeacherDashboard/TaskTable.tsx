// src/app/pages/TeacherDashboard/TaskTable.tsx
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasks, deleteTask, updateTask, type Task } from "./api";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";
import Button from "../../shared/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/components/Card";

export default function TaskTable() {
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const edit = useMutation({
    mutationFn: (patch: Partial<Task> & { id: string }) => updateTask(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const columns = useMemo<ColumnDef<Task>[]>(() => [
    { key: "title", header: "Задача" },
    {
      key: "difficulty",
      header: "Сложность",
      cell: (t) => (
        <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
          {t.difficulty}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      key: "dueAt",
      header: "Дедлайн",
      accessor: (t) => new Date(t.dueAt).toLocaleString(),
      className: "whitespace-nowrap",
    },
    {
      key: "status",
      header: "Статус",
      cell: (t) => (
        <span className="text-sm capitalize">
          {t.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Действия",
      className: "text-right",
      cell: (t) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const title = prompt("Изменить название задачи:", t.title ?? "");
              if (title && title !== t.title) {
                edit.mutate({ id: t.id, title });
              }
            }}
            isLoading={edit.isPending}
          >
            Редактировать
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(`Удалить задачу «${t.title}»?`)) {
                remove.mutate(t.id);
              }
            }}
            isLoading={remove.isPending}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ], [edit.isPending, remove.isPending]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Задачи</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable<Task>
          data={data}
          columns={columns}
          rowKey={(t) => t.id}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
