import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

export default function Ball({ position, onGoal, onMiss }) {
    const ballRef = useRef();
    const [isCharging, setIsCharging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [shot, setShot] = useState(false);
    const [processedEvent, setProcessedEvent] = useState(false);

    // Cross-browser Pointer Events handling
    useEffect(() => {
        const handleGlobalPointerDown = (e) => {
            if (shot) return;
            setIsCharging(true);
            // Use touches if available otherwise client properties
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

            // Calculate physics impulse based on pixel drag distance
            // Normalize against screen height for consistency across devices
            const deltaX = (x - startPos.x) / window.innerWidth;
            const deltaY = (startPos.y - y) / window.innerHeight; // Dragging up = positive Y impulse

            const impulseX = deltaX * 18;
            const impulseY = Math.max(0.5, deltaY * 20); // Always give slight lift
            const impulseZ = Math.min(-15, -Math.abs(deltaY * 35)); // Shoot forward

            if (ballRef.current) {
                // Wake up rigid body and strike
                ballRef.current.applyImpulse({ x: impulseX, y: impulseY, z: impulseZ }, true);
                // Add top spin / side spin for realism
                ballRef.current.applyTorqueImpulse({ x: -0.2, y: impulseX * 0.5, z: 0 }, true);
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

    // Game Logic Loop (Checking positions every frame)
    useFrame(() => {
        if (!ballRef.current || !shot || processedEvent) return;
        const pos = ballRef.current.translation();

        // Evaluate conditions
        const goalLineZ = -4.0;
        const goalBackZ = -6.0;
        const crossbarY = 2.44;
        const postX = 7.32 / 2;

        // Check Goal
        if (pos.z < goalLineZ && pos.z > goalBackZ && pos.y < crossbarY && Math.abs(pos.x) < postX) {
            setProcessedEvent(true);
            onGoal();
        }
        // Check Miss (Ball goes out of bounds generally behind the goal line but wide, or stops)
        else if (pos.z < goalBackZ || (pos.z < goalLineZ && (Math.abs(pos.x) > postX || pos.y > crossbarY))) {
            setProcessedEvent(true);
            onMiss();
        }
    });

    return (
        <RigidBody ref={ballRef} colliders="ball" position={position} mass={0.43} restitution={0.7} friction={0.6}>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.11, 32, 32]} />
                <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.4} />
            </mesh>
        </RigidBody>
    );
}
