// src/config/client.config.ts
// Central configuration file for the white-label penalty game product.
// Each client gets their own config instance. Brut is the first client.

export interface ClientConfig {
  // Identidad
  brand: {
    name: string;              // "BRUT"
    productLabel: string;      // "MUNDIAL EXPERIENCE"
    htmlTitle: string;         // "Brut Mundial Experience — Tira tu Penal"
    htmlDescription: string;   // meta description / OG description
    faviconPath: string;       // "/favicon.png"
    ogImagePath: string;       // "/og-image.jpg" (1200x630)
  };

  // Paleta
  colors: {
    primary: string;     // #E31837 (Brut Red) — gol, CTA principal
    secondary: string;   // #0033A0 (Brut Blue) — atajada, acentos
    background: string;  // #001D4A — fondo de página
    accentGold: string;  // #FFD700 — trofeo
  };

  // Reglas del juego
  game: {
    totalShots: number;       // 5
    goalsToWinPrize: number;  // 1 (cualquier gol = premio). Brut pidió simple
    keeperDifficulty: number; // 0..1, default 0.8
  };

  // Assets
  assets: {
    sponsorBannerPath: string;   // "/sprites/banner_final.jpg"
    stadiumBgPath: string;       // "/sprites/stadium_bg.png"
    sprites: {
      keeperIdle: string;
      keeperDiveLeft: string;
      keeperDiveRight: string;
      shooter: string;
      defender: string;
    };
  };

  // Copy (idioma del cliente — por ahora español, pero soporta cambio)
  copy: {
    startButton: string;          // "Apunta y patea"
    scoreLabel: string;           // "Goles"
    attemptsLabel: string;        // "Intentos"
    nextButton: string;           // "Siguiente"
    playAgainButton: string;      // "Jugar de nuevo"
    finishedLabel: string;        // "Finalizado"
    totalGoalsLabel: string;      // "Total Goles"
    result: {
      goal: string;               // "¡GOL!"
      save: string;               // "¡ATAJADA!"
      miss: string;               // "¡FUERA!"
    };
    prize: {
      win: string;                // "¡Felicidades! Presenta esta pantalla para reclamar tu premio."
      loss: string;               // "Sigue intentando para ganar premios Brut."
    };
    footer: string;               // "Brut Mundial 2026 • Marketing Experience"
  };

  // Feature flags (Fase 3 — TODOS en false para Brut)
  features: {
    captureEmail: boolean;
    leaderboard: boolean;
    analytics: boolean;
    shareScore: boolean;
    customPrizeCode: boolean;
  };
}

export const brutConfig: ClientConfig = {
  brand: {
    name: "BRUT",
    productLabel: "MUNDIAL EXPERIENCE",
    htmlTitle: "Brut Mundial Experience — Tira tu Penal",
    htmlDescription: "Anota tu penal y gana premios Brut en el Mundial 2026.",
    faviconPath: "/favicon.png",
    ogImagePath: "/og-image.jpg",
  },
  colors: {
    primary: "#E31837",
    secondary: "#0033A0",
    background: "#001D4A",
    accentGold: "#FFD700",
  },
  game: {
    totalShots: 5,
    goalsToWinPrize: 1,
    keeperDifficulty: 0.8,
  },
  assets: {
    sponsorBannerPath: "/sprites/banner_final.jpg",
    stadiumBgPath: "/sprites/stadium_bg.png",
    sprites: {
      keeperIdle: "/sprites/keeper_idle_clean.png",
      keeperDiveLeft: "/sprites/keeper_dive_left_clean.png",
      keeperDiveRight: "/sprites/keeper_dive_right_clean.png",
      shooter: "/sprites/shooter_clean.png",
      defender: "/sprites/defender_clean.png",
    },
  },
  copy: {
    startButton: "Apunta y patea",
    scoreLabel: "Goles",
    attemptsLabel: "Intentos",
    nextButton: "Siguiente",
    playAgainButton: "Jugar de nuevo",
    finishedLabel: "Finalizado",
    totalGoalsLabel: "Total Goles",
    result: { goal: "¡GOL!", save: "¡ATAJADA!", miss: "¡FUERA!" },
    prize: {
      win: "¡Felicidades! Presenta esta pantalla para reclamar tu premio.",
      loss: "Sigue intentando para ganar premios Brut.",
    },
    footer: "Brut Mundial 2026 • Marketing Experience",
  },
  features: {
    captureEmail: false,
    leaderboard: false,
    analytics: false,
    shareScore: false,
    customPrizeCode: false,
  },
};

// Por ahora, el cliente activo se define aquí. En Fase 2 pasará a ser una env var.
export const activeConfig: ClientConfig = brutConfig;
