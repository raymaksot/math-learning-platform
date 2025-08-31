import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

/**
 * Источник токена.
 * При желании подмените на secure storage / Zustand / Context.
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

/**
 * Базовый URL берём из переменной окружения Vite.
 * Пример: VITE_API_URL=https://api.example.com
 * Фолбэк на "/api".
 */
const BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL?.toString() || "/api";

/**
 * Экземпляр Axios
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  // можно добавить заголовки по умолчанию:
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST interceptor:
 * добавляет Authorization: Bearer <token> для каждого запроса (если токен есть)
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      // не перезаписываем кастомный заголовок, если он уже установлен
      config.headers = config.headers ?? {};
      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("[API][Request] Ошибка подготовки запроса:", error.message);
    return Promise.reject(error);
  }
);

/**
 * RESPONSE interceptor:
 * централизованная обработка 401 / 429 / 5xx и сетевых ошибок
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Сетевые/таймауты (когда нет response)
    if (!error.response) {
      console.error("[API][Network] Сетевая ошибка или таймаут:", error.message);
      return Promise.reject(error);
    }

    const { status, config } = error.response;
    const url = config?.url ?? "<unknown>";

    if (status === 401) {
      console.warn(`[API][401] Неавторизован. URL: ${url}`);
      // здесь можно инициировать логаут/обновление токена/редирект
    } else if (status === 429) {
      const retryAfter =
        (error.response.headers?.["retry-after"] as string | undefined) ?? "";
      console.warn(
        `[API][429] Превышен лимит запросов. URL: ${url} ${
          retryAfter ? `(Retry-After: ${retryAfter}s)` : ""
        }`
      );
    } else if (status >= 500) {
      console.error(`[API][${status}] Ошибка сервера. URL: ${url}`);
    } else {
      // Прочие статусы (400, 403, 404 и т.д.)
      console.warn(`[API][${status}] Ошибка запроса. URL: ${url}`);
    }

    return Promise.reject(error);
  }
);

/* ===========================
   Универсальные обёртки (try/catch)
   =========================== */

function logAndWrap(error: unknown, context: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? "NO_RESPONSE";
    const msg = error.message || "Axios error";
    console.error(`[API][${context}] Status: ${status}; Message: ${msg}`);
  } else {
    console.error(`[API][${context}] Unknown error:`, error);
  }
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await api.get<T>(url, config);
    return res.data;
  } catch (error) {
    logAndWrap(error, `GET ${url}`);
    throw error;
  }
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await api.post<T>(url, body, config);
    return res.data;
  } catch (error) {
    logAndWrap(error, `POST ${url}`);
    throw error;
  }
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await api.put<T>(url, body, config);
    return res.data;
  } catch (error) {
    logAndWrap(error, `PUT ${url}`);
    throw error;
  }
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await api.patch<T>(url, body, config);
    return res.data;
  } catch (error) {
    logAndWrap(error, `PATCH ${url}`);
    throw error;
  }
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await api.delete<T>(url, config);
    return res.data;
  } catch (error) {
    logAndWrap(error, `DELETE ${url}`);
    throw error;
  }
}

/**
 * Иногда полезно экспортировать сам инстанс,
 * чтобы использовать кастомные методы / загрузку файлов и т.п.
 */
export { api as axiosInstance };
