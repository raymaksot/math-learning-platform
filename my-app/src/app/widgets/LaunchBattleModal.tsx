import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../shared/components/Card";
import Button from "../shared/components/Button";

// Простой Input-компонент
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-3">
      <span className="block mb-1 text-sm font-medium">{label}</span>
      <input className="w-full border rounded px-3 py-2" {...props} />
    </label>
  );
}

export default function LaunchBattleModal({ onClose }: { onClose: () => void }) {
  const [selectedTasks, setSelectedTasks] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  // Мутация для запуска битвы
  const mutation = useMutation({
    mutationFn: async () => {
      // launchBattle должен быть реализован в endpoints
      // return await endpoints.launchBattle({ tasks: selectedTasks, team: selectedTeam });
      return Promise.resolve({}); // временная заглушка
    },
    onSuccess: () => {
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Запустить битву</CardTitle>
        </CardHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <CardContent>
            <Input label="ID задач (через запятую)" value={selectedTasks} onChange={e => setSelectedTasks(e.target.value)} required />
            <Input label="ID команды" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} required />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Отмена</Button>
            <Button type="submit" isLoading={mutation.isPending}>Запустить</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
