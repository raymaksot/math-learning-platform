import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [answer, setAnswer] = useState("");

  // Мутация для создания задачи
  const mutation = useMutation({
    mutationFn: async () => {
      // createTask должен быть реализован в endpoints
      // return await endpoints.createTask({ title, description, answer });
      return Promise.resolve({}); // временная заглушка
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Создать новую задачу</CardTitle>
        </CardHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <CardContent>
            <Input label="Название" value={title} onChange={e => setTitle(e.target.value)} required />
            <Input label="Описание" value={description} onChange={e => setDescription(e.target.value)} required />
            <Input label="Правильный ответ" value={answer} onChange={e => setAnswer(e.target.value)} required />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Отмена</Button>
            <Button type="submit" isLoading={mutation.isPending}>Создать</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
