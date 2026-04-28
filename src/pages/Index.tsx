import { useState, useRef, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Screen = "menu" | "characters" | "weapons" | "inventory" | "settings" | "newgame" | "continue" | "game";

const characters = [
  {
    id: "vex",
    name: "ВЕХ",
    role: "РАЗВЕДЧИК",
    shape: "hex",
    ability: "ФАНТОМНЫЙ ШАГ",
    abilityDesc: "Мгновенное перемещение на 12 м. Оставляет ложную копию на месте телепортации.",
    stats: { скорость: 95, атака: 60, защита: 45, энергия: 80 },
    desc: "Агент теней. Не существует — пока не поздно.",
    accentColor: "#00ff9d",
    hp: 80,
  },
  {
    id: "krath",
    name: "КРАТ",
    role: "РАЗРУШИТЕЛЬ",
    shape: "diamond",
    ability: "СЕЙСМИЧЕСКИЙ УДАР",
    abilityDesc: "Удар по земле создаёт волну разрушения радиусом 8 м. Оглушает врагов на 2 сек.",
    stats: { скорость: 40, атака: 98, защита: 85, энергия: 55 },
    desc: "Живое оружие. Был создан — не рождён.",
    accentColor: "#ff4d4d",
    hp: 140,
  },
  {
    id: "nyra",
    name: "НИРА",
    role: "ИНЖЕНЕР",
    shape: "tri",
    ability: "НЕЙРО-БАРЬЕР",
    abilityDesc: "Разворачивает энергетический купол на 6 сек. Блокирует 90% входящего урона.",
    stats: { скорость: 65, атака: 50, защита: 92, энергия: 99 },
    desc: "Строит системы. Ломает правила.",
    accentColor: "#a78bff",
    hp: 100,
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
        <div className="absolute inset-y-0 left-0" style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      <span className="text-white/60 w-6 text-right">{value}</span>
    </div>
  );
}

// ═══ JOYSTICK ═══
function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const maxDist = 40;

  const handleStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    activeTouch.current = e.changedTouches[0].identifier;
  }, []);

  const handleMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!baseRef.current || !stickRef.current) return;
    const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouch.current);
    if (!touch) return;
    const rect = baseRef.current.getBoundingClientRect();
    let dx = touch.clientX - (rect.left + rect.width / 2);
    let dy = touch.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
    stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    onMove(dx / maxDist, dy / maxDist);
  }, [onMove]);

  const handleEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (stickRef.current) stickRef.current.style.transform = "translate(0,0)";
    activeTouch.current = null;
    onMove(0, 0);
  }, [onMove]);

  return (
    <div
      ref={baseRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      className="relative flex items-center justify-center rounded-full"
      style={{ width: 120, height: 120, background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.15)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0" style={{ borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "7px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0" style={{ borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "7px solid rgba(255,255,255,0.2)" }} />
      <div
        ref={stickRef}
        className="rounded-full"
        style={{ width: 44, height: 44, background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(255,255,255,0.1))", border: "2px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", transition: "none" }}
      />
    </div>
  );
}

// ═══ ACTION BUTTON ═══
function ActionBtn({ label, color, size = 64, onPress, icon }: { label: string; color: string; size?: number; onPress?: () => void; icon?: string; }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onTouchStart={(e) => { e.preventDefault(); setPressed(true); onPress?.(); }}
      onTouchEnd={(e) => { e.preventDefault(); setPressed(false); }}
      onClick={() => onPress?.()}
      className="flex flex-col items-center justify-center rounded-full select-none cursor-pointer"
      style={{
        width: size, height: size,
        background: pressed ? `${color}55` : `${color}22`,
        border: `2px solid ${color}${pressed ? "ff" : "88"}`,
        boxShadow: pressed ? `0 0 16px ${color}88` : `0 0 6px ${color}33`,
        transition: "all 0.08s ease",
        transform: pressed ? "scale(0.93)" : "scale(1)",
      }}
    >
      {icon && <Icon name={icon} size={size > 56 ? 20 : 15} style={{ color }} fallback="Circle" />}
      <span className="font-bold tracking-wider text-center leading-tight" style={{ color, fontFamily: "'Oswald', sans-serif", fontSize: size > 64 ? 10 : 8 }}>
        {label}
      </span>
    </div>
  );
}

// ═══ GAME SCREEN ═══
function GameScreen({ char, onBack }: { char: typeof characters[0]; onBack: () => void }) {
  const [hp, setHp] = useState(char.hp);
  const [energy, setEnergy] = useState(char.stats.энергия);
  const [isCrouch, setIsCrouch] = useState(false);
  const [isJump, setIsJump] = useState(false);
  const [abilityActive, setAbilityActive] = useState(false);
  const [abilityCD, setAbilityCD] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [enemyHp, setEnemyHp] = useState(100);
  const [shake, setShake] = useState(false);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 3));

  const doFire = () => {
    const dmg = Math.floor(char.stats.атака * 0.3 + Math.random() * 20);
    setEnemyHp(p => Math.max(0, p - dmg));
    addLog(`Выстрел! -${dmg} HP`);
    setShake(true); setTimeout(() => setShake(false), 300);
  };

  const doMelee = () => {
    const dmg = Math.floor(char.stats.атака * 0.5 + Math.random() * 15);
    setEnemyHp(p => Math.max(0, p - dmg));
    addLog(`Удар! -${dmg} HP`);
  };

  const doAbility = () => {
    if (abilityCD > 0 || energy < 30) { addLog(abilityCD > 0 ? `Перезарядка ${abilityCD}с` : "Мало энергии!"); return; }
    setAbilityActive(true);
    setEnergy(p => Math.max(0, p - 30));
    setEnemyHp(p => Math.max(0, p - Math.floor(char.stats.атака * 0.8 + 20)));
    addLog(`[${char.ability}]!`);
    setAbilityCD(5);
    setTimeout(() => setAbilityActive(false), 1200);
    const iv = setInterval(() => setAbilityCD(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }), 1000);
  };

  const doHeal = () => { setHp(p => Math.min(char.hp, p + 20)); addLog("+20 HP аптечка"); };
  const doCrouch = () => { setIsCrouch(p => !p); addLog(isCrouch ? "Встал" : "Присел (-50% урон)"); };
  const doJump = () => {
    if (isJump) return;
    setIsJump(true); addLog("Прыжок!");
    setTimeout(() => setIsJump(false), 600);
  };

  useEffect(() => {
    const iv = setInterval(() => {
      if (enemyHp <= 0) return;
      const dmg = isCrouch ? 2 : Math.floor(5 + Math.random() * 10);
      setHp(p => Math.max(0, p - dmg));
      if (dmg > 0) addLog(`Враг атакует! -${dmg}`);
    }, 2500);
    return () => clearInterval(iv);
  }, [isCrouch, enemyHp]);

  useEffect(() => {
    const iv = setInterval(() => setEnergy(p => Math.min(char.stats.энергия, p + 2)), 800);
    return () => clearInterval(iv);
  }, [char.stats.энергия]);

  const hpPct = (hp / char.hp) * 100;
  const ePct = (energy / char.stats.энергия) * 100;

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: "#050505", fontFamily: "'Oswald', sans-serif", touchAction: "none" }}>
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 hex-shape opacity-10 animate-float" style={{ background: char.accentColor }} />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 diamond-shape opacity-8 animate-float" style={{ background: "#ff4d4d", animationDelay: "2s" }} />
      </div>

      {/* Enemy */}
      <div className={`absolute transition-transform duration-150 ${shake ? "translate-x-2" : ""}`} style={{ top: "20%", right: "15%", textAlign: "center" }}>
        {enemyHp > 0 ? (
          <>
            <div className="w-16 h-16 diamond-shape mx-auto animate-float" style={{ background: "#ff222233", border: "2px solid #ff2222", boxShadow: "0 0 24px #ff222266" }} />
            <div className="mt-2 w-20 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${enemyHp}%` }} />
            </div>
            <p className="text-xs text-red-400 mt-1 tracking-widest">ВРАГ {enemyHp}</p>
          </>
        ) : (
          <p className="text-[#00ff9d] text-sm font-bold tracking-widest animate-pulse-neon">УНИЧТОЖЕН</p>
        )}
      </div>

      {/* Player */}
      <div
        className="absolute transition-all duration-300"
        style={{
          bottom: "27%", left: "15%",
          transform: `translateY(${isJump ? "-60px" : isCrouch ? "12px" : "0px"}) scaleY(${isCrouch ? 0.7 : 1})`,
        }}
      >
        <GeometricShape shape={char.shape} color={char.accentColor} size={isCrouch ? 40 : 56} />
        <p className="text-xs text-center mt-1 tracking-widest" style={{ color: char.accentColor }}>{char.name}</p>
      </div>

      {/* Ability flash */}
      {abilityActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <p className="text-xl font-bold tracking-widest animate-fade-in" style={{ color: char.accentColor, textShadow: `0 0 30px ${char.accentColor}` }}>
            {char.ability.toUpperCase()}
          </p>
          <div className="absolute inset-0 opacity-10" style={{ background: char.accentColor }} />
        </div>
      )}

      {/* TOP HUD */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-start gap-3 z-10" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)" }}>
        <button
          onTouchStart={(e) => { e.preventDefault(); onBack(); }}
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center border border-white/20 rounded shrink-0"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <Icon name="ArrowLeft" size={14} className="text-white/60" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Heart" size={11} className="text-red-400 shrink-0" />
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${hpPct}%`, background: hpPct > 50 ? "#22c55e" : hpPct > 25 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <span className="text-xs text-white/50 shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{hp}/{char.hp}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Zap" size={11} className="text-blue-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${ePct}%`, background: char.accentColor, boxShadow: `0 0 4px ${char.accentColor}` }} />
            </div>
            <span className="text-xs text-white/40 shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{energy}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold" style={{ color: char.accentColor }}>{char.name}</p>
          <p className="text-xs text-white/30">{char.role}</p>
        </div>
      </div>

      {/* LOG */}
      <div className="absolute top-16 left-3 z-10 pointer-events-none">
        {log.map((msg, i) => (
          <p key={i} className="animate-fade-in mb-0.5" style={{
            color: msg.includes("Враг") ? "#ff6666" : msg.includes("!") && i === 0 ? char.accentColor : "rgba(255,255,255,0.45)",
            opacity: 1 - i * 0.3,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
          }}>
            {msg}
          </p>
        ))}
      </div>

      {/* BOTTOM CONTROLS */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-5 pt-3 z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}
      >
        {/* LEFT — Joystick + crouch/jump */}
        <div className="flex flex-col items-center gap-2">
          <Joystick onMove={() => {}} />
          <div className="flex gap-2">
            <ActionBtn label={isCrouch ? "ВСТАТЬ" : "ПРИСЕСТЬ"} color="#a78bff" size={54} onPress={doCrouch} icon="ArrowDown" />
            <ActionBtn label="ПРЫЖОК" color="#00aaff" size={54} onPress={doJump} icon="ArrowUp" />
          </div>
        </div>

        {/* RIGHT — combat buttons */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2 items-center">
            <ActionBtn label="АПТЕЧКА" color="#22c55e" size={52} onPress={doHeal} icon="Heart" />
            <ActionBtn
              label={abilityCD > 0 ? `КД ${abilityCD}с` : "СПОСОБН."}
              color={char.accentColor}
              size={62}
              onPress={doAbility}
              icon="Sparkles"
            />
          </div>
          <div className="flex gap-2 items-center">
            <ActionBtn label="УДАР" color="#f59e0b" size={56} onPress={doMelee} icon="Swords" />
            <ActionBtn label="ОГОНЬ" color="#ff4d4d" size={74} onPress={doFire} icon="Target" />
          </div>
        </div>
      </div>

      {/* DEFEAT */}
      {hp <= 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.9)" }}>
          <div className="text-center animate-fade-in">
            <p className="text-5xl font-bold text-red-500 mb-4 tracking-widest">ПОРАЖЕНИЕ</p>
            <button onClick={onBack} className="geo-clip px-8 py-3 text-lg font-bold tracking-widest text-black" style={{ background: "#ff4d4d" }}>
              В МЕНЮ
            </button>
          </div>
        </div>
      )}

      {/* VICTORY */}
      {enemyHp <= 0 && hp > 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="text-center animate-fade-in">
            <p className="text-5xl font-bold mb-2 tracking-widest" style={{ color: char.accentColor }}>ПОБЕДА!</p>
            <p className="text-white/40 tracking-widest text-sm">Враг уничтожен</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN ═══
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

  if (screen === "game") {
    return <GameScreen char={characters[selectedChar]} onBack={() => setScreen("menu")} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid-bg overflow-x-hidden relative" style={{ fontFamily: "'Oswald', sans-serif" }}>
      <div className="scan-line" />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-8 md:right-32 w-40 md:w-64 h-40 md:h-64 hex-shape opacity-5 animate-float" style={{ background: "#00ff9d" }} />
        <div className="absolute bottom-32 left-4 md:left-16 w-32 md:w-48 h-32 md:h-48 diamond-shape opacity-5 animate-float" style={{ background: "#ff4d4d", animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-4 md:right-16 w-20 md:w-32 h-20 md:h-32 tri-shape opacity-5 animate-float" style={{ background: "#a78bff", animationDelay: "4s" }} />
      </div>

      {/* ═══ MAIN MENU ═══ */}
      {screen === "menu" && (
        <div className="min-h-screen flex flex-col md:flex-row">
          <div className="w-full md:max-w-md flex flex-col justify-between p-6 md:p-12 relative z-10 min-h-screen md:min-h-0">
            <div className="animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 diamond-shape animate-pulse-neon" style={{ background: "#00ff9d" }} />
                <span className="text-xs tracking-[0.5em] text-white/30 font-light" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>VOID // v0.1.0</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tighter neon-text mt-4">VOID</h1>
              <p className="text-xs md:text-sm tracking-[0.3em] text-white/30 mt-2 uppercase">Геометрия войны</p>
            </div>

            <nav className="flex flex-col gap-1 my-8 md:my-0">
              {menuItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => { if (item.id !== "exit") setScreen(item.id as Screen); }}
                  className={`menu-item animate-slide-left flex items-center gap-4 px-4 py-3 text-left transition-all duration-300 group border border-transparent hover:border-white/5 stagger-${i + 1}`}
                  style={{ animationFillMode: "forwards", opacity: 0 }}
                >
                  <Icon name={item.icon} size={16} className="text-white/30 group-hover:text-[#00ff9d] transition-colors shrink-0 relative z-10" fallback="Circle" />
                  <span className="text-xl md:text-2xl font-medium tracking-widest text-white/60 group-hover:text-white transition-colors relative z-10">{item.label}</span>
                  <Icon name="ChevronRight" size={14} className="ml-auto text-transparent group-hover:text-[#00ff9d] transition-all relative z-10" />
                </button>
              ))}
            </nav>

            <div style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }} className="animate-fade-in">
              <div className="h-px bg-white/10 mb-4" />
              <p className="text-xs text-white/20 tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>© 2026 VOID STUDIOS</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center relative">
            <div className="relative">
              <div className="w-80 h-80 hex-shape animate-float opacity-20" style={{ background: "linear-gradient(135deg, #00ff9d33, #00ff9d88)", border: "1px solid #00ff9d" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 diamond-shape animate-float opacity-40" style={{ animationDelay: "1s", background: "linear-gradient(135deg, #00ff9d22, #00ff9d66)" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 tri-shape animate-pulse-neon" style={{ background: "#00ff9d88" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHARACTERS ═══ */}
      {screen === "characters" && (
        <div className="min-h-screen p-4 md:p-10 relative z-10 pb-10">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ПЕРСОНАЖИ</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-5 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>ПЕРСОНАЖИ</h2>

          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {characters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(i)}
                className={`char-card animate-fade-in text-left p-4 md:p-6 border bg-black/40 transition-all shrink-0 w-[280px] md:w-auto snap-center stagger-${i + 2} ${selectedChar === i ? "active" : "border-white/10 hover:border-white/20"}`}
                style={{ animationFillMode: "forwards", opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <GeometricShape shape={c.shape} color={c.accentColor} size={52} />
                  <span className="text-xs tracking-widest px-2 py-1 geo-clip-sm" style={{ background: `${c.accentColor}22`, color: c.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {c.role}
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: selectedChar === i ? c.accentColor : "#fff" }}>{c.name}</h3>
                <p className="text-xs text-white/40 mb-4 italic">{c.desc}</p>
                <div className="border border-white/10 p-3 geo-clip-sm mb-4" style={{ background: `${c.accentColor}0a` }}>
                  <p className="text-xs tracking-widest mb-1" style={{ color: c.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}>{c.ability}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{c.abilityDesc}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(c.stats).map(([k, v]) => <StatBar key={k} label={k} value={v} color={c.accentColor} />)}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center md:justify-end mt-6 animate-fade-in">
            <button
              onClick={() => setScreen("game")}
              className="geo-clip px-8 py-4 text-lg font-bold tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{ background: characters[selectedChar].accentColor, color: "#0a0a0a", boxShadow: `0 0 24px ${characters[selectedChar].accentColor}88` }}
            >
              ИГРАТЬ ЗА {characters[selectedChar].name} →
            </button>
          </div>
        </div>
      )}

      {/* ═══ WEAPONS ═══ */}
      {screen === "weapons" && (
        <div className="min-h-screen p-4 md:p-10 relative z-10">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors"><Icon name="ArrowLeft" size={20} /></button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>АРСЕНАЛ</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-5 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>ОРУЖИЕ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weapons.map((w, i) => (
              <div key={w.name} className={`animate-fade-in p-4 border border-white/10 bg-black/40 geo-clip hover:border-white/30 group cursor-pointer stagger-${i + 2}`} style={{ animationFillMode: "forwards", opacity: 0 }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#00ff9d] tracking-wider">{w.name}</h3>
                    <p className="text-xs text-white/40 tracking-widest">{w.type}</p>
                  </div>
                  <span className="text-xs px-2 py-1 geo-clip-sm" style={{ color: rarityColor[w.rarity], background: `${rarityColor[w.rarity]}22`, fontFamily: "'IBM Plex Mono', monospace" }}>{w.rarity}</span>
                </div>
                <div className="flex gap-6">
                  <div><p className="text-white/30 text-xs mb-1">УРОН</p><p className="text-3xl font-bold neon-text">{w.dmg}</p></div>
                  <div><p className="text-white/30 text-xs mb-1">СКОРОСТРЕЛЬНОСТЬ</p><p className="text-white/70 font-medium tracking-widest mt-1">{w.rate}</p></div>
                </div>
                <div className="mt-3 h-0.5 bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#00ff9d] group-hover:w-full transition-all duration-500" style={{ width: `${w.dmg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ INVENTORY ═══ */}
      {screen === "inventory" && (
        <div className="min-h-screen p-4 md:p-10 relative z-10">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors"><Icon name="ArrowLeft" size={20} /></button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ИНВЕНТАРЬ</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-5 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>ИНВЕНТАРЬ</h2>
          <div className="grid grid-cols-3 gap-3">
            {inventory.map((item, i) => (
              <div key={item.name} className={`animate-fade-in p-3 border border-white/10 bg-black/40 geo-clip hover:border-[#00ff9d]/40 hover:bg-[#00ff9d]/5 group cursor-pointer stagger-${i + 2}`} style={{ animationFillMode: "forwards", opacity: 0 }}>
                <div className="w-8 h-8 border border-white/20 geo-clip-sm flex items-center justify-center mb-2">
                  <Icon name={item.icon} size={16} className="text-white/40 group-hover:text-[#00ff9d]" fallback="Package" />
                </div>
                <p className="text-xs font-medium text-white/70 group-hover:text-white">{item.name}</p>
                <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>× {item.qty}</p>
              </div>
            ))}
            {[...Array(6)].map((_, i) => (
              <div key={`e-${i}`} className="p-3 border border-white/5 bg-black/20 geo-clip flex items-center justify-center">
                <span className="text-white/10 text-xl">+</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SETTINGS ═══ */}
      {screen === "settings" && (
        <div className="min-h-screen p-4 md:p-10 relative z-10">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors"><Icon name="ArrowLeft" size={20} /></button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>НАСТРОЙКИ</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-5 animate-fade-in stagger-1" style={{ animationFillMode: "forwards", opacity: 0 }}>НАСТРОЙКИ</h2>
          {[
            { label: "Графика", value: "УЛЬТРА", icon: "Monitor" },
            { label: "Звук", value: "80%", icon: "Volume2" },
            { label: "Музыка", value: "60%", icon: "Music" },
            { label: "Язык", value: "РУС", icon: "Globe" },
            { label: "Управление", value: "ТАЧСКРИН", icon: "Smartphone" },
          ].map((s, i) => (
            <div key={s.label} className={`animate-fade-in flex items-center justify-between p-4 border-b border-white/10 hover:border-[#00ff9d]/30 group cursor-pointer stagger-${i + 2}`} style={{ animationFillMode: "forwards", opacity: 0 }}>
              <div className="flex items-center gap-4">
                <Icon name={s.icon} size={16} className="text-white/30 group-hover:text-[#00ff9d]" fallback="Settings" />
                <span className="text-lg tracking-widest text-white/70 group-hover:text-white">{s.label}</span>
              </div>
              <span className="text-sm tracking-widest text-[#00ff9d]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ NEW GAME / CONTINUE ═══ */}
      {(screen === "newgame" || screen === "continue") && (
        <div className="min-h-screen flex items-center justify-center relative z-10 p-6">
          <div className="text-center animate-fade-in w-full max-w-sm">
            <div className="w-20 h-20 hex-shape animate-pulse-neon mx-auto mb-6" style={{ background: "#00ff9d33", border: "2px solid #00ff9d" }} />
            <h2 className="text-4xl md:text-5xl font-bold neon-text mb-3">{screen === "newgame" ? "НОВАЯ ИГРА" : "ПРОДОЛЖИТЬ"}</h2>
            <p className="text-white/30 tracking-widest mb-6 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {screen === "newgame" ? "ВЫБЕРИ ПЕРСОНАЖА И НАЧНИ" : "ЗАГРУЗКА СОХРАНЕНИЯ #03..."}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => setScreen("characters")}
                className="geo-clip px-6 py-3 text-base font-bold tracking-widest text-black transition-all hover:scale-105 active:scale-95"
                style={{ background: "#00ff9d", boxShadow: "0 0 20px rgba(0,255,157,0.4)" }}
              >
                ВЫБРАТЬ ПЕРСОНАЖА
              </button>
              <button onClick={() => setScreen("menu")} className="geo-clip px-6 py-3 text-base font-bold tracking-widest text-white/60 border border-white/20">
                НАЗАД
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
