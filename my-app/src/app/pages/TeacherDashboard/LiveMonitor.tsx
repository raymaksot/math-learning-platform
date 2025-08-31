// src/app/pages/TeacherDashboard/LiveMonitor.tsx
import { useQuery } from "@tanstack/react-query";
import { getLiveStats } from "./api";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/components/Card";

export default function LiveMonitor() {
  const { data, isLoading } = useQuery({
    queryKey: ["live-stats"],
    queryFn: getLiveStats,
    refetchInterval: 3000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live монитор</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            Загрузка…
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Активных битв" value={data.activeBattles} />
            <Stat label="Онлайн студентов" value={data.onlineStudents} />
            <Stat label="Отправок / мин" value={data.submissionsLastMin} />
            <div className="col-span-3 text-xs text-gray-500">
              Обновлено: {new Date(data.updatedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}
