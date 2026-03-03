import React from 'react';
import useGameStore from './store/gameStore';

// Screens
import WelcomeScreen from './components/ui/WelcomeScreen';
import Game2D from './components/ui/Game2D';
import ResultScreen from './components/ui/ResultScreen';

function App() {
  const view = useGameStore((state) => state.view);

  return (
    <div className="w-full h-screen bg-[var(--color-dark-bg)] text-white overflow-hidden relative touch-none">
      {view === 'welcome' && <WelcomeScreen />}
      {view === 'playing' && <Game2D />}
      {view === 'result' && <ResultScreen />}
    </div>
  );
}

export default App;

