import React from 'react';
import { RigidBody } from '@react-three/rapier';

export default function Pitch() {
    return (
        <>
            <RigidBody type="fixed" friction={1} restitution={0.2}>
                {/* Main Grass Mesh */}
                <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[50, 50]} />
                    <meshStandardMaterial color="#1B5E20" roughness={0.8} metalness={0.1} />
                </mesh>
            </RigidBody>

            {/* Field Lines (Visual Only) */}
            <group position={[0, 0.01, 0]}>
                {/* Goal Line (Full Width) */}
                <mesh receiveShadow position={[0, 0, -4]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[50, 0.1]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Area Chica (Goal Area) */}
                <mesh receiveShadow position={[-5.66, 0, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, 3]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[5.66, 0, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, 3]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[11.42, 0.1]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Area Grande (Penalty Area) */}
                <mesh receiveShadow position={[-11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh receiveShadow position={[0, 0, 4]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[22.1, 0.1]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Penalty Spot */}
                <mesh receiveShadow position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.15, 32]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* D-Arc */}
                <mesh receiveShadow position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2.9, 3.0, 32, 1, 0, Math.PI]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </group>
        </>
    );
}
