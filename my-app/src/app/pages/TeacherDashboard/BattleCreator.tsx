// src/app/pages/TeacherDashboard/BattleCreator.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createBattle } from "./api";
import Button from "../../shared/components/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/components/Card";

export default function BattleCreator() {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0,16));
  const [durationMin, setDurationMin] = useState(30);

  const mutation = useMutation({
    mutationFn: createBattle,
    onSuccess: (res) => {
      alert(`Битва создана! ID: ${res.id}`);
      setTitle("");
      setStartsAt(new Date().toISOString().slice(0,16));
      setDurationMin(30);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать битву</CardTitle>
        <CardDescription>Заполните поля и запустите активность для учеников.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({
              title,
              startsAt: new Date(startsAt).toISOString(),
              durationMin: Number(durationMin),
            });
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 rounded-xl border border-gray-300 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Например, «Битва уравнений»"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Начало</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="h-10 rounded-xl border border-gray-300 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Длительность (мин.)</label>
            <input
              type="number"
              min={5}
              step={5}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              required
              className="h-10 w-32 rounded-xl border border-gray-300 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={mutation.isPending}>
              Запустить битву
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
