import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../shared/components/Card";
import Button from "../../shared/components/Button";
import { useAuth } from "../../hooks/useAuth";

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-3">
      <span className="block mb-1 text-sm font-medium">{label}</span>
      <input className="w-full border rounded px-3 py-2" {...props} />
    </label>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input label="Логин" value={username} onChange={e => setUsername(e.target.value)} required />
            <Input label="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">Войти</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
