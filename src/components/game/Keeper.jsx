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
            <CuboidCollider args={[0.8, 0.9, 0.2]} position={[0, 0.9, 0]} />
            <group position={[0, 0, 0]}>
                {/* Head */}
                <mesh position={[0, 1.7, 0]} castShadow>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                </mesh>
                {/* Torso (Jersey) */}
                <mesh position={[0, 1.1, 0]} castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.3]} />
                    <meshStandardMaterial color="#FF5252" roughness={0.7} />
                </mesh>
                {/* Left Arm */}
                <mesh position={[-0.4, 1.1, 0]} castShadow rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[0.2, 0.8, 0.2]} />
                    <meshStandardMaterial color="#FF5252" roughness={0.7} />
                </mesh>
                {/* Right Arm */}
                <mesh position={[0.4, 1.1, 0]} castShadow rotation={[0, 0, -0.2]}>
                    <boxGeometry args={[0.2, 0.8, 0.2]} />
                    <meshStandardMaterial color="#FF5252" roughness={0.7} />
                </mesh>
                {/* Left Leg */}
                <mesh position={[-0.15, 0.35, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.7, 0.25]} />
                    <meshStandardMaterial color="#1B1B1B" roughness={0.7} />
                </mesh>
                {/* Right Leg */}
                <mesh position={[0.15, 0.35, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.7, 0.25]} />
                    <meshStandardMaterial color="#1B1B1B" roughness={0.7} />
                </mesh>
            </group>
        </RigidBody>
    );
}
