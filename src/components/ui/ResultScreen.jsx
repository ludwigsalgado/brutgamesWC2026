import React from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';

const ResultScreen = () => {
    const { score, maxAttempts, resetGame } = useGameStore();

    const isWinner = score >= 1;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="screen-container flex-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="score-container"
            >
                <h2>RESULTADO FINAL</h2>
                <div className="final-score">
                    <span className="score-number">{score}</span>
                    <span className="score-divider">/</span>
                    <span className="score-max">{maxAttempts}</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`result-card glass-panel ${isWinner ? 'winner' : 'loser'}`}
            >
                {isWinner ? (
                    <>
                        <h3>¡FELICIDADES!</h3>
                        <p>Has anotado <strong>{score}</strong> gol{score > 1 ? 'es' : ''}.</p>
                        <div className="redeem-box">
                            <p>MUESTRA ESTA PANTALLA AL STAFF PARA RECLAMAR TU PREMIO</p>
                        </div>
                    </>
                ) : (
                    <>
                        <h3>¡BUEN INTENTO!</h3>
                        <p>No lograste anotar esta vez.</p>
                        <p className="mt-4">¡Sigue participando en nuestras dinámicas BRUT!</p>
                    </>
                )}
            </motion.div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={resetGame}
                className="button-alt mt-8"
            >
                VOLVER AL INICIO
            </motion.button>
        </motion.div>
    );
};

export default ResultScreen;
