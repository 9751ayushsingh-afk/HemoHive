/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import * as THREE from 'three';
import './Lanyard.css';

// Preload calls removed to prevent loading errors
// useGLTF.preload('/card.glb');
// useTexture.preload('/lanyard.png');

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  offsetX?: number;
  onLoad?: () => void;
}

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -3, 0], fov = 20, transparent = true, offsetX = 0, onLoad }: LanyardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Call onLoad callback after component is mounted
    if (onLoad) {
      const timer = setTimeout(() => {
        onLoad();
      }, 500); // Small delay to ensure proper loading
      return () => clearTimeout(timer);
    }
  }, [onLoad]);

  if (!mounted) {
    return <div className="lanyard-wrapper" />;
  }

  return (
    <div className="lanyard-wrapper">
               <Canvas
                 shadows
                 gl={{ alpha: true, stencil: false, depth: false, antialias: false, powerPreference: 'high-performance' }}
                 camera={{ position: [0, 0, 15], fov: 45, near: 1, far: 200 }}
                 onCreated={({ gl }) =>
                   gl.setClearColor(new THREE.Color(0x000000), 0)
                 }
               >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
        <Physics gravity={gravity} timeStep={1/60} paused={false}>
          <Band offsetX={offsetX} />
        </Physics>
        <Environment frames={Infinity} resolution={256} background blur={1}>
          <Lightformer form="rect" intensity={1} color="white" position={[-1, 0, 5]} rotation={[0, 0.5, 0]} scale={[10, 5, 1]} />
          <Lightformer form="rect" intensity={1} color="white" position={[-5, 0, 1]} rotation={[0, 0.5, 0]} scale={[10, 5, 1]} />
          <Lightformer form="rect" intensity={1} color="white" position={[-5, 0, 15]} rotation={[0, 0.5, 0]} scale={[10, 5, 1]} />
          <Lightformer form="rect" intensity={1} color="white" position={[10, 0, 1]} rotation={[0, -0.1, 0]} scale={[10, 5, 1]} />
          <Lightformer form="rect" intensity={1} color="white" position={[10, 0, 15]} rotation={[0, -0.1, 0]} scale={[10, 5, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
function Band({ maxSpeed = 50, minSpeed = 0, offsetX = 0 }) {
  const band = useRef<any>();
  const fixed = useRef<any>();
  const j1 = useRef<any>();
  const j2 = useRef<any>();
  const j3 = useRef<any>();
  const card = useRef<any>();

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = { type: 'dynamic' as const, canSleep: true, angularDamping: 0.3, linearDamping: 0.3 };
  
  // Use fallback geometry instead of corrupted GLB file
  const cardGeometry = new THREE.BoxGeometry(4, 6, 0.2);
  const cardMaterial = new THREE.MeshStandardMaterial({ 
    color: '#ffffff',
    metalness: 0.1,
    roughness: 0.2
  });
  const nodes = { card: { geometry: cardGeometry } };
  const materials = { card: cardMaterial };
  
  // Remove texture dependency to prevent loading errors
  // const texture = useTexture('/lanyard.png');

  const [curve] = useState(
    () => {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(0, 6, 0)
      ];
      return new THREE.CatmullRomCurve3(points);
    }
  );
  const [dragged, drag] = useState<any>(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.5]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.5]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.5]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref:any) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      
      // Update tube geometry with new curve
      band.current.geometry.dispose();
      band.current.geometry = new THREE.TubeGeometry(curve, 32, 0.5, 8, false);
      
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <RigidBody ref={fixed} {...segmentProps} type="fixed" position={[offsetX, 8, 0]} />
      <RigidBody position={[offsetX + 0.1, 6, 0]} ref={j1} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody position={[offsetX - 0.1, 4, 0]} ref={j2} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody position={[offsetX, 2, 0]} ref={j3} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody
        ref={card}
        {...segmentProps}
        type={dragged ? 'kinematicPosition' : 'dynamic'}
        linearDamping={0.2}
        angularDamping={0.2}
        friction={0.3}
        position={[offsetX, 0, 0]}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        onPointerUp={(e:any) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
        onPointerDown={(e:any) => (
          e.target.setPointerCapture(e.pointerId),
          drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
        )}
      >
        <CuboidCollider args={[2, 3, 0.1]} />
        <mesh castShadow receiveShadow scale={isSmall ? 0.8 : 1}>
          <boxGeometry args={[4, 6, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
          <mesh geometry={nodes.card.geometry} material={materials.card} material-envMapIntensity={0.2} />
        </mesh>
      </RigidBody>
      <mesh ref={band}>
        <tubeGeometry args={[curve, 32, 0.5, 8, false]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}