import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export default function Ball({ position, onGoal, onMiss }) {
    const ballRef = useRef();
    const [isCharging, setIsCharging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [shot, setShot] = useState(false);
    const [processedEvent, setProcessedEvent] = useState(false);

    // Procedurally generated classic soccer ball texture
    const ballTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);

        // Draw pentagons/hexagons pattern approximation using dots
        ctx.fillStyle = '#111111';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 !== 0) {
                    ctx.beginPath();
                    ctx.arc(i * 64 + 32, j * 64 + 32, 24, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }, []);

    // Cross-browser Pointer Events handling
    useEffect(() => {
        const handleGlobalPointerDown = (e) => {
            if (shot) return;
            setIsCharging(true);
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            setStartPos({ x, y });
        };

        const handleGlobalPointerUp = (e) => {
            if (!isCharging || shot) return;
            setIsCharging(false);
            setShot(true);

            const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

            const deltaX = (x - startPos.x) / window.innerWidth;
            const deltaY = (startPos.y - y) / window.innerHeight;

            const impulseX = deltaX * 18;
            const impulseY = Math.max(1, deltaY * 25); // Increased lift slightly
            const impulseZ = Math.min(-15, -Math.abs(deltaY * 40));

            if (ballRef.current) {
                ballRef.current.applyImpulse({ x: impulseX, y: impulseY, z: impulseZ }, true);
                ballRef.current.applyTorqueImpulse({ x: -0.3, y: impulseX * 0.5, z: 0 }, true);
            }
        };

        window.addEventListener('pointerdown', handleGlobalPointerDown);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        window.addEventListener('touchstart', handleGlobalPointerDown, { passive: false });
        window.addEventListener('touchend', handleGlobalPointerUp);

        return () => {
            window.removeEventListener('pointerdown', handleGlobalPointerDown);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
            window.removeEventListener('touchstart', handleGlobalPointerDown);
            window.removeEventListener('touchend', handleGlobalPointerUp);
        };
    }, [isCharging, shot, startPos]);

    useFrame(() => {
        if (!ballRef.current || !shot || processedEvent) return;
        const pos = ballRef.current.translation();

        const goalLineZ = -4.0;
        const goalBackZ = -6.0;
        const crossbarY = 2.44;
        const postX = 7.32 / 2;

        if (pos.z < goalLineZ && pos.z > goalBackZ && pos.y < crossbarY && Math.abs(pos.x) < postX) {
            setProcessedEvent(true);
            onGoal();
        } else if (pos.z < goalBackZ || (pos.z < goalLineZ && (Math.abs(pos.x) > postX || pos.y > crossbarY))) {
            setProcessedEvent(true);
            onMiss();
        }
    });

    return (
        <RigidBody ref={ballRef} colliders="ball" position={position} mass={0.43} restitution={0.7} friction={0.6}>
            <mesh castShadow receiveShadow>
                {/* Scaled up slightly to 0.15 for better visibility */}
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshStandardMaterial map={ballTexture} metalness={0.1} roughness={0.4} />
            </mesh>
        </RigidBody>
    );
}
