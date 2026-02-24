import { useState } from "react";
import { ArtDecoSunburst } from "@/components/ArtDecoSunburst";
import { ArtDecoDivider } from "@/components/ArtDecoDivider";
import { CTAForm } from "@/components/CTAForm";

const tariffs = [
  {
    name: "Старт",
    amount: "2 000 ₽",
    daily: "0,5% — 1,5%",
    color: "border-primary/50",
    badge: "",
  },
  {
    name: "Стандарт",
    amount: "5 000 ₽",
    daily: "1% — 2%",
    color: "border-primary",
    badge: "Популярный",
  },
  {
    name: "Премиум",
    amount: "10 000 ₽",
    daily: "1,5% — 2,5%",
    color: "border-primary/80",
    badge: "Максимум",
  },
];

const periods = [
  {
    days: 14,
    label: "14 дней",
    bonus: "+0,5% к тарифу",
    weekend: "0,5% в выходные",
    desc: "Оптимально для первого входа",
  },
  {
    days: 28,
    label: "28 дней",
    bonus: "+1% к тарифу",
    weekend: "0,5% в выходные",
    desc: "Сбалансированный доход",
  },
  {
    days: 42,
    label: "42 дня",
    bonus: "+1,5% к тарифу",
    weekend: "0,5% в выходные",
    desc: "Максимальная прибыль",
  },
];

const stats = [
  { value: "2024", label: "Год основания" },
  { value: "5 000+", label: "Активных инвесторов" },
  { value: "2,5%", label: "До в день" },
  { value: "100%", label: "Гарантия вывода" },
];

export default function App() {
  const [selectedTariff, setSelectedTariff] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const tariff = tariffs[selectedTariff];
  const period = periods[selectedPeriod];

  const minDaily = parseFloat(tariff.daily.split(" — ")[0].replace(",", "."));
  const maxDaily = parseFloat(tariff.daily.split(" — ")[1].replace(",", "."));
  const bonusPercent = parseFloat(period.bonus.replace("+", "").replace("% к тарифу", "").replace(",", "."));
  const amount = parseInt(tariff.amount.replace(/\D/g, ""));

  const minProfit = ((minDaily + bonusPercent) / 100) * amount * period.days;
  const maxProfit = ((maxDaily + bonusPercent) / 100) * amount * period.days;

  return (
    <main className="min-h-screen bg-background dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <ArtDecoSunburst />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-px bg-primary" />
              <div className="w-3 h-3 rotate-45 border border-primary" />
              <div className="w-16 h-px bg-primary" />
            </div>
          </div>

          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-6">Форекс-инвестиции · С 2024 года</p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-tight">
            <span className="text-gold-gradient">Золотой</span>Капитал
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            Профессиональные инвестиции на рынке Форекс. Прозрачная доходность от&nbsp;<span className="text-primary font-semibold">0,5% до 2,5% в&nbsp;день</span>. Вывод средств гарантирован.
          </p>

          <a
            href="#tariffs"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 font-medium tracking-wider uppercase text-sm hover:bg-primary/90 transition-all duration-300"
          >
            Начать инвестировать
          </a>

          <div className="flex justify-center mt-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary to-primary" />
              <div className="w-2 h-2 rotate-45 bg-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl md:text-4xl text-gold-gradient mb-2">{s.value}</div>
              <div className="text-muted-foreground text-sm tracking-wide uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ArtDecoDivider variant="stepped" />
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">О компании</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight text-balance">
                Ваши деньги работают 24/7 на&nbsp;Форекс
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                ЗолотойКапитал — команда профессиональных трейдеров с многолетним опытом работы на валютных рынках. Мы используем проверенные алгоритмы и строгое управление рисками, чтобы обеспечить стабильный доход вашим инвестициям.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Каждый инвестор получает личный кабинет с отслеживанием доходности в реальном времени. Ввод и вывод средств — в любое время. Выплата прибыли — по окончании инвестиционного периода.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tariffs Section */}
      <section id="tariffs" className="py-24 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">Инвестиционные пакеты</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground text-balance">Выберите сумму вхождения</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {tariffs.map((t, i) => (
              <div
                key={t.name}
                onClick={() => setSelectedTariff(i)}
                className={`group relative p-8 bg-card border-2 cursor-pointer transition-all duration-500 ${
                  selectedTariff === i ? "border-primary shadow-[0_0_30px_hsl(43,74%,49%,0.2)]" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />

                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-4 py-1 tracking-wider uppercase">
                    {t.badge}
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <p className="text-muted-foreground tracking-widest uppercase text-xs mb-3">{t.name}</p>
                  <div className="font-serif text-4xl text-gold-gradient mb-2">{t.amount}</div>
                  <p className="text-muted-foreground text-sm mb-4">от</p>
                  <div className="text-2xl font-semibold text-foreground mb-1">{t.daily}</div>
                  <p className="text-muted-foreground text-sm">% в день</p>
                </div>

                {selectedTariff === i && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-primary" />
                )}
              </div>
            ))}
          </div>

          {/* Period Selection */}
          <div className="text-center mb-10">
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">Срок инвестирования</p>
            <h3 className="font-serif text-3xl text-foreground mb-8">Выберите период</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {periods.map((p, i) => (
              <div
                key={p.days}
                onClick={() => setSelectedPeriod(i)}
                className={`relative p-6 bg-card border cursor-pointer transition-all duration-300 text-center ${
                  selectedPeriod === i ? "border-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-serif text-3xl text-gold-gradient mb-2">{p.label}</div>
                <p className="text-primary font-semibold mb-1">{p.bonus}</p>
                <p className="text-muted-foreground text-sm mb-1">{p.weekend}</p>
                <p className="text-muted-foreground text-xs mt-2">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Calculator */}
          <div className="relative p-8 md:p-10 border border-primary/30 bg-card text-center max-w-2xl mx-auto">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary" />

            <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4">Ваш расчёт прибыли</p>
            <div className="flex justify-center items-baseline gap-3 mb-2">
              <span className="font-serif text-5xl text-gold-gradient">
                {Math.round(minProfit).toLocaleString("ru")} — {Math.round(maxProfit).toLocaleString("ru")}
              </span>
              <span className="text-primary text-2xl">₽</span>
            </div>
            <p className="text-muted-foreground text-sm">
              за {period.days} дней · вложение {tariff.amount} · {tariff.daily}% + {period.bonus}
            </p>
            <p className="text-muted-foreground text-xs mt-2">+ 0,5% каждый выходной день</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ArtDecoDivider variant="fan" />
          <div className="text-center mb-16">
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">Как это работает</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">Три шага к доходу</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Регистрация", desc: "Создайте личный кабинет — это займёт 2 минуты. Все данные защищены." },
              { step: "02", title: "Пополнение", desc: "Выберите тариф и срок, пополните счёт. Работа начинается сразу." },
              { step: "03", title: "Вывод прибыли", desc: "По истечении срока забирайте тело вклада и всю накопленную прибыль." },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="font-serif text-7xl text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2 leading-none select-none">
                  {item.step}
                </div>
                <div className="relative z-10 pt-8">
                  <div className="w-16 h-px bg-primary mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <div className="relative text-center py-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-primary/20 font-serif text-9xl leading-none">
              &ldquo;
            </div>
            <blockquote className="relative z-10">
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed italic mb-8">
                За 42 дня с вложения 10&nbsp;000 рублей я получил более 12&nbsp;000 рублей чистой прибыли. Всё честно, вывод прошёл мгновенно.
              </p>
              <footer className="text-muted-foreground">
                <span className="text-primary">—</span> Инвестор клуба,{" "}
                <span className="text-primary">Санкт-Петербург</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <ArtDecoSunburst />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <ArtDecoDivider variant="chevron" />
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-4">Начните сейчас</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 text-balance">Оставьте заявку на&nbsp;вход</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Оставьте email — мы свяжемся с вами, поможем выбрать тариф и откроем личный кабинет.
            </p>
          </div>

          <div className="relative p-8 md:p-12 border border-border">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary" />
            <CTAForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-primary" />
              <span className="font-serif text-xl text-foreground">ЗолотойКапитал</span>
              <div className="w-12 h-px bg-primary" />
            </div>
            <p className="text-muted-foreground text-sm text-center max-w-md">
              Инвестиции в финансовые инструменты сопряжены с риском. Прошлая доходность не гарантирует будущих результатов.
            </p>
            <p className="text-muted-foreground/50 text-xs">© 2024 ЗолотойКапитал. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
