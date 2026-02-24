import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = await api.register(form.email, form.password, form.full_name, form.phone);
    setLoading(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard");
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
          <h1 className="font-serif text-3xl text-foreground">Регистрация</h1>
        </div>

        <div className="relative p-8 border border-border bg-card">
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm mb-1 block">Имя и фамилия</label>
              <Input
                type="text"
                value={form.full_name}
                onChange={set("full_name")}
                required
                placeholder="Иван Иванов"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm mb-1 block">Телефон</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+7 999 000 00 00"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                placeholder="your@email.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm mb-1 block">Пароль</label>
              <Input
                type="password"
                value={form.password}
                onChange={set("password")}
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
              {loading ? "Регистрация..." : "Создать аккаунт"}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Войти
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
