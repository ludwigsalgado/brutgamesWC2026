import { create } from 'zustand';

const useGameStore = create((set) => ({
    view: 'welcome', // 'welcome' | 'playing' | 'result'
    score: 0,
    attempts: 0,
    maxAttempts: 5,

    setView: (newView) => set({ view: newView }),

    startGame: () => set({ view: 'playing', score: 0, attempts: 0 }),

    recordShot: (isGoal) => set((state) => {
        const newScore = isGoal ? state.score + 1 : state.score;
        const newAttempts = state.attempts + 1;

        // If it's the last attempt, change view to result after a short delay
        if (newAttempts >= state.maxAttempts) {
            setTimeout(() => {
                set({ view: 'result' });
            }, 1500); // 1.5s delay to see the final shot outcome
        }

        return { score: newScore, attempts: newAttempts };
    }),

    resetGame: () => set({ view: 'welcome', score: 0, attempts: 0 })
}));

export default useGameStore;
