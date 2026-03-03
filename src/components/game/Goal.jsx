import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export default function Goal({ position }) {
    // Goal dimensions (standard soccer goal ratio roughly scaled)
    const goalWidth = 7.32;
    const goalHeight = 2.44;
    const goalDepth = 2.0;
    const postThickness = 0.12;

    return (
        <group position={position}>
            {/* Visual Posts */}
            <mesh position={[-goalWidth / 2, goalHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[postThickness, postThickness, goalHeight]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>
            <mesh position={[goalWidth / 2, goalHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[postThickness, postThickness, goalHeight]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>
            <mesh position={[0, goalHeight, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[postThickness, postThickness, goalWidth + postThickness * 2]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
            </mesh>

            {/* Physics Colliders for precise bouncing off posts */}
            <RigidBody type="fixed" colliders={false} restitution={0.8}>
                {/* Posts */}
                <CuboidCollider position={[-goalWidth / 2, goalHeight / 2, 0]} args={[postThickness, goalHeight / 2, postThickness]} />
                <CuboidCollider position={[goalWidth / 2, goalHeight / 2, 0]} args={[postThickness, goalHeight / 2, postThickness]} />
                {/* Crossbar */}
                <CuboidCollider position={[0, goalHeight, 0]} args={[goalWidth / 2, postThickness, postThickness]} />

                {/* Invisible Net Collision Walls (prevents ball from flying through back) */}
                <CuboidCollider position={[0, goalHeight / 2, -goalDepth]} args={[goalWidth / 2, goalHeight / 2, 0.05]} />
                <CuboidCollider position={[-goalWidth / 2, goalHeight / 2, -goalDepth / 2]} args={[0.05, goalHeight / 2, goalDepth / 2]} />
                <CuboidCollider position={[goalWidth / 2, goalHeight / 2, -goalDepth / 2]} args={[0.05, goalHeight / 2, goalDepth / 2]} />
                <CuboidCollider position={[0, goalHeight, -goalDepth / 2]} args={[goalWidth / 2, 0.05, goalDepth / 2]} />
            </RigidBody>

            {/* Visual Net - Low poly representation using wireframe plane */}
            <mesh position={[0, goalHeight / 2, -goalDepth]} receiveShadow>
                <planeGeometry args={[goalWidth, goalHeight, 20, 10]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.15} wireframe />
            </mesh>
        </group>
    );
}
