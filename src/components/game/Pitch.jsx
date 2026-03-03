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
            <mesh receiveShadow position={[0, 0.01, -4]} rotation={[-Math.PI / 2, 0, 0]}>
                {/* Goal Line */}
                <planeGeometry args={[14, 0.1]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Penalty Area Lines */}
            <mesh receiveShadow position={[-7, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 4]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh receiveShadow position={[7, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 4]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[14.1, 0.1]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Penalty Spot */}
            <mesh receiveShadow position={[0, 0.01, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.1, 32]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </>
    );
}
