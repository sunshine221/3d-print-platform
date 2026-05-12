'use client';

import { Canvas } from '@react-three/fiber';
import { Stage, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

interface SceneProps {
  fileUrl: string;
}

function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#1890ff" flatShading />
    </mesh>
  );
}

function Scene({ fileUrl }: SceneProps) {
  return (
    <Canvas camera={{ position: [5, 3, 5], fov: 45 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6}>
          <STLModel url={fileUrl} />
        </Stage>
        <OrbitControls autoRotate autoRotateSpeed={1} enableZoom />
      </Suspense>
    </Canvas>
  );
}

export default Scene;
