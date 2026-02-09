
"use client";

import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useRef, useState } from 'react';

interface ParticleFieldProps {
    color?: string;
}

const ParticleField = ({ color = '#ff4d4d' }: ParticleFieldProps) => {
    const ref = useRef<THREE.Points>(null!);
    const [mouse] = useState(() => new THREE.Vector2());

    const particles = Array.from({ length: 5000 }, () => ({
        position: [ (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25 ],
        factor: 0.5 + Math.random() * 2,
        speed: 0.005 + Math.random() / 200,
        xFactor: -1 + Math.random() * 2,
        yFactor: -1 + Math.random() * 2,
        zFactor: -1 + Math.random() * 2,
    }));

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta / 15;

            const positions = ref.current.geometry.attributes.position.array;

            for (let i = 0; i < particles.length; i++) {
                const i3 = i * 3;
                const p = particles[i];

                positions[i3] += p.speed * p.xFactor;
                if (positions[i3] > 10 || positions[i3] < -10) p.xFactor = -p.xFactor;

                positions[i3 + 1] += p.speed * p.yFactor;
                if (positions[i3 + 1] > 10 || positions[i3 + 1] < -10) p.yFactor = -p.yFactor;

                positions[i3 + 2] += p.speed * p.zFactor;
                if (positions[i3 + 2] > 10 || positions[i3 + 2] < -10) p.zFactor = -p.zFactor;
            }

            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <Points ref={ref} positions={new Float32Array(particles.flatMap(p => p.position))} stride={3}>
            <PointMaterial
                transparent
                color={color}
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </Points>
    );
};

export default ParticleField;
