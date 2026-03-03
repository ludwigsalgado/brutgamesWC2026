import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export default function Pitch() {
    // Procedural striped grass texture
    const grassTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#4CAF50'; // Base green
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.fillStyle = '#43A047'; // Darker stripe
        for (let i = 0; i < 16; i++) {
            ctx.fillRect(0, i * 64, 1024, 32);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 15); // Repeat map across the pitch
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }, []);

    // Procedural crowd texture
    const crowdTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const colors = ['#FF5252', '#448AFF', '#FFEB3B', '#69F0AE', '#E0E0E0', '#FF9800'];

        // Background
        ctx.fillStyle = '#263238';
        ctx.fillRect(0, 0, 512, 256);

        // Draw "people" dots
        for (let i = 0; i < 2000; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 1);
        return texture;
    }, []);

    return (
        <>
            <RigidBody type="fixed" friction={1} restitution={0.2}>
                {/* Main Grass Mesh */}
                <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial map={grassTexture} roughness={0.8} metalness={0.1} />
                </mesh>
            </RigidBody>

            {/* Stadium Elements */}
            <group position={[0, 0, 0]}>
                {/* Advertising Board Left */}
                <mesh position={[-15, 1, -8]} rotation={[0, 0, 0]} receiveShadow>
                    <boxGeometry args={[30, 2, 0.5]} />
                    <meshStandardMaterial color="#000000" roughness={0.5} />
                </mesh>
                <Text position={[-7, 1, -7.7]} color="#ffffff" fontSize={1.2} anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff">
                    LIFE IS A GAME
                </Text>

                {/* Advertising Board Right */}
                <mesh position={[15, 1, -8]} rotation={[0, 0, 0]} receiveShadow>
                    <boxGeometry args={[30, 2, 0.5]} />
                    <meshStandardMaterial color="#FF9800" roughness={0.5} />
                </mesh>
                <Text position={[7, 1, -7.7]} color="#000000" fontSize={1.2} anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff">
                    FOOTBALL IS SERIOUS
                </Text>

                {/* Crowd background (Cylinder mapped) */}
                <mesh position={[0, 5, -12]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[25, 25, 10, 32, 1, true, Math.PI, Math.PI]} />
                    <meshBasicMaterial map={crowdTexture} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Field Lines (Visual Only) */}
            <group position={[0, 0.01, 0]}>
                {/* Goal Line (Full Width) */}
                <mesh receiveShadow position={[0, 0, -4]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[70, 0.15]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Area Chica (Goal Area) */}
                <mesh receiveShadow position={[-5.66, 0, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 3]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[5.66, 0, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 3]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[11.47, 0.15]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Area Grande (Penalty Area) */}
                <mesh receiveShadow position={[-11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[0, 0, 4]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[22.15, 0.15]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Penalty Spot */}
                <mesh receiveShadow position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.2, 32]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* D-Arc */}
                <mesh receiveShadow position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2.9, 3.05, 32, 1, 0, Math.PI]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Touchlines */}
                <mesh receiveShadow position={[-35, 0, 10]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 28]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[35, 0, 10]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.15, 28]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </group>
        </>
    );
}
