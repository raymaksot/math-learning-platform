import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CreateTaskModal from "../../widgets/CreateTaskModal";
import LaunchBattleModal from "../../widgets/LaunchBattleModal";
import { endpoints, type Task } from "../../services/endpoints";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";
import Button from "../../shared/components/Button";

export default function TeacherDashboard() {
  const { data: tasks, isLoading, isError, refetch } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => endpoints.getTasks(),
    staleTime: 10_000,
  });

  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [isLaunchBattleModalOpen, setLaunchBattleModalOpen] = useState(false);

  const columns: ColumnDef<Task>[] = [
    { key: "title", header: "Название" },
    { key: "status", header: "Статус" },
    { key: "difficulty", header: "Сложность" },
    { key: "createdAt", header: "Создана", render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "—" },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Панель учителя</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateTaskModalOpen(true)}>
            Создать задачу
          </Button>
          <Button onClick={() => setLaunchBattleModalOpen(true)}>
            Запустить битву
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className="text-center py-6 text-lg">Загрузка задач...</div>
      )}
      {isError && (
        <div className="text-center py-6 text-red-600">Ошибка загрузки задач</div>
      )}
      {!isLoading && !isError && (
        <DataTable<Task>
          data={tasks ?? []}
          columns={columns}
          rowKey={(row) => row.id}
        />
      )}

      {isCreateTaskModalOpen && (
        <CreateTaskModal onClose={() => setCreateTaskModalOpen(false)} />
      )}
      {isLaunchBattleModalOpen && (
        <LaunchBattleModal onClose={() => setLaunchBattleModalOpen(false)} />
      )}
    </div>
  );
}
