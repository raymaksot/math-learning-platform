// src/app/pages/TeacherDashboard/TeacherDashboard.tsx
import TaskTable from "./TaskTable";
import BattleCreator from "./BattleCreator";
import LiveMonitor from "./LiveMonitor";

export default function TeacherDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskTable />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <BattleCreator />
          <LiveMonitor />
        </div>
      </div>
    </div>
  );
}
