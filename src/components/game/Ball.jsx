import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export default function Ball({ position, onGoal, onMiss }) {
    const ballRef = useRef();
    const arrowRef = useRef();
    const [isCharging, setIsCharging] = useState(false);
    const [shot, setShot] = useState(false);
    const [processedEvent, setProcessedEvent] = useState(false);

    // Refs for tracking pointer exactly without triggering React re-renders on move
    const pointerPos = useRef({ startX: 0, startY: 0, currX: 0, currY: 0 });

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
            pointerPos.current = { startX: x, startY: y, currX: x, currY: y };
        };

        const handleGlobalPointerMove = (e) => {
            if (!isCharging || shot) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            pointerPos.current.currX = x;
            pointerPos.current.currY = y;
        };

        const handleGlobalPointerUp = (e) => {
            // Need to read fresh state from ref if we bounded them, but isCharging is from useState
            // Since we use the effect dependency, we will have the current isCharging.
            if (!isCharging || shot) return;
            setIsCharging(false);
            setShot(true);

            // Use the last known position from pointerPos just in case touchend doesn't have coordinates
            const deltaX = (pointerPos.current.currX - pointerPos.current.startX) / window.innerWidth;
            const deltaY = (pointerPos.current.startY - pointerPos.current.currY) / window.innerHeight;

            const impulseX = deltaX * 18;
            const impulseY = Math.max(1, deltaY * 25); // Increased lift slightly
            const impulseZ = Math.min(-15, -Math.abs(deltaY * 40));

            if (ballRef.current) {
                ballRef.current.applyImpulse({ x: impulseX, y: impulseY, z: impulseZ }, true);
                ballRef.current.applyTorqueImpulse({ x: -0.3, y: impulseX * 0.5, z: 0 }, true);
            }
        };

        window.addEventListener('pointerdown', handleGlobalPointerDown);
        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        window.addEventListener('touchstart', handleGlobalPointerDown, { passive: false });
        window.addEventListener('touchmove', handleGlobalPointerMove, { passive: false });
        window.addEventListener('touchend', handleGlobalPointerUp);

        return () => {
            window.removeEventListener('pointerdown', handleGlobalPointerDown);
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
            window.removeEventListener('touchstart', handleGlobalPointerDown);
            window.removeEventListener('touchmove', handleGlobalPointerMove);
            window.removeEventListener('touchend', handleGlobalPointerUp);
        };
    }, [isCharging, shot]);

    useFrame(() => {
        // Handle Aiming Arrow
        if (arrowRef.current && isCharging && !shot) {
            const p = pointerPos.current;
            const dx = (p.currX - p.startX) / window.innerWidth;
            const dy = (p.startY - p.currY) / window.innerHeight; // Positive is forward/up

            // Calculate length and angle
            // Forward in 3D is -z, right is +x.
            // Screen drag dx (+) means shot right (+x).
            // Screen drag dy (+) means shot forward (-z).
            const length = Math.sqrt(dx * dx + dy * dy) * 10;
            const angle = Math.atan2(-dy, dx); // Wait, atan2(y, x). 

            arrowRef.current.visible = true;
            // The arrow geometry runs along +y by default, so we rotate it to point along the ground plane (-z)
            // It sits flat on the ground.
            arrowRef.current.scale.set(1, length > 0.1 ? length : 0.1, 1);

            // X and Z plane rotation
            // If dragging straight up (dy > 0, dx = 0), we want the arrow pointing straight back (-z).
            const targetRotation = Math.atan2(dx, dy);
            arrowRef.current.rotation.set(-Math.PI / 2, 0, -targetRotation);
        } else if (arrowRef.current) {
            arrowRef.current.visible = false;
        }

        // Detect Goal/Miss
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
        <group>
            {/* The Aiming Arrow */}
            <mesh ref={arrowRef} position={[position[0], 0.02, position[2]]} visible={false}>
                {/* A simple pointy triangle pointing "up/forward" along its local Y axis */}
                <coneGeometry args={[0.2, 1, 3]} />
                <meshBasicMaterial color="#FFEB3B" transparent opacity={0.6} depthTest={false} />
            </mesh>

            <RigidBody ref={ballRef} colliders="ball" position={position} mass={0.43} restitution={0.7} friction={0.6}>
                <mesh castShadow receiveShadow>
                    {/* Scaled up slightly to 0.15 for better visibility */}
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshStandardMaterial map={ballTexture} metalness={0.1} roughness={0.4} />
                </mesh>
            </RigidBody>

            {/* Simple blob shadow */}
            {!shot && (
                <mesh position={[position[0], 0.015, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.15, 16]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.3} />
                </mesh>
            )}
        </group>
    );
}
