import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export default function Keeper({ position }) {
    const keeperRef = useRef();

    useFrame((state) => {
        if (keeperRef.current) {
            const time = state.clock.getElapsedTime();
            // Ping pong motion between the goal posts
            const x = Math.sin(time * 2.5) * 2.8;

            // Update kinematic position instantly
            keeperRef.current.setNextKinematicTranslation({ x, y: 0.9, z: -3.8 });
        }
    });

    return (
        <RigidBody ref={keeperRef} type="kinematicPosition" colliders={false} restitution={0.2} friction={0}>
            {/* Slightly wider collider to account for active pose */}
            <CuboidCollider args={[0.9, 0.9, 0.25]} position={[0, 0.9, 0]} />
            <group position={[0, 0, 0]}>
                {/* Head */}
                <mesh position={[0, 1.7, 0.05]} castShadow>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                </mesh>

                {/* Torso (Cyan Jersey) */}
                <mesh position={[0, 1.1, 0]} castShadow rotation={[0.05, 0, 0]}>
                    <boxGeometry args={[0.6, 0.8, 0.3]} />
                    <meshStandardMaterial color="#00E5FF" roughness={0.7} />
                </mesh>

                {/* Shorts (Black) */}
                <mesh position={[0, 0.55, 0]} castShadow>
                    <boxGeometry args={[0.6, 0.35, 0.32]} />
                    <meshStandardMaterial color="#111111" roughness={0.8} />
                </mesh>

                {/* Left Arm (Bent ready to dive) */}
                <group position={[-0.4, 1.3, 0]} rotation={[0, 0, 0.5]}>
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <boxGeometry args={[0.18, 0.6, 0.18]} />
                        <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                    </mesh>
                    {/* Left Sleeve */}
                    <mesh position={[0, -0.1, 0]} castShadow>
                        <boxGeometry args={[0.22, 0.3, 0.22]} />
                        <meshStandardMaterial color="#00E5FF" roughness={0.7} />
                    </mesh>
                    {/* Left Glove */}
                    <mesh position={[0, -0.65, 0]} castShadow>
                        <boxGeometry args={[0.25, 0.25, 0.25]} />
                        <meshStandardMaterial color="#ECEFF1" roughness={0.5} />
                    </mesh>
                </group>

                {/* Right Arm (Bent ready to dive) */}
                <group position={[0.4, 1.3, 0]} rotation={[0, 0, -0.5]}>
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <boxGeometry args={[0.18, 0.6, 0.18]} />
                        <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                    </mesh>
                    {/* Right Sleeve */}
                    <mesh position={[0, -0.1, 0]} castShadow>
                        <boxGeometry args={[0.22, 0.3, 0.22]} />
                        <meshStandardMaterial color="#00E5FF" roughness={0.7} />
                    </mesh>
                    {/* Right Glove */}
                    <mesh position={[0, -0.65, 0]} castShadow>
                        <boxGeometry args={[0.25, 0.25, 0.25]} />
                        <meshStandardMaterial color="#ECEFF1" roughness={0.5} />
                    </mesh>
                </group>

                {/* Left Leg (Spread) */}
                <group position={[-0.2, 0.35, 0]} rotation={[0, 0, -0.2]}>
                    <mesh position={[0, -0.15, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.4, 0.2]} />
                        <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                    </mesh>
                    {/* Left Sock */}
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <boxGeometry args={[0.22, 0.4, 0.22]} />
                        <meshStandardMaterial color="#ECEFF1" roughness={0.8} />
                    </mesh>
                    {/* Left Shoe */}
                    <mesh position={[0, -0.5, 0.05]} castShadow>
                        <boxGeometry args={[0.22, 0.12, 0.3]} />
                        <meshStandardMaterial color="#111111" roughness={0.5} />
                    </mesh>
                </group>

                {/* Right Leg (Spread) */}
                <group position={[0.2, 0.35, 0]} rotation={[0, 0, 0.2]}>
                    <mesh position={[0, -0.15, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.4, 0.2]} />
                        <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                    </mesh>
                    {/* Right Sock */}
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <boxGeometry args={[0.22, 0.4, 0.22]} />
                        <meshStandardMaterial color="#ECEFF1" roughness={0.8} />
                    </mesh>
                    {/* Right Shoe */}
                    <mesh position={[0, -0.5, 0.05]} castShadow>
                        <boxGeometry args={[0.22, 0.12, 0.3]} />
                        <meshStandardMaterial color="#111111" roughness={0.5} />
                    </mesh>
                </group>
            </group>
        </RigidBody>
    );
}
