import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export default function Keeper({ position }) {
    const keeperRef = useRef();

    useFrame((state) => {
        if (keeperRef.current) {
            const time = state.clock.getElapsedTime();
            // Increase speed over time slightly or keep it constant.
            // Ping pong motion between the goal posts (approx -2.5 to 2.5)
            const x = Math.sin(time * 2.5) * 2.8;

            // Update kinematic position instantly
            keeperRef.current.setNextKinematicTranslation({ x, y: 0.9, z: -3.8 });
        }
    });

    return (
        <RigidBody ref={keeperRef} type="kinematicPosition" colliders={false} restitution={0.2} friction={0}>
            <CuboidCollider args={[0.5, 0.9, 0.2]} />
            <mesh castShadow receiveShadow>
                {/* Simple Red Jersey Body */}
                <boxGeometry args={[1.0, 1.8, 0.4]} />
                <meshStandardMaterial color="#FF5252" roughness={0.7} />
            </mesh>
        </RigidBody>
    );
}
