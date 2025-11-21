import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BrickType, BRICK_DIMENSIONS, Dimensions } from '../types';
import { BRICK_HEIGHT, PLATE_HEIGHT } from '../utils/legoUtils';

interface ProceduralBrickProps {
  type: BrickType;
  color: string;
  opacity?: number;
  transparent?: boolean;
  selected?: boolean;
}

export const ProceduralBrick: React.FC<ProceduralBrickProps> = ({ 
  type, 
  color, 
  opacity = 1, 
  transparent = false, 
  selected = false 
}) => {
  const dims = BRICK_DIMENSIONS[type];
  const realHeight = dims.height === 1 ? BRICK_HEIGHT : PLATE_HEIGHT;

  // Geometry generation memoized
  const geometry = useMemo(() => {
    // Base block
    // We subtract a tiny bit to simulate the gap between bricks
    const gap = 0.02;
    const baseGeo = new THREE.BoxGeometry(dims.width - gap, realHeight, dims.depth - gap);
    baseGeo.translate(0, realHeight / 2, 0); // Pivot at bottom center

    // Studs
    const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    studGeo.rotateX(0);
    
    // Merge geometries (simplified approach for R3F using group or merging)
    // For best performance we should merge BufferGeometries, but for this code structure
    // we will return a Group of meshes or a single complex mesh.
    // Let's use a Group for simplicity in reading, though merging is better for draw calls.
    
    return { base: baseGeo, stud: studGeo };
  }, [dims, realHeight]);

  // Create stud positions
  const studPositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    // Logic to center studs:
    // If width is 2, studs are at -0.5 and 0.5.
    const offsetX = (dims.width - 1) / 2;
    const offsetZ = (dims.depth - 1) / 2;

    for (let x = 0; x < dims.width; x++) {
      for (let z = 0; z < dims.depth; z++) {
        // Skip center studs for slopes (simple logic)
        if (type.includes('slope') && z > 0) continue; 
        
        pos.push([x - offsetX, realHeight + 0.1, z - offsetZ]);
      }
    }
    return pos;
  }, [dims, realHeight, type]);

  const materialProps = {
    color: color,
    transparent: transparent,
    opacity: opacity,
    roughness: 0.2,
    metalness: 0.1,
  };

  return (
    <group>
      {/* Main Block */}
      <mesh geometry={geometry.base} castShadow receiveShadow>
        <meshStandardMaterial {...materialProps} />
        {selected && (
          <meshBasicMaterial color="#ffff00" wireframe wireframeLinewidth={2} transparent opacity={0.5} depthTest={false} />
        )}
      </mesh>

      {/* Highlight outline if selected */}
      {selected && (
         <lineSegments>
            <edgesGeometry args={[geometry.base]} />
            <lineBasicMaterial color="yellow" />
         </lineSegments>
      )}

      {/* Studs */}
      {studPositions.map((pos, idx) => (
        <mesh key={idx} position={new THREE.Vector3(...pos)} geometry={geometry.stud} castShadow receiveShadow>
          <meshStandardMaterial {...materialProps} />
          {/* Add logo text texture here in a real app */}
        </mesh>
      ))}
    </group>
  );
};
