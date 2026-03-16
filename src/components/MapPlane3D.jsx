import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { getStaticMapUrl } from "../utils/mapConfig";

export default function MapPlane3D({ position }) {
  const textureUrl =
    getStaticMapUrl({ width: 1024, height: 576 }) || "/map-placeholder.png";
  const texture = useLoader(TextureLoader, textureUrl);

  return (
    <group position={position} renderOrder={0}>
      <mesh renderOrder={0}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
