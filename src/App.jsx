import React, { useState } from 'react';
import Scene from './components/game/Scene';
import GameUI from './components/ui/GameUI';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover', 'auth', 'admin'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);

  const resetGame = () => {
    setScore(0);
    setLives(5);
    setGameState('playing');
  };

  return (
    <div className="w-full h-screen relative bg-[var(--color-dark-bg)] overflow-hidden flex flex-col select-none touch-none">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene
          gameState={gameState}
          setGameState={setGameState}
          setScore={setScore}
          setLives={setLives}
          score={score}
          lives={lives}
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        <GameUI
          gameState={gameState}
          setGameState={setGameState}
          score={score}
          lives={lives}
          resetGame={resetGame}
        />
      </div>
    </div>
  );
}

export default App;
