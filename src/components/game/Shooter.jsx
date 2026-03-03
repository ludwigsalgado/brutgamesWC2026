import React from 'react';

export default function Shooter({ position }) {
    return (
        <group position={position}>
            {/* Player stands facing the goal (away from camera) */}

            {/* Head */}
            <mesh position={[0, 1.7, 0]} castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
            </mesh>

            {/* Torso (Red Jersey) */}
            <mesh position={[0, 1.1, 0]} castShadow>
                <boxGeometry args={[0.5, 0.8, 0.25]} />
                <meshStandardMaterial color="#D32F2F" roughness={0.8} />
            </mesh>

            {/* Shorts (White) */}
            <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[0.5, 0.3, 0.25]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>

            {/* Left Arm */}
            <mesh position={[-0.35, 1.1, 0]} castShadow rotation={[0, 0, 0.15]}>
                <boxGeometry args={[0.15, 0.7, 0.15]} />
                <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
            </mesh>
            {/* Left Sleeve */}
            <mesh position={[-0.32, 1.35, 0]} castShadow rotation={[0, 0, 0.15]}>
                <boxGeometry args={[0.18, 0.3, 0.18]} />
                <meshStandardMaterial color="#D32F2F" roughness={0.8} />
            </mesh>

            {/* Right Arm */}
            <mesh position={[0.35, 1.1, 0]} castShadow rotation={[0, 0, -0.15]}>
                <boxGeometry args={[0.15, 0.7, 0.15]} />
                <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
            </mesh>
            {/* Right Sleeve */}
            <mesh position={[0.32, 1.35, 0]} castShadow rotation={[0, 0, -0.15]}>
                <boxGeometry args={[0.18, 0.3, 0.18]} />
                <meshStandardMaterial color="#D32F2F" roughness={0.8} />
            </mesh>

            {/* Left Leg (Standing) */}
            <mesh position={[-0.15, 0.2, 0]} castShadow>
                <boxGeometry args={[0.16, 0.6, 0.16]} />
                <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
            </mesh>
            {/* Left Sock */}
            <mesh position={[-0.15, 0.1, 0]} castShadow>
                <boxGeometry args={[0.18, 0.4, 0.18]} />
                <meshStandardMaterial color="#D32F2F" roughness={0.8} />
            </mesh>
            {/* Left Shoe */}
            <mesh position={[-0.15, -0.05, -0.05]} castShadow>
                <boxGeometry args={[0.2, 0.1, 0.3]} />
                <meshStandardMaterial color="#111111" roughness={0.5} />
            </mesh>

            {/* Right Leg (Slightly back as if ready to run/shoot) */}
            <group position={[0.15, 0.4, 0]} rotation={[0.4, 0, 0]}>
                <mesh position={[0, -0.2, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.6, 0.16]} />
                    <meshStandardMaterial color="#FFCCBC" roughness={0.6} />
                </mesh>
                {/* Right Sock */}
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.4, 0.18]} />
                    <meshStandardMaterial color="#D32F2F" roughness={0.8} />
                </mesh>
                {/* Right Shoe */}
                <mesh position={[0, -0.45, -0.05]} castShadow rotation={[-0.2, 0, 0]}>
                    <boxGeometry args={[0.2, 0.1, 0.3]} />
                    <meshStandardMaterial color="#111111" roughness={0.5} />
                </mesh>
            </group>
        </group>
    );
}
