import React from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';

const WelcomeScreen = () => {
    const startGame = useGameStore((state) => state.startGame);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="screen-container flex-center"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="logo-container"
            >
                {/* Placeholder logo if BRUT logo isn't available */}
                <h1 className="brut-logo">BRUT</h1>
                <h2 className="brut-subtitle">JUEGA Y GANA</h2>
            </motion.div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="instructions-card glass-panel"
            >
                <h3>REGLAS DEL JUEGO</h3>
                <ul>
                    <li>Tienes <strong>5 Tiros</strong>.</li>
                    <li>¡Anota para ganar premios!</li>
                    <li>Muestra tu pantalla final al staff.</li>
                </ul>
            </motion.div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                onClick={startGame}
                className="button-brut mt-8"
            >
                JUGAR AHORA
            </motion.button>
        </motion.div>
    );
};

export default WelcomeScreen;
