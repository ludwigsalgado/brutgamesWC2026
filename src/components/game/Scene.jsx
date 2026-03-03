import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Pitch from './Pitch';
import Goal from './Goal';
import Ball from './Ball';
import Keeper from './Keeper';
import Shooter from './Shooter';

export default function Scene({ gameState, setGameState, setScore, setLives }) {
    return (
        <Canvas shadows gl={{ antialias: true, alpha: false }}>
            {/* Camera positioned for a penalty kick perspective */}
            <PerspectiveCamera makeDefault position={[0, 2.5, 8]} fov={45} />

            {/* Realistic Stadium Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight
                position={[-10, 20, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <spotLight position={[15, 25, 15]} angle={0.4} penumbra={0.8} intensity={1.5} castShadow color="#ffffff" shadow-mapSize={[1024, 1024]} />
            <spotLight position={[-15, 25, 15]} angle={0.4} penumbra={0.8} intensity={1.5} castShadow color="#ffffff" shadow-mapSize={[1024, 1024]} />

            {/* Night Sky Environment */}
            <Sky sunPosition={[0, -0.2, -1]} turbidity={0.1} rayleigh={0.5} inclination={0.4} />
            <Environment preset="night" />

            {/* Physics Engine */}
            <Suspense fallback={null}>
                <Physics gravity={[0, -9.81, 0]}>
                    <Pitch />
                    <Goal position={[0, 0, -4]} />

                    {/* AI Keeper */}
                    {gameState === 'playing' && <Keeper />}

                    {/* Shooter / Player Character */}
                    {gameState === 'playing' && <Shooter position={[0, 0, 3.8]} />}

                    {/* Only render ball when actively playing to allow resets */}
                    {gameState === 'playing' && (
                        <Ball
                            position={[0, 0.15, 3]}
                            onGoal={() => {
                                setScore(s => s + 100);
                                setTimeout(() => setGameState('playing_reset'), 1000); // Trigger a re-mount
                            }}
                            onMiss={() => {
                                setLives(l => {
                                    const newLives = l - 1;
                                    if (newLives <= 0) setTimeout(() => setGameState('gameover'), 1000);
                                    else setTimeout(() => setGameState('playing_reset'), 1000);
                                    return newLives;
                                });
                            }}
                        />
                    )}
                    {/* Re-mount mechanic */}
                    {gameState === 'playing_reset' && (
                        (() => {
                            // Hacky but effective way to reset ball component in React: change state immediately
                            setTimeout(() => setGameState('playing'), 50);
                            return null;
                        })()
                    )}
                </Physics>
            </Suspense>
        </Canvas>
    );
}
