// Типы для создания задачи и запуска битвы
export interface CreateTaskPayload {
  title: string;
  description: string;
  correct_answer: string;
  difficulty?: Difficulty;
}

export interface LaunchBattlePayload {
  task_ids: string[];
  team_id: string;
  name?: string;
  startsAt?: string;
}
/** Создаёт новую задачу */
export async function createTask(
  payload: CreateTaskPayload,
  opts?: ReqOpts
): Promise<Task> {
  const { signal, config } = opts ?? {};
  return await apiPost<Task, CreateTaskPayload>(
    "/tasks",
    payload,
    { signal, ...(config ?? {}) }
  );
}

/** Запускает новую битву */
export async function launchBattle(
  payload: LaunchBattlePayload,
  opts?: ReqOpts
): Promise<Battle> {
  const { signal, config } = opts ?? {};
  return await apiPost<Battle, LaunchBattlePayload>(
    "/battles/launch",
    payload,
    { signal, ...(config ?? {}) }
  );
}
// src/app/services/endpoints.ts
import type { AxiosRequestConfig } from "axios";
import { apiGet, apiPost } from "./api";

/* ===========================
   Типы DTO (минимальные примеры)
   =========================== */

export type TaskStatus = "new" | "in_progress" | "done";
export type Difficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  difficulty?: Difficulty;
  createdAt?: string; // ISO
}

export interface SubmitAnswerPayload {
  taskId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  explanation?: string;
  scoreDelta?: number;
}

export type BattleStatus = "scheduled" | "live" | "finished";
export interface Battle {
  id: string;
  name: string;
  startsAt: string; // ISO
  status: BattleStatus;
}

export interface Team {
  id: string;
  name: string;
  membersCount?: number;
}

export type UserRole = "student" | "teacher" | "admin";
export interface User {
  id: string;
  name: string;
  role: UserRole;
}

/** Необязательные опции для проброса AbortSignal/конфига Axios */
type ReqOpts = { signal?: AbortSignal; config?: AxiosRequestConfig };

/* ===========================
   Эндпоинты (через обёртки apiGet/apiPost)
   =========================== */

/** Получает список задач */
export async function getTasks(opts?: ReqOpts): Promise<Task[]> {
  const { signal, config } = opts ?? {};
  // apiGet уже обёрнут в try/catch и логирует ошибки
  return await apiGet<Task[]>("/tasks", { signal, ...(config ?? {}) });
}

/** Отправляет ответ на задачу */
export async function submitAnswer(
  payload: SubmitAnswerPayload,
  opts?: ReqOpts
): Promise<SubmitAnswerResponse> {
  const { signal, config } = opts ?? {};
  return await apiPost<SubmitAnswerResponse, SubmitAnswerPayload>(
    "/tasks/submit",
    payload,
    { signal, ...(config ?? {}) }
  );
}

/** Получает данные о битве по ID */
export async function getBattle(
  battleId: string,
  opts?: ReqOpts
): Promise<Battle> {
  const { signal, config } = opts ?? {};
  return await apiGet<Battle>(`/battles/${battleId}`, {
    signal,
    ...(config ?? {}),
  });
}

/** Получает данные о текущей команде */
export async function getTeam(opts?: ReqOpts): Promise<Team> {
  const { signal, config } = opts ?? {};
  // При необходимости измените путь на /me/team или /teams/current
  return await apiGet<Team>("/teams/me", { signal, ...(config ?? {}) });
}

/** Получает данные о пользователе по ID */
export async function getUser(
  userId: string,
  opts?: ReqOpts
): Promise<User> {
  const { signal, config } = opts ?? {};
  return await apiGet<User>(`/users/${userId}`, { signal, ...(config ?? {}) });
}

/** Удобный агрегат (по желанию) */
export const endpoints = {
  getTasks,
  submitAnswer,
  getBattle,
  getTeam,
  getUser,
  createTask,
  launchBattle,
};
