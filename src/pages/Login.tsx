import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = await api.login(email, password);
    setLoading(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate(data.user.is_admin ? "/admin" : "/dashboard");
  };

  return (
    <main className="min-h-screen bg-background dark flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-primary" />
            <span className="font-serif text-2xl text-foreground">ЗолотойКапитал</span>
            <div className="w-12 h-px bg-primary" />
          </div>
          <p className="text-primary tracking-[0.2em] uppercase text-xs mb-2">Личный кабинет</p>
          <h1 className="font-serif text-3xl text-foreground">Вход</h1>
        </div>

        <div className="relative p-8 border border-border bg-card">
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm mb-1 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm mb-1 block">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider text-sm"
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-muted-foreground/50 text-xs hover:text-primary">
            ← На главную
          </Link>
        </p>
      </div>
    </main>
  );
}
