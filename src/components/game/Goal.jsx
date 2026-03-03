import React, { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

export default function Goal({ position }) {
    // Goal dimensions (standard soccer goal ratio roughly scaled)
    const goalWidth = 7.32;
    const goalHeight = 2.44;
    const goalDepth = 2.0;
    const postThickness = 0.12;

    // Procedural Net Texture
    const netTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, 256, 256);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 4;

        // Hexagonal or diamond pattern can be approximated by diagonal lines
        for (let i = -256; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 256, 256);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i + 256, 0);
            ctx.lineTo(i, 256);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // Adjust repeat based on typical face sizes
        texture.repeat.set(goalWidth, goalHeight);
        return texture;
    }, [goalWidth, goalHeight]);

    // Side net repeat
    const sideNetTexture = netTexture.clone();
    sideNetTexture.repeat.set(goalDepth, goalHeight);

    // Top net repeat
    const topNetTexture = netTexture.clone();
    topNetTexture.repeat.set(goalWidth, goalDepth);

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

            {/* Visual Net composed of distinct planes */}
            {/* Back Net */}
            <mesh position={[0, goalHeight / 2, -goalDepth]} receiveShadow transparent>
                <planeGeometry args={[goalWidth, goalHeight]} />
                <meshStandardMaterial map={netTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {/* Left Net */}
            <mesh position={[-goalWidth / 2, goalHeight / 2, -goalDepth / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow transparent>
                <planeGeometry args={[goalDepth, goalHeight]} />
                <meshStandardMaterial map={sideNetTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {/* Right Net */}
            <mesh position={[goalWidth / 2, goalHeight / 2, -goalDepth / 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow transparent>
                <planeGeometry args={[goalDepth, goalHeight]} />
                <meshStandardMaterial map={sideNetTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {/* Top Net */}
            <mesh position={[0, goalHeight, -goalDepth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow transparent>
                <planeGeometry args={[goalWidth, goalDepth]} />
                <meshStandardMaterial map={topNetTexture} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
        </group>
    );
}
