import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Mesh, Color } from "three";
import { Environment, Float } from "@react-three/drei";

function AnimatedSphere({ color, score }: { color: string; score: number }) {
  const meshRef = useRef<Mesh>(null);
  const colorObj = useMemo(() => {
    if (color === "red") return new Color(0.9, 0.2, 0.2);
    if (color === "orange") return new Color(1.0, 0.6, 0.1);
    return new Color(0.1, 0.85, 0.5);
  }, [color]);

  const intensity = useMemo(() => (score - 300) / 600, [score]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          color={colorObj}
          emissive={colorObj}
          emissiveIntensity={0.4 + intensity * 0.4}
          roughness={0.15}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshStandardMaterial
          color={colorObj}
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function ScoreSphere({ color, score }: { color: string; score: number }) {
  return (
    <div className="w-full h-[300px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        <AnimatedSphere color={color} score={score} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
