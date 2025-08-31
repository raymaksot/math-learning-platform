// src/app/pages/TeacherDashboard/api.ts
export type Task = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  dueAt: string; // ISO
  status: "draft" | "published" | "archived";
};

export type LiveStats = {
  activeBattles: number;
  onlineStudents: number;
  submissionsLastMin: number;
  updatedAt: string; // ISO
};

const STORAGE_KEY = "teacher_tasks_v1";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function load(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const seed: Task[] = [
    {
      id: crypto.randomUUID(),
      title: "Уравнения 7 класс",
      difficulty: "easy",
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      status: "published",
    },
    {
      id: crypto.randomUUID(),
      title: "Геометрия: треугольники",
      difficulty: "medium",
      dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: "draft",
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function save(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export async function getTasks(): Promise<Task[]> {
  await delay(400);
  return load();
}

export async function updateTask(patch: Partial<Task> & { id: string }) {
  await delay(350);
  const tasks = load();
  const idx = tasks.findIndex((t) => t.id === patch.id);
  if (idx === -1) throw new Error("Task not found");
  tasks[idx] = { ...tasks[idx], ...patch };
  save(tasks);
  return tasks[idx];
}

export async function deleteTask(id: string) {
  await delay(300);
  const tasks = load().filter((t) => t.id !== id);
  save(tasks);
}

export async function createBattle(payload: {
  title: string;
  startsAt: string; // ISO
  durationMin: number;
}) {
  await delay(500);
  // Ничего не сохраняем по-настоящему — просто фейковый успех
  return { id: crypto.randomUUID(), ...payload };
}

export async function getLiveStats(): Promise<LiveStats> {
  await delay(250);
  const r = () => Math.floor(Math.random() * 10);
  return {
    activeBattles: 1 + r(),
    onlineStudents: 20 + r() * 5,
    submissionsLastMin: r(),
    updatedAt: new Date().toISOString(),
  };
}
