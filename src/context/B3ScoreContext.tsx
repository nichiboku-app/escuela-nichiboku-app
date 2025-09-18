import React, { createContext, useContext, useMemo, useState } from "react";

type Section = "roleplay" | "tarjetas" | "contadores";
type ScoreState = { roleplay: number; tarjetas: number; contadores: number };

type Ctx = {
  score: ScoreState;
  total: number;            // suma global (máx. 100)
  addPoints: (section: Section, pts: number) => number; // devuelve lo que realmente sumó
  reset: () => void;
};

const B3ScoreContext = createContext<Ctx | null>(null);

export function B3ScoreProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState<ScoreState>({
    roleplay: 0,
    tarjetas: 0,
    contadores: 0,
  });

  const total = score.roleplay + score.tarjetas + score.contadores;

  const addPoints = (section: Section, pts: number) => {
    const remaining = Math.max(0, 100 - total);
    const delta = Math.min(Math.max(pts, 0), remaining);
    if (delta <= 0) return 0;
    setScore((prev) => ({ ...prev, [section]: prev[section] + delta }));
    return delta;
  };

  const reset = () => setScore({ roleplay: 0, tarjetas: 0, contadores: 0 });

  const value = useMemo(() => ({ score, total, addPoints, reset }), [score, total]);

  return <B3ScoreContext.Provider value={value}>{children}</B3ScoreContext.Provider>;
}

export function useB3Score() {
  const ctx = useContext(B3ScoreContext);
  if (!ctx) throw new Error("useB3Score must be used within B3ScoreProvider");
  return ctx;
}
