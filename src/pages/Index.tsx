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

// ═══ WEB AUDIO SOUNDS ═══
function createAudioCtx() {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function playShoot(accentColor: string) {
  try {
    const ctx = createAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
    void accentColor;
  } catch (_) { /* silent */ }
}

function playHit() {
  try {
    const ctx = createAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf; src.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    src.start();
  } catch (_) { /* silent */ }
}

function playAbility() {
  try {
    const ctx = createAudioCtx();
    [0, 0.05, 0.1].forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220 + i * 150, ctx.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(880 + i * 200, ctx.currentTime + t + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.25);
    });
  } catch (_) { /* silent */ }
}

function playStep() {
  try {
    const ctx = createAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch (_) { /* silent */ }
}

function playEnemyHit() {
  try {
    const ctx = createAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch (_) { /* silent */ }
}

// ═══ GAME SCREEN ═══
function GameScreen({ char, onBack }: { char: typeof characters[0]; onBack: () => void }) {
  // Player state
  const [playerX, setPlayerX] = useState(120);
  const [playerY, setPlayerY] = useState(300);
  const [velY, setVelY] = useState(0);
  const [isOnGround, setIsOnGround] = useState(true);
  const [isCrouch, setIsCrouch] = useState(false);
  const [facingRight, setFacingRight] = useState(true);

  // Combat state
  const [hp, setHp] = useState(char.hp);
  const [energy, setEnergy] = useState(char.stats.энергия);
  const [abilityCD, setAbilityCD] = useState(0);
  const [abilityActive, setAbilityActive] = useState(false);
  const [isShooting, setIsShooting] = useState(false);

  // Enemies: {id, x, y, hp, maxHp, alive, hit}
  const [enemies, setEnemies] = useState([
    { id: 1, x: 520, y: 290, hp: 60, maxHp: 60, alive: true, hit: false },
    { id: 2, x: 720, y: 290, hp: 80, maxHp: 80, alive: true, hit: false },
    { id: 3, x: 620, y: 180, hp: 50, maxHp: 50, alive: true, hit: false },
  ]);

  // Bullets
  const [bullets, setBullets] = useState<{ id: number; x: number; y: number; vx: number }[]>([]);
  const bulletId = useRef(0);

  // Log
  const [log, setLog] = useState<string[]>(["WASD / стрелки — движение", "Пробел — прыжок", "C — присесть | F — огонь"]);

  // Keyboard state
  const keys = useRef<Record<string, boolean>>({});

  // Canvas/scene size
  const SCENE_W = 900;
  const SCENE_H = 420;
  const FLOOR_Y = 320;
  const GRAVITY = 0.6;
  const JUMP_V = -13;
  const SPEED = 3.5;

  // Walls/platforms
  const walls = [
    { x: 0, y: FLOOR_Y, w: SCENE_W, h: 100, label: "" },        // floor
    { x: 300, y: 240, w: 120, h: 14, label: "ПЛАТФОРМА" },       // platform 1
    { x: 550, y: 200, w: 100, h: 14, label: "ПЛАТФОРМА" },       // platform 2
    { x: 750, y: 260, w: 80, h: 14, label: "" },                 // platform 3
    { x: 0, y: 0, w: 14, h: SCENE_H, label: "" },                // left wall
    { x: SCENE_W - 14, y: 0, w: 14, h: SCENE_H, label: "" },    // right wall
  ];

  const addLog = useCallback((msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 4));
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
      if (e.code === "KeyC") setIsCrouch(p => !p);
      if (e.code === "KeyF" || e.code === "Enter") doFireRef.current();
      if (e.code === "KeyE") doAbilityRef.current();
      if (e.code === "KeyH") doHealRef.current();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Joystick direction ref
  const joystickDir = useRef({ x: 0, y: 0 });

  // Action refs (stable)
  const doFireRef = useRef(() => {});
  const doAbilityRef = useRef(() => {});
  const doHealRef = useRef(() => {});

  // AABB collision helper
  const isColliding = (px: number, py: number, pw: number, ph: number, wx: number, wy: number, ww: number, wh: number) =>
    px < wx + ww && px + pw > wx && py < wy + wh && py + ph > wy;

  // Game loop
  useEffect(() => {
    let frame: number;
    let stepTimer = 0;

    const tick = () => {
      const PW = 32; const PH = isCrouch ? 28 : 48;

      setPlayerX(px => {
        setPlayerY(py => {
          setVelY(vy => {
            setIsOnGround(onGround => {
              // Horizontal input
              let dx = 0;
              if (keys.current["ArrowLeft"] || keys.current["KeyA"]) dx -= SPEED;
              if (keys.current["ArrowRight"] || keys.current["KeyD"]) dx += SPEED;
              dx += joystickDir.current.x * SPEED;

              if (dx > 0) setFacingRight(true);
              if (dx < 0) setFacingRight(false);

              // Jump
              let newVy = vy + GRAVITY;
              if ((keys.current["Space"] || keys.current["ArrowUp"] || keys.current["KeyW"]) && onGround) {
                newVy = JUMP_V;
              }

              let newPx = Math.max(16, Math.min(SCENE_W - PW - 16, px + dx));
              let newPy = py + newVy;
              let landed = false;

              // Collision with walls/platforms
              for (const w of walls) {
                if (isColliding(newPx, newPy, PW, PH, w.x, w.y, w.w, w.h)) {
                  // coming from above → land on top
                  if (newVy > 0 && py + PH <= w.y + 4) {
                    newPy = w.y - PH;
                    newVy = 0;
                    landed = true;
                  } else if (newVy < 0 && py >= w.y + w.h - 4) {
                    newPy = w.y + w.h;
                    newVy = 1;
                  } else {
                    newPx = px;
                  }
                }
              }

              // Step sound
              if (dx !== 0 && landed) {
                stepTimer++;
                if (stepTimer % 18 === 0) playStep();
              }

              setVelY(newVy);
              setIsOnGround(landed);
              setPlayerY(newPy);
              return landed;
            });
            return vy;
          });
          return py;
        });
        return px;
      });

      // Move bullets
      setBullets(bs => {
        const next = bs.map(b => ({ ...b, x: b.x + b.vx })).filter(b => b.x > 0 && b.x < SCENE_W);
        // Check bullet-enemy collision
        const hitIds: number[] = [];
        next.forEach(b => {
          setEnemies(es => es.map(e => {
            if (!e.alive || hitIds.includes(e.id)) return e;
            if (b.x > e.x && b.x < e.x + 40 && b.y > e.y && b.y < e.y + 50) {
              hitIds.push(e.id);
              const dmg = Math.floor(char.stats.атака * 0.4 + Math.random() * 15);
              const newHp = Math.max(0, e.hp - dmg);
              addLog(`Попадание! -${dmg}`);
              playEnemyHit();
              return { ...e, hp: newHp, alive: newHp > 0, hit: true };
            }
            return e;
          }));
        });
        return next.filter(b => !hitIds.some(() => true) || true);
      });

      // Clear hit flash
      setEnemies(es => es.map(e => ({ ...e, hit: false })));

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isCrouch, char.stats.атака, addLog]);

  // Enemy AI — walk toward player and attack
  useEffect(() => {
    const iv = setInterval(() => {
      setEnemies(es => es.map(e => {
        if (!e.alive) return e;
        setPlayerX(px => {
          const dx = px - e.x;
          const newX = e.x + Math.sign(dx) * 1.2;
          setPlayerY(py => {
            // If close enough — attack player
            if (Math.abs(dx) < 60 && Math.abs(py - e.y) < 80) {
              const dmg = isCrouch ? 3 : Math.floor(6 + Math.random() * 10);
              setHp(h => Math.max(0, h - dmg));
              addLog(`Враг ${e.id} бьёт! -${dmg}`);
              playHit();
            }
            return py;
          });
          return px;
        });
        return { ...e, x: newX };
      }));
    }, 600);
    return () => clearInterval(iv);
  }, [isCrouch, addLog]);

  // Energy regen
  useEffect(() => {
    const iv = setInterval(() => setEnergy(p => Math.min(char.stats.энергия, p + 2)), 900);
    return () => clearInterval(iv);
  }, [char.stats.энергия]);

  // Ability CD
  useEffect(() => {
    if (abilityCD <= 0) return;
    const iv = setInterval(() => setAbilityCD(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, [abilityCD]);

  // Define actions
  const doFire = useCallback(() => {
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 150);
    playShoot(char.accentColor);
    setPlayerX(px => {
      setPlayerY(py => {
        bulletId.current++;
        setBullets(bs => [...bs, { id: bulletId.current, x: px + (facingRight ? 36 : -4), y: py + 20, vx: facingRight ? 9 : -9 }]);
        return py;
      });
      return px;
    });
    addLog("Выстрел!");
  }, [char.accentColor, facingRight, addLog]);

  const doAbility = useCallback(() => {
    if (abilityCD > 0 || energy < 30) { addLog(abilityCD > 0 ? `КД: ${abilityCD}с` : "Мало энергии!"); return; }
    setEnergy(p => Math.max(0, p - 30));
    setAbilityCD(6);
    setAbilityActive(true);
    playAbility();
    addLog(`[${char.ability}]!`);
    // Damage all nearby enemies
    setPlayerX(px => {
      setEnemies(es => es.map(e => {
        if (!e.alive) return e;
        const dist = Math.abs(e.x - px);
        if (dist < 200) {
          const dmg = Math.floor(char.stats.атака * 0.9 + 25);
          return { ...e, hp: Math.max(0, e.hp - dmg), alive: e.hp - dmg > 0 };
        }
        return e;
      }));
      return px;
    });
    setTimeout(() => setAbilityActive(false), 800);
  }, [abilityCD, energy, char.ability, char.stats.атака, addLog]);

  const doHeal = useCallback(() => {
    setHp(p => Math.min(char.hp, p + 20));
    addLog("+20 HP");
  }, [char.hp, addLog]);

  const doCrouch = useCallback(() => setIsCrouch(p => !p), []);

  const doJump = useCallback(() => {
    setIsOnGround(on => {
      if (on) setVelY(JUMP_V);
      return on;
    });
  }, []);

  // Keep action refs fresh
  useEffect(() => { doFireRef.current = doFire; }, [doFire]);
  useEffect(() => { doAbilityRef.current = doAbility; }, [doAbility]);
  useEffect(() => { doHealRef.current = doHeal; }, [doHeal]);

  const hpPct = (hp / char.hp) * 100;
  const ePct = (energy / char.stats.энергия) * 100;
  const allDead = enemies.every(e => !e.alive);

  const PW = 32; const PH = isCrouch ? 28 : 48;

  // Scale scene to fit viewport
  const sceneRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none flex flex-col"
      style={{ background: "#080a0c", fontFamily: "'Oswald', sans-serif", touchAction: "none" }}
    >
      {/* ── TOP HUD ── */}
      <div className="flex items-center gap-3 px-3 py-2 shrink-0 z-10" style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onTouchStart={(e) => { e.preventDefault(); onBack(); }} onClick={onBack}
          className="w-8 h-8 flex items-center justify-center border border-white/20 rounded shrink-0"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <Icon name="ArrowLeft" size={14} className="text-white/60" />
        </button>

        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon name="Heart" size={10} className="text-red-400 shrink-0" />
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${hpPct}%`, background: hpPct > 50 ? "#22c55e" : hpPct > 25 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <span className="text-xs text-white/50 w-14 text-right shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9 }}>{hp}/{char.hp} HP</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Zap" size={10} className="text-blue-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${ePct}%`, background: char.accentColor }} />
            </div>
            <span className="text-xs text-white/40 w-14 text-right shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9 }}>{energy} ЭН</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs font-bold" style={{ color: char.accentColor }}>{char.name}</p>
          <p className="text-xs text-white/30 tracking-wider">{enemies.filter(e => e.alive).length} врагов</p>
        </div>
      </div>

      {/* ── GAME SCENE ── */}
      <div className="flex-1 relative overflow-hidden" ref={sceneRef}>
        {/* Scene container — scrollable if needed */}
        <div className="absolute inset-0 flex items-end justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0d1117 0%, #111820 50%, #0a0f14 100%)" }}>

          {/* Stars bg */}
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
              left: `${(i * 37 + 13) % 100}%`, top: `${(i * 23 + 7) % 60}%`,
              background: "white", opacity: 0.2 + (i % 5) * 0.1,
            }} />
          ))}

          {/* Scene SVG */}
          <svg
            viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
            className="w-full h-full"
            style={{ maxHeight: "100%", overflow: "visible" }}
          >
            {/* Background details */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={SCENE_W} height={SCENE_H} fill="url(#grid)" />

            {/* Background wall decorations */}
            {[80, 200, 400, 600, 800].map(x => (
              <rect key={x} x={x} y={60} width={3} height={FLOOR_Y - 60}
                fill="rgba(255,255,255,0.05)" />
            ))}
            {[100, 220, 350, 500, 680, 820].map((x, i) => (
              <rect key={x} x={x} y={80 + i * 20} width={30} height={4}
                fill="rgba(255,255,255,0.06)" />
            ))}

            {/* Platforms */}
            {walls.slice(1, 4).map((w, i) => (
              <g key={i}>
                <rect x={w.x} y={w.y} width={w.w} height={w.h}
                  fill="#1a2535" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <rect x={w.x + 2} y={w.y + 2} width={w.w - 4} height={3}
                  fill="rgba(255,255,255,0.15)" />
                {w.label && (
                  <text x={w.x + w.w / 2} y={w.y - 4} textAnchor="middle"
                    fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="IBM Plex Mono">
                    {w.label}
                  </text>
                )}
              </g>
            ))}

            {/* Floor */}
            <rect x={0} y={FLOOR_Y} width={SCENE_W} height={100} fill="#0f1923" />
            <rect x={0} y={FLOOR_Y} width={SCENE_W} height={3} fill={char.accentColor} opacity="0.5" />
            {[...Array(23)].map((_, i) => (
              <rect key={i} x={i * 40} y={FLOOR_Y + 3} width={38} height={10}
                fill={i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent"} />
            ))}

            {/* Left / Right walls */}
            <rect x={0} y={0} width={14} height={SCENE_H} fill="#0d1520"
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <rect x={SCENE_W - 14} y={0} width={14} height={SCENE_H} fill="#0d1520"
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            {/* Wall rivets */}
            {[80, 160, 240].map(y => (
              <g key={y}>
                <circle cx={7} cy={y} r={3} fill="rgba(255,255,255,0.15)" />
                <circle cx={SCENE_W - 7} cy={y} r={3} fill="rgba(255,255,255,0.15)" />
              </g>
            ))}

            {/* Bullets */}
            {bullets.map(b => (
              <g key={b.id}>
                <ellipse cx={b.x} cy={b.y} rx={8} ry={3} fill={char.accentColor} opacity="0.9" />
                <ellipse cx={b.x - (b.vx > 0 ? 8 : -8)} cy={b.y} rx={14} ry={2}
                  fill={char.accentColor} opacity="0.3" />
              </g>
            ))}

            {/* Enemies */}
            {enemies.map(e => e.alive && (
              <g key={e.id} transform={`translate(${e.x}, ${e.y})`}>
                {/* Enemy body — red diamond */}
                <polygon
                  points="20,0 40,25 20,50 0,25"
                  fill={e.hit ? "#ffffff" : "#ff2222"}
                  stroke="#ff4444"
                  strokeWidth="2"
                  opacity={e.hit ? 1 : 0.9}
                  style={{ filter: `drop-shadow(0 0 ${e.hit ? 12 : 6}px #ff2222)` }}
                />
                {/* Enemy eye */}
                <circle cx="20" cy="22" r="5" fill="#000" />
                <circle cx="20" cy="22" r="2" fill="#ff8888" />
                {/* HP bar above enemy */}
                <rect x="0" y="-10" width="40" height="4" fill="rgba(0,0,0,0.6)" rx="2" />
                <rect x="0" y="-10" width={40 * (e.hp / e.maxHp)} height="4" fill="#ff4444" rx="2" />
              </g>
            ))}

            {/* Player */}
            <g transform={`translate(${playerX}, ${playerY}) scale(${facingRight ? 1 : -1}, 1) translate(${facingRight ? 0 : -PW}, 0)`}>
              {/* Shadow */}
              <ellipse cx={PW / 2} cy={PH + 3} rx={PW / 2 - 2} ry={4}
                fill="rgba(0,0,0,0.4)" />
              {/* Body */}
              {char.shape === "hex" ? (
                <polygon
                  points={`${PW/2},0 ${PW},${PH*0.3} ${PW},${PH*0.7} ${PW/2},${PH} 0,${PH*0.7} 0,${PH*0.3}`}
                  fill={char.accentColor + "cc"}
                  stroke={char.accentColor}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 8px ${char.accentColor})` }}
                />
              ) : char.shape === "diamond" ? (
                <polygon
                  points={`${PW/2},0 ${PW},${PH/2} ${PW/2},${PH} 0,${PH/2}`}
                  fill={char.accentColor + "cc"}
                  stroke={char.accentColor}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 8px ${char.accentColor})` }}
                />
              ) : (
                <polygon
                  points={`${PW/2},0 ${PW},${PH} 0,${PH}`}
                  fill={char.accentColor + "cc"}
                  stroke={char.accentColor}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 8px ${char.accentColor})` }}
                />
              )}
              {/* Gun flash when shooting */}
              {isShooting && (
                <ellipse cx={PW + 8} cy={PH / 2} rx={12} ry={6}
                  fill={char.accentColor} opacity="0.8" />
              )}
            </g>

            {/* Ability flash overlay */}
            {abilityActive && (
              <rect x={0} y={0} width={SCENE_W} height={SCENE_H}
                fill={char.accentColor} opacity="0.12" />
            )}
          </svg>
        </div>

        {/* Log overlay */}
        <div className="absolute top-2 left-3 pointer-events-none z-10">
          {log.map((msg, i) => (
            <p key={i} style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: msg.includes("Враг") ? "#ff6666" : msg.includes("!") && i === 0 ? char.accentColor : "rgba(255,255,255,0.5)",
              opacity: 1 - i * 0.25,
            }}>{msg}</p>
          ))}
        </div>

        {/* PC controls hint */}
        <div className="absolute bottom-2 right-3 pointer-events-none z-10 hidden md:block">
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
            WASD/←→ — движение · Пробел — прыжок · C — присесть · F — огонь · E — способность · H — аптечка
          </p>
        </div>
      </div>

      {/* ── MOBILE CONTROLS (скрыты на ПК) ── */}
      <div
        className="shrink-0 flex items-end justify-between px-3 pb-4 pt-2 md:hidden"
        style={{ background: "rgba(0,0,0,0.85)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* LEFT: joystick + jump/crouch */}
        <div className="flex flex-col items-center gap-2">
          <Joystick onMove={(x, y) => { joystickDir.current = { x, y }; }} />
          <div className="flex gap-2">
            <ActionBtn label={isCrouch ? "ВСТАТЬ" : "ПРИСЕСТЬ"} color="#a78bff" size={52} onPress={doCrouch} icon="ArrowDown" />
            <ActionBtn label="ПРЫЖОК" color="#00aaff" size={52} onPress={doJump} icon="ArrowUp" />
          </div>
        </div>

        {/* RIGHT: combat */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2 items-center">
            <ActionBtn label="АПТЕЧКА" color="#22c55e" size={50} onPress={doHeal} icon="Heart" />
            <ActionBtn
              label={abilityCD > 0 ? `КД ${abilityCD}` : "СПОСОБН."}
              color={char.accentColor} size={60}
              onPress={doAbility} icon="Sparkles"
            />
          </div>
          <div className="flex gap-2 items-center">
            <ActionBtn label="УДАР" color="#f59e0b" size={54} onPress={() => { playHit(); addLog("Удар!"); }} icon="Swords" />
            <ActionBtn label="ОГОНЬ" color="#ff4d4d" size={72} onPress={doFire} icon="Target" />
          </div>
        </div>
      </div>

      {/* ── PC CONTROLS (скрыты на мобиле) ── */}
      <div
        className="shrink-0 hidden md:flex items-center justify-center gap-4 px-6 py-3"
        style={{ background: "rgba(0,0,0,0.85)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {[
          { key: "A/D", label: "Движение" },
          { key: "Пробел", label: "Прыжок" },
          { key: "C", label: "Присесть" },
          { key: "F", label: "Огонь" },
          { key: "E", label: char.ability },
          { key: "H", label: "Аптечка" },
        ].map(k => (
          <div key={k.key} className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.1)", color: char.accentColor, fontFamily: "'IBM Plex Mono', monospace", border: `1px solid ${char.accentColor}44` }}>
              {k.key}
            </span>
            <span className="text-xs text-white/40">{k.label}</span>
          </div>
        ))}
      </div>

      {/* ── DEFEAT ── */}
      {hp <= 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.92)" }}>
          <div className="text-center animate-fade-in">
            <p className="text-6xl font-bold text-red-500 mb-2 tracking-widest">ПОРАЖЕНИЕ</p>
            <p className="text-white/30 mb-6 tracking-widest text-sm">Ты пал в бою</p>
            <button onClick={onBack} className="geo-clip px-10 py-4 text-xl font-bold tracking-widest text-black"
              style={{ background: "#ff4d4d", boxShadow: "0 0 24px #ff4d4d88" }}>
              В МЕНЮ
            </button>
          </div>
        </div>
      )}

      {/* ── VICTORY ── */}
      {allDead && hp > 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="text-center animate-fade-in">
            <p className="text-6xl font-bold mb-2 tracking-widest" style={{ color: char.accentColor }}>ПОБЕДА!</p>
            <p className="text-white/30 mb-6 tracking-widest text-sm">Все враги уничтожены</p>
            <button onClick={onBack} className="geo-clip px-10 py-4 text-xl font-bold tracking-widest text-black"
              style={{ background: char.accentColor, boxShadow: `0 0 24px ${char.accentColor}88` }}>
              В МЕНЮ
            </button>
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
        <div className="min-h-screen flex flex-col p-4 md:p-10 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4 shrink-0">
            <button onClick={() => setScreen("menu")} className="text-white/30 hover:text-[#00ff9d] transition-colors p-2">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs tracking-[0.5em] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ПЕРСОНАЖИ</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 shrink-0">ПЕРСОНАЖИ</h2>

          {/* Cards — горизонтальный скролл на мобиле, сетка на desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 shrink-0" style={{ scrollSnapType: "x mandatory" }}>
            {characters.map((c, i) => (
              <div
                key={c.id}
                onTouchEnd={() => setSelectedChar(i)}
                onClick={() => setSelectedChar(i)}
                className={`text-left p-4 border bg-black/40 transition-all cursor-pointer shrink-0 w-[270px] md:w-auto ${selectedChar === i ? "active" : "border-white/10"}`}
                style={{ scrollSnapAlign: "start", borderColor: selectedChar === i ? c.accentColor : undefined, boxShadow: selectedChar === i ? `0 0 16px ${c.accentColor}44` : undefined }}
              >
                <div className="flex items-start justify-between mb-3">
                  <GeometricShape shape={c.shape} color={c.accentColor} size={48} />
                  <span className="text-xs tracking-widest px-2 py-1 geo-clip-sm" style={{ background: `${c.accentColor}22`, color: c.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {c.role}
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: selectedChar === i ? c.accentColor : "#fff" }}>{c.name}</h3>
                <p className="text-xs text-white/40 mb-3 italic">{c.desc}</p>
                <div className="border border-white/10 p-2 geo-clip-sm mb-3" style={{ background: `${c.accentColor}0a` }}>
                  <p className="text-xs mb-1" style={{ color: c.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}>{c.ability}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{c.abilityDesc}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(c.stats).map(([k, v]) => <StatBar key={k} label={k} value={v} color={c.accentColor} />)}
                </div>
              </div>
            ))}
          </div>

          {/* CTA кнопка — всегда видна, не перекрывается */}
          <div className="mt-6 shrink-0">
            <div
              onTouchEnd={() => setScreen("game")}
              onClick={() => setScreen("game")}
              className="geo-clip w-full flex items-center justify-center py-5 text-xl font-bold tracking-widest cursor-pointer active:opacity-80 transition-opacity"
              style={{
                background: characters[selectedChar].accentColor,
                color: "#0a0a0a",
                boxShadow: `0 0 30px ${characters[selectedChar].accentColor}66`,
              }}
            >
              ИГРАТЬ ЗА {characters[selectedChar].name} →
            </div>
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