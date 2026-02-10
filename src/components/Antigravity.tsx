// @ts-nocheck
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const AntigravityInner = ({
    count = 400, // Doubled for impact
    magnetRadius = 25,
    ringRadius = 18,
    waveSpeed = 1.2, // Faster default movement
    waveAmplitude = 2.5, // Deeper waves
    particleSize = 1.8,
    lerpSpeed = 0.08, // Snappier response
    color = '#FF1A4B', // Brighter Vivid Red for visibility on white
    autoAnimate = true,
    particleVariance = 3, // High variance for organic feel
    rotationSpeed = 0.2,
    depthFactor = 2,
    pulseSpeed = 2.5, // Faster heartbeat
    particleShape = 'capsule',
    fieldStrength = 20
}) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { viewport } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const lastMousePos = useRef({ x: 0, y: 0 });
    const lastMouseMoveTime = useRef(0);
    const virtualMouse = useRef({ x: 0, y: 0 });

    const particles = useMemo(() => {
        const temp: any[] = [];
        const width = viewport.width || 100;
        const height = viewport.height || 100;

        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;

            // Wider spread
            const x = (Math.random() - 0.5) * width;
            const y = (Math.random() - 0.5) * height;
            const z = (Math.random() - 0.5) * 30; // More depth

            const randomRadiusOffset = (Math.random() - 0.5) * 5;

            temp.push({
                t,
                factor,
                speed,
                mx: x,
                my: y,
                mz: z,
                cx: x,
                cy: y,
                cz: z,
                randomRadiusOffset,
                // Constant Organic Drift
                driftX: (Math.random() - 0.5) * 0.05,
                driftY: (Math.random() - 0.5) * 0.05
            });
        }
        return temp;
    }, [count, viewport.width, viewport.height]);

    useFrame(state => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const { viewport: v, pointer: m } = state;

        const mouseDist = Math.sqrt(Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2));

        if (mouseDist > 0.001) {
            lastMouseMoveTime.current = Date.now();
            lastMousePos.current = { x: m.x, y: m.y };
        }

        let destX = (m.x * v.width) / 2;
        let destY = (m.y * v.height) / 2;

        if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
            const time = state.clock.getElapsedTime();
            destX = Math.sin(time * 0.5) * (v.width / 4);
            destY = Math.cos(time * 0.5 * 2) * (v.height / 4);
        }

        const smoothFactor = 0.1; // More responsive mouse follow
        virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
        virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

        const targetX = virtualMouse.current.x;
        const targetY = virtualMouse.current.y;

        const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

        particles.forEach((particle, i) => {
            let { t, speed, mx, my, mz, cz, randomRadiusOffset, driftX, driftY } = particle;

            t = particle.t += speed / 2;

            // Apply Drift
            mx += driftX;
            my += driftY;

            // Loop particles around screen
            if (mx > v.width / 2) mx = -v.width / 2;
            if (mx < -v.width / 2) mx = v.width / 2;
            if (my > v.height / 2) my = -v.height / 2;
            if (my < -v.height / 2) my = v.height / 2;

            particle.mx = mx;
            particle.my = my;

            const projectionFactor = 1 - cz / 50;
            const projectedTargetX = targetX * projectionFactor;
            const projectedTargetY = targetY * projectionFactor;

            const dx = mx - projectedTargetX;
            const dy = my - projectedTargetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetPos = { x: mx, y: my, z: mz * depthFactor };

            if (dist < magnetRadius) {
                const angle = Math.atan2(dy, dx) + globalRotation;

                const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
                const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));

                const currentRingRadius = ringRadius + wave + deviation;

                targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
                targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
                targetPos.z = mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor);
            }

            particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
            particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
            particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

            dummy.position.set(particle.cx, particle.cy, particle.cz);

            dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
            dummy.rotateX(Math.PI / 2);

            const currentDistToMouse = Math.sqrt(
                Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
            );

            const distFromRing = Math.abs(currentDistToMouse - ringRadius);

            // VISIBILITY:
            // 1. Base visibility for everything (0.1) - faint background noise
            // 2. High visibility near ring
            let scaleFactor = 1 - distFromRing / 12;
            scaleFactor = Math.max(0.15, Math.min(1, scaleFactor)); // Always show at least 15%

            const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.3 * particleVariance) * particleSize;
            dummy.scale.set(finalScale, finalScale, finalScale);

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        });

        mesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            {particleShape === 'capsule' && <capsuleGeometry args={[0.08, 0.45, 4, 8]} />}
            {particleShape === 'sphere' && <sphereGeometry args={[0.2, 16, 16]} />}

            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5}
                transparent
                opacity={0.7}
                toneMapped={false}
            />
        </instancedMesh>
    );
};

const Antigravity = (props: any) => {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 50], fov: 35 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <AntigravityInner {...props} />
            </Canvas>
        </div>
    );
};

export default Antigravity;
