import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TARIFFS = [
  { name: "Старт", amount: 2000, min_daily: 0.5, max_daily: 1.5 },
  { name: "Стандарт", amount: 5000, min_daily: 1.0, max_daily: 2.0 },
  { name: "Премиум", amount: 10000, min_daily: 1.5, max_daily: 2.5 },
];

const PERIODS = [
  { days: 14, bonus: 0, label: "14 дней" },
  { days: 28, bonus: 1, label: "28 дней (+1%)" },
  { days: 42, bonus: 2, label: "42 дня (+2%)" },
];

type Tab = "overview" | "invest" | "deposit" | "withdraw" | "history";

interface Investment {
  id: number;
  tariff_name: string;
  amount: number;
  min_daily: number;
  max_daily: number;
  bonus_percent: number;
  period_days: number;
  started_at: string;
  ends_at: string;
  status: string;
  accrued: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  comment: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ full_name: string; email: string; balance: number; is_admin: boolean } | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  const [selectedTariff, setSelectedTariff] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [investMsg, setInvestMsg] = useState("");

  const [depositAmount, setDepositAmount] = useState("");
  const [depositMsg, setDepositMsg] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setBalance(u.balance || 0);
    loadData();
  }, []);

  const loadData = async () => {
    const [inv, txs] = await Promise.all([api.investments(), api.transactions()]);
    if (inv.investments) setInvestments(inv.investments);
    if (inv.balance !== undefined) {
      setBalance(inv.balance);
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        u.balance = inv.balance;
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      }
    }
    if (txs.transactions) setTransactions(txs.transactions);
  };

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleInvest = async () => {
    const t = TARIFFS[selectedTariff];
    const p = PERIODS[selectedPeriod];
    setLoading(true);
    const data = await api.createInvestment({
      tariff_name: t.name,
      amount: t.amount,
      min_daily: t.min_daily,
      max_daily: t.max_daily,
      bonus_percent: p.bonus,
      period_days: p.days,
    });
    setLoading(false);
    if (data.error) { setInvestMsg(data.error); return; }
    setInvestMsg("Инвестиция успешно создана!");
    loadData();
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { setDepositMsg("Введите сумму"); return; }
    setLoading(true);
    const data = await api.deposit(amount);
    setLoading(false);
    setDepositMsg(data.message || data.error || "");
    if (!data.error) setDepositAmount("");
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { setWithdrawMsg("Введите сумму"); return; }
    setLoading(true);
    const data = await api.withdraw(amount, withdrawDetails);
    setLoading(false);
    setWithdrawMsg(data.message || data.error || "");
    if (!data.error) { setWithdrawAmount(""); setWithdrawDetails(""); loadData(); }
  };

  const tariff = TARIFFS[selectedTariff];
  const period = PERIODS[selectedPeriod];
  const minProfit = ((tariff.min_daily + period.bonus) / 100) * tariff.amount * period.days;
  const maxProfit = ((tariff.max_daily + period.bonus) / 100) * tariff.amount * period.days;

  const typeLabel: Record<string, string> = { deposit: "Пополнение", withdraw: "Вывод", invest: "Инвестиция" };
  const statusLabel: Record<string, string> = { pending: "В обработке", completed: "Выполнено", rejected: "Отклонено" };
  const statusColor: Record<string, string> = { pending: "text-yellow-400", completed: "text-green-400", rejected: "text-red-400" };

  const navItems: { key: Tab; label: string }[] = [
    { key: "overview", label: "Обзор" },
    { key: "invest", label: "Инвестировать" },
    { key: "deposit", label: "Пополнить" },
    { key: "withdraw", label: "Вывести" },
    { key: "history", label: "История" },
  ];

  return (
    <main className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl text-foreground">ЗолотойКапитал</span>
            <span className="text-primary text-xs tracking-widest uppercase hidden sm:block">· Личный кабинет</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm hidden md:block">{user?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="text-muted-foreground text-sm hover:text-primary transition-colors">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Balance card */}
        <div className="relative p-6 bg-card border border-border mb-8">
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-1">Баланс счёта</p>
              <div className="font-serif text-4xl text-gold-gradient">{balance.toLocaleString("ru")} ₽</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setTab("deposit")} className="px-4 py-2 border border-primary text-primary text-sm hover:bg-primary hover:text-primary-foreground transition-all">
                + Пополнить
              </button>
              <button onClick={() => setTab("withdraw")} className="px-4 py-2 border border-border text-muted-foreground text-sm hover:border-primary hover:text-primary transition-all">
                Вывести
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setInvestMsg(""); setDepositMsg(""); setWithdrawMsg(""); }}
              className={`px-4 py-3 text-sm whitespace-nowrap transition-all ${
                tab === item.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">Активные инвестиции</h2>
            {investments.filter((i) => i.status === "active").length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="mb-4">У вас пока нет активных инвестиций</p>
                <button onClick={() => setTab("invest")} className="text-primary hover:underline text-sm">
                  Начать инвестировать →
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {investments.filter((i) => i.status === "active").map((inv) => {
                  const ends = new Date(inv.ends_at);
                  const daysLeft = Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86400000));
                  return (
                    <div key={inv.id} className="relative p-6 bg-card border border-border">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-primary text-xs tracking-widest uppercase">{inv.tariff_name}</p>
                          <p className="font-serif text-2xl text-foreground">{inv.amount.toLocaleString("ru")} ₽</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1">Активна</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Доходность</span>
                          <span className="text-foreground">{inv.min_daily + inv.bonus_percent}% — {inv.max_daily + inv.bonus_percent}% / день</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Срок</span>
                          <span className="text-foreground">{inv.period_days} дней</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Осталось</span>
                          <span className="text-primary font-semibold">{daysLeft} дн.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Завершается</span>
                          <span className="text-foreground">{ends.toLocaleDateString("ru")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* INVEST */}
        {tab === "invest" && (
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl text-foreground mb-6">Новая инвестиция</h2>

            <div className="mb-6">
              <p className="text-muted-foreground text-sm mb-3 tracking-wide uppercase">Выберите пакет</p>
              <div className="grid grid-cols-3 gap-3">
                {TARIFFS.map((t, i) => (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTariff(i)}
                    className={`p-4 border cursor-pointer text-center transition-all ${
                      selectedTariff === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-muted-foreground text-xs uppercase mb-1">{t.name}</p>
                    <p className="font-serif text-xl text-gold-gradient">{t.amount.toLocaleString("ru")} ₽</p>
                    <p className="text-muted-foreground text-xs mt-1">{t.min_daily}–{t.max_daily}%/день</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground text-sm mb-3 tracking-wide uppercase">Выберите срок</p>
              <div className="grid grid-cols-3 gap-3">
                {PERIODS.map((p, i) => (
                  <div
                    key={p.days}
                    onClick={() => setSelectedPeriod(i)}
                    className={`p-4 border cursor-pointer text-center transition-all ${
                      selectedPeriod === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-serif text-lg text-foreground">{p.days} дн.</p>
                    {p.bonus > 0 && <p className="text-primary text-xs">+{p.bonus}%</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-card border border-primary/30 mb-6 text-center">
              <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wide">Расчёт прибыли</p>
              <p className="font-serif text-3xl text-gold-gradient">
                {Math.round(minProfit).toLocaleString("ru")} — {Math.round(maxProfit).toLocaleString("ru")} ₽
              </p>
              <p className="text-muted-foreground text-xs mt-1">за {period.days} дней</p>
            </div>

            {balance < tariff.amount && (
              <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-sm mb-4">
                Недостаточно средств. Ваш баланс: {balance.toLocaleString("ru")} ₽.{" "}
                <button onClick={() => setTab("deposit")} className="underline">Пополнить счёт</button>
              </div>
            )}

            {investMsg && (
              <p className={`text-sm mb-4 ${investMsg.includes("успешно") ? "text-green-400" : "text-red-400"}`}>
                {investMsg}
              </p>
            )}

            <Button
              onClick={handleInvest}
              disabled={loading || balance < tariff.amount}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider"
            >
              {loading ? "Обработка..." : `Инвестировать ${tariff.amount.toLocaleString("ru")} ₽`}
            </Button>
          </div>
        )}

        {/* DEPOSIT */}
        {tab === "deposit" && (
          <div className="max-w-md">
            <h2 className="font-serif text-2xl text-foreground mb-2">Пополнение счёта</h2>
            <p className="text-muted-foreground text-sm mb-6">Введите сумму — мы свяжемся с вами для подтверждения платежа.</p>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm mb-1 block">Сумма пополнения (₽)</label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="2000"
                  min="1"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              {depositMsg && (
                <p className={`text-sm ${depositMsg.includes("принята") ? "text-green-400" : "text-red-400"}`}>
                  {depositMsg}
                </p>
              )}
              <Button
                onClick={handleDeposit}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider"
              >
                {loading ? "Отправка..." : "Подать заявку на пополнение"}
              </Button>
            </div>
          </div>
        )}

        {/* WITHDRAW */}
        {tab === "withdraw" && (
          <div className="max-w-md">
            <h2 className="font-serif text-2xl text-foreground mb-2">Вывод средств</h2>
            <p className="text-muted-foreground text-sm mb-6">Вывод доступен по завершении инвестиционного периода.</p>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm mb-1 block">Сумма вывода (₽)</label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-sm mb-1 block">Реквизиты (карта / кошелёк)</label>
                <Input
                  type="text"
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  placeholder="Номер карты или кошелька"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Доступно к выводу: <span className="text-primary font-semibold">{balance.toLocaleString("ru")} ₽</span>
              </p>
              {withdrawMsg && (
                <p className={`text-sm ${withdrawMsg.includes("принята") ? "text-green-400" : "text-red-400"}`}>
                  {withdrawMsg}
                </p>
              )}
              <Button
                onClick={handleWithdraw}
                disabled={loading || balance <= 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider"
              >
                {loading ? "Отправка..." : "Подать заявку на вывод"}
              </Button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">История операций</h2>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Операций пока нет</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-card border border-border">
                    <div>
                      <p className="text-foreground text-sm font-medium">{typeLabel[tx.type] || tx.type}</p>
                      <p className="text-muted-foreground text-xs">{tx.comment}</p>
                      <p className="text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleString("ru")}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === "deposit" || tx.type === "invest" ? "text-foreground" : "text-red-400"}`}>
                        {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString("ru")} ₽
                      </p>
                      <p className={`text-xs ${statusColor[tx.status] || "text-muted-foreground"}`}>
                        {statusLabel[tx.status] || tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
