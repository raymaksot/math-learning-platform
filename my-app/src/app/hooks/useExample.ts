import { useQuery } from "@tanstack/react-query";

export function useExample() {
  return useQuery({
    queryKey: ["example"],
    queryFn: async () => {
      // имитация запроса
      return Promise.resolve({ ok: true, timestamp: Date.now() });
    },
  });
}
