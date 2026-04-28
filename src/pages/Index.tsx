import { useState } from "react";
import Icon from "@/components/ui/icon";

type Screen = "menu" | "characters" | "weapons" | "inventory" | "settings" | "newgame" | "continue";

const characters = [
  {
    id: "vex",
    name: "ВЕХ",
    role: "РАЗВЕДЧИК",
    shape: "hex",
    color: "#00ff9d",
    ability: "ФАНТОМНЫЙ ШАГ",
    abilityDesc: "Мгновенное перемещение на 12 м. Оставляет ложную копию на месте телепортации.",
    stats: { скорость: 95, атака: 60, защита: 45, энергия: 80 },
    desc: "Агент теней. Не существует — пока не поздно.",
    accentColor: "#00ff9d",
  },
  {
    id: "krath",
    name: "КРАТ",
    role: "РАЗРУШИТЕЛЬ",
    shape: "diamond",
    color: "#ff4d4d",
    ability: "СЕЙСМИЧЕСКИЙ УДАР",
    abilityDesc: "Удар по земле создаёт волну разрушения радиусом 8 м. Оглушает врагов на 2 сек.",
    stats: { скорость: 40, атака: 98, защита: 85, энергия: 55 },
    desc: "Живое оружие. Был создан — не рождён.",
    accentColor: "#ff4d4d",
  },
  {
    id: "nyra",
    name: "НИРА",
    role: "ИНЖЕНЕР",
    shape: "tri",
    color: "#a78bff",
    ability: "НЕЙРО-БАРЬЕР",
    abilityDesc: "Разворачивает энергетический купол на 6 сек. Блокирует 90% входящего урона.",
    stats: { скорость: 65, атака: 50, защита: 92, энергия: 99 },
    desc: "Строит системы. Ломает правила.",
    accentColor: "#a78bff",
  },
];

const weapons = [
  { name: "ИГЛОПУЛЬС", type: "Дальний бой", dmg: 74, rate: "ВЫСОКИЙ", rarity: "РЕДКИЙ" },
  { name: "ДУГА-9", type: "Средний бой", dmg: 91, rate: "СРЕДНИЙ", rarity: "ЭПИЧЕСКИЙ" },
  { name: "НУЛЬ-КЛИНОК", type: "Ближний бой", dmg: 120, rate: "НИЗКИЙ", rarity: "ЛЕГЕНДАРНЫЙ" },
  { name: "ПРИЗМА", type: "Дальний бой", dmg: 55, rate: "ВЫСОКИЙ", rarity: "ОБЫЧНЫЙ" },
];

const inventory = [
  { name: "Набор медика", qty: 3, icon: "Heart" },
  { name: "Граната-Вспышка", qty: 5, icon: "Zap" },
  { name: "Щитовой модуль", qty: 1, icon: "Shield" },
  { name: "Энергокристалл", qty: 12, icon: "Gem" },
  { name: "Дымовая шашка", qty: 8, icon: "Wind" },
  { name: "Боевой стимул", qty: 2, icon: "Activity" },
];

const rarityColor: Record<string, string> = {
  ОБЫЧНЫЙ: "#888",
  РЕДКИЙ: "#00aaff",
  ЭПИЧЕСКИЙ: "#a78bff",
  ЛЕГЕНДАРНЫЙ: "#ffd700",
};

function GeometricShape({ shape, color, size = 80 }: { shape: string; color: string; size?: number }) {
  const cls = shape === "hex" ? "hex-shape" : shape === "diamond" ? "diamond-shape" : "tri-shape";
  return (
    <div
      className={`${cls} animate-float`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}33, ${color}88)`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 20px ${color}66`,
      }}
    />
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <span className="text-white/40 uppercase w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/10 relative">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="text-white/60 w-6 text-right">{value}</span>
    </div>
  );
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedChar, setSelectedChar] = useState(0);

  const menuItems = [
    { id: "newgame", label: "НОВАЯ ИГРА", icon: "Play" },
    { id: "continue", label: "ПРОДОЛЖИТЬ", icon: "SkipForward" },
    { id: "characters", label: "ПЕРСОНАЖИ", icon: "Users" },
    { id: "weapons", label: "ОРУЖИЕ", icon: "Sword" },
    { id: "inventory", label: "ИНВЕНТАРЬ", icon: "Package" },
    { id: "settings", label: "НАСТРОЙКИ", icon: "Settings" },
    { id: "exit", label: "ВЫХОД", icon: "LogOut" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-bg overflow-hidden relative" style={{ fontFamily: "'Oswald', sans-serif" }}>
      <div className="scan-line" />

      {/* Ambient background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-32 w-64 h-64 hex-shape opacity-5 animate-float" style={{ background: "#00ff9d" }} />
        <div className="absolute bottom-32 left-16 w-48 h-48 diamond-shape opacity-5 animate-float" style={{ background: "#ff4d4d", animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-16 w-32 h-32 tri-shape opacity-5 animate-float" style={{ background: "#a78bff", animationDelay: "4s" }} />
      </div>

      {/* ═══ MAIN MENU ═══ */}
      {screen === "menu" && (
        <div className="min-h-screen flex">
          <div className="w-full max-w-md flex flex-col justify-between p-12 relative z-10">
            <div className="animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 diamond-shape animate-pulse-neon" style={{ background: "#00ff9d" }} />
                <span className="text-xs tracking-[0.5em] text-white/30 font-light" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  VOID // v0.1.0
                </span>
              </div>
              <h1 className="text-8xl font-bold leading-none tracking-tighter neon-text mt-4">
                VOID
              </h1>
              <p className="text-sm tracking-[0.3em] text-white/30 mt-2 uppercase">
                Геометрия войны
              </p>
            </div>

            <nav className="flex flex-col gap-1">
              {menuItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id !== "exit") setScreen(item.id as Screen);
                  }}
                  className={`menu-item animate-slide-left flex items-center gap-4 px-4 py-3.5 text-left transition-all duration-300 group border border-transparent hover:border-white/5 stagger-${i + 1}`}
                  style={{ animationFillMode: "forwards", opacity: 0 }}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    className="text-white/30 group-hover:text-[#00ff9d] transition-colors duration-300 shrink-0 relative z-10"
                    fallback="Circle"
                  />
                  <span className="text-2xl font-medium tracking-widest text-white/60 group-hover:text-white transition-colors duration-300 relative z-10">
                    {item.label}
                  </span>
                  <Icon
                    name="ChevronRight"
                    size={14}
                    className="ml-auto text-transparent group-hover:text-[#00ff9d] transition-all duration-300 relative z-10"
                  />
                </button>
              ))}
            </nav>

            <div className="animate-fade-in" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}>
              <div className="h-px bg-white/10 mb-4" />
              <p className="text-xs text-white/20 tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                © 2026 VOID STUDIOS
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <div className="relative">
              <div className="w-80 h-80 hex-shape animate-float opacity-20" style={{ background: "linear-gradient(135deg, #00ff9d33, #00ff9d88)", border: "1px solid #00ff9d" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 diamond-shape animate-float opacity-40" style={{ background: "linear-gradient(135deg, #00ff9d22, #00ff9d66)", animationDelay: "1s" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 tri-shape animate-pulse-neon" style={{ background: "#00ff9d88" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHARACTERS SCREEN ═══ */}
      {screen === "characters" && (
        <div className="min-h-screen p-10 relative z-10">
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              ВЫБОР // ПЕРСОНАЖА
            </span>
          </div>

          <h2 className="text-6xl font-bold text-white mb-8 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>
            ПЕРСОНАЖИ
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {characters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(i)}
                className={`char-card animate-fade-in text-left p-6 border bg-black/40 backdrop-blur transition-all stagger-${i + 2} ${selectedChar === i ? "active" : "border-white/10 hover:border-white/20"}`}
                style={{ animationFillMode: "forwards", opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <GeometricShape shape={c.shape} color={c.accentColor} size={64} />
                  <span
                    className="text-xs tracking-widest px-2 py-1 geo-clip-sm"
                    style={{ background: `${c.accentColor}22`, color: c.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {c.role}
                  </span>
                </div>

                <h3 className="text-4xl font-bold mb-1" style={{ color: selectedChar === i ? c.accentColor : "#fff" }}>
                  {c.name}
                </h3>
                <p className="text-sm text-white/40 mb-6 italic">{c.desc}</p>

                <div className="border border-white/10 p-3 geo-clip-sm mb-5" style={{ background: `${c.accentColor}0a` }}>
                  <p className="text-xs tracking-widest mb-1" style={{ color: c.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}>
                    СПОСОБНОСТЬ: {c.ability}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">{c.abilityDesc}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {Object.entries(c.stats).map(([k, v]) => (
                    <StatBar key={k} label={k} value={v} color={c.accentColor} />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end animate-fade-in">
            <button
              className="geo-clip px-8 py-4 text-lg font-bold tracking-widest transition-all hover:scale-105"
              style={{ background: characters[selectedChar].accentColor, color: "#0a0a0a", boxShadow: `0 0 20px ${characters[selectedChar].accentColor}66` }}
            >
              ВЫБРАТЬ {characters[selectedChar].name}
            </button>
          </div>
        </div>
      )}

      {/* ═══ WEAPONS SCREEN ═══ */}
      {screen === "weapons" && (
        <div className="min-h-screen p-10 relative z-10">
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              АРСЕНАЛ // СИСТЕМА
            </span>
          </div>

          <h2 className="text-6xl font-bold text-white mb-8 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>
            ОРУЖИЕ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weapons.map((w, i) => (
              <div
                key={w.name}
                className={`animate-fade-in p-5 border border-white/10 bg-black/40 geo-clip hover:border-white/30 transition-all cursor-pointer group stagger-${i + 2}`}
                style={{ animationFillMode: "forwards", opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#00ff9d] transition-colors tracking-wider">
                      {w.name}
                    </h3>
                    <p className="text-xs text-white/40 tracking-widest">{w.type}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 geo-clip-sm"
                    style={{ color: rarityColor[w.rarity], background: `${rarityColor[w.rarity]}22`, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {w.rarity}
                  </span>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-white/30 text-xs tracking-widest mb-1">УРОН</p>
                    <p className="text-3xl font-bold neon-text">{w.dmg}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs tracking-widest mb-1">СКОРОСТРЕЛЬНОСТЬ</p>
                    <p className="text-white/70 font-medium tracking-widest mt-1">{w.rate}</p>
                  </div>
                </div>

                <div className="mt-4 h-0.5 bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-[#00ff9d] group-hover:w-full transition-all duration-500" style={{ width: `${w.dmg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ INVENTORY SCREEN ═══ */}
      {screen === "inventory" && (
        <div className="min-h-screen p-10 relative z-10">
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              ИНВЕНТАРЬ // ЯЧЕЕК: 6/24
            </span>
          </div>

          <h2 className="text-6xl font-bold text-white mb-8 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>
            ИНВЕНТАРЬ
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {inventory.map((item, i) => (
              <div
                key={item.name}
                className={`animate-fade-in p-4 border border-white/10 bg-black/40 geo-clip hover:border-[#00ff9d]/40 hover:bg-[#00ff9d]/5 transition-all cursor-pointer group stagger-${i + 2}`}
                style={{ animationFillMode: "forwards", opacity: 0 }}
              >
                <div className="w-10 h-10 border border-white/20 geo-clip-sm flex items-center justify-center mb-3 group-hover:border-[#00ff9d]/50 transition-colors">
                  <Icon name={item.icon} size={18} className="text-white/40 group-hover:text-[#00ff9d] transition-colors" fallback="Package" />
                </div>
                <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors tracking-wide">{item.name}</p>
                <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>× {item.qty}</p>
              </div>
            ))}

            {[...Array(6)].map((_, i) => (
              <div key={`empty-${i}`} className="p-4 border border-white/5 bg-black/20 geo-clip flex items-center justify-center">
                <span className="text-white/10 text-2xl">+</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SETTINGS SCREEN ═══ */}
      {screen === "settings" && (
        <div className="min-h-screen p-10 relative z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              КОНФИГ // СИСТЕМЫ
            </span>
          </div>

          <h2 className="text-6xl font-bold text-white mb-8 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>
            НАСТРОЙКИ
          </h2>

          {[
            { label: "Графика", value: "УЛЬТРА", icon: "Monitor" },
            { label: "Звук", value: "80%", icon: "Volume2" },
            { label: "Музыка", value: "60%", icon: "Music" },
            { label: "Язык", value: "РУС", icon: "Globe" },
            { label: "Управление", value: "КЛАВИАТУРА", icon: "Keyboard" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`animate-fade-in flex items-center justify-between p-4 border-b border-white/10 hover:border-[#00ff9d]/30 transition-all group cursor-pointer stagger-${i + 2}`}
              style={{ animationFillMode: "forwards", opacity: 0 }}
            >
              <div className="flex items-center gap-4">
                <Icon name={s.icon} size={16} className="text-white/30 group-hover:text-[#00ff9d] transition-colors" fallback="Settings" />
                <span className="text-lg tracking-widest text-white/70 group-hover:text-white transition-colors">{s.label}</span>
              </div>
              <span className="text-sm tracking-widest text-[#00ff9d]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ NEW GAME / CONTINUE ═══ */}
      {(screen === "newgame" || screen === "continue") && (
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 hex-shape animate-pulse-neon mx-auto mb-8" style={{ background: "#00ff9d33", border: "2px solid #00ff9d" }} />
            <h2 className="text-6xl font-bold neon-text mb-4">
              {screen === "newgame" ? "НОВАЯ ИГРА" : "ПРОДОЛЖИТЬ"}
            </h2>
            <p className="text-white/30 tracking-widest mb-8" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {screen === "newgame" ? "ИНИЦИАЛИЗАЦИЯ НОВОГО СОХРАНЕНИЯ..." : "ЗАГРУЗКА СОХРАНЕНИЯ #03..."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setScreen("characters")}
                className="geo-clip px-8 py-4 text-lg font-bold tracking-widest text-black transition-all hover:scale-105"
                style={{ background: "#00ff9d", boxShadow: "0 0 20px rgba(0,255,157,0.4)" }}
              >
                {screen === "newgame" ? "НАЧАТЬ" : "ЗАГРУЗИТЬ"}
              </button>
              <button
                onClick={() => setScreen("menu")}
                className="geo-clip px-8 py-4 text-lg font-bold tracking-widest text-white/60 border border-white/20 hover:border-white/40 transition-all"
              >
                НАЗАД
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
