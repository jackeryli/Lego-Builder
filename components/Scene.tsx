import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { ProceduralBrick } from './ProceduralBrick';
import { BRICK_DIMENSIONS, LEGO_COLORS } from '../types';
import { snapToGrid, getDimensionsWithRotation, BRICK_HEIGHT, PLATE_HEIGHT } from '../utils/legoUtils';

const SceneContent: React.FC = () => {
  const { 
    bricks, 
    activeBrickType, 
    activeColor, 
    currentTool, 
    addBrick, 
    removeBrick, 
    selectBrick, 
    updateBrick, 
    selectedBrickIds, 
    setColor 
  } = useStore();
  
  const [hoverPos, setHoverPos] = useState<[number, number, number] | null>(null);
  const [previewRotation, setPreviewRotation] = useState(0);
  const orbitRef = useRef<any>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        setPreviewRotation(prev => (prev + 1) % 4);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBrickIds.length > 0) {
          selectedBrickIds.forEach(id => removeBrick(id));
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        useStore.getState().undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        useStore.getState().redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBrickIds, removeBrick]);

  // Raycasting logic for placement
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (currentTool !== 'place') return;

    const intersect = e.intersections[0];
    if (!intersect) return;

    const point = intersect.point;
    const normal = intersect.face?.normal || new THREE.Vector3(0, 1, 0);
    
    // Snap logic
    let x = Math.round(point.x);
    let z = Math.round(point.z);
    let y = 0;

    if (intersect.object.name === 'ground') {
      y = 0;
    } else {
      // Stacking on top of another brick
      // Usually this requires finding the exact top of the brick below
      // Simplified:
      if (Math.abs(normal.y) > 0.5) {
        y = point.y + (normal.y > 0 ? 0 : 0); // On top
      } else {
        // Side attachment (simplified)
        x += Math.round(normal.x);
        z += Math.round(normal.z);
        y = Math.floor(point.y / PLATE_HEIGHT) * PLATE_HEIGHT;
      }
    }
    
    // Simple floor clamp
    if (y < 0) y = 0;

    setHoverPos([x, y, z]);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 5) return; // Prevent click after drag

    if (currentTool === 'place' && hoverPos) {
      const activeColorObj = LEGO_COLORS.find(c => c.hex === activeColor);
      addBrick({
        type: activeBrickType,
        position: hoverPos,
        rotation: previewRotation,
        color: activeColor,
        isTransparent: activeColorObj?.transparent,
        opacity: activeColorObj?.opacity
      });
    }
  };

  const handleBrickClick = (e: ThreeEvent<MouseEvent>, id: string, brickColor: string) => {
    e.stopPropagation();
    if (currentTool === 'select') {
        selectBrick(id, e.shiftKey);
    } else if (currentTool === 'erase') {
        removeBrick(id);
    } else if (currentTool === 'paint') {
        updateBrick(id, { color: activeColor });
    } else if (currentTool === 'place') {
       // Handled by scene click (stacking) but we need to ensure we don't select
       handleClick(e);
    }
  };

  // Find transparency for ghost brick
  const activeColorObj = LEGO_COLORS.find(c => c.hex === activeColor);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <Environment preset="city" />

      <group>
        {bricks.map((brick) => (
          <group 
            key={brick.id} 
            position={new THREE.Vector3(...brick.position)} 
            rotation={[0, brick.rotation * (Math.PI / 2), 0]}
            onClick={(e) => handleBrickClick(e, brick.id, brick.color)}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <ProceduralBrick 
              type={brick.type} 
              color={brick.color} 
              selected={selectedBrickIds.includes(brick.id)}
              transparent={brick.isTransparent}
              opacity={brick.opacity}
            />
          </group>
        ))}
      </group>

      {/* Ghost Brick */}
      {currentTool === 'place' && hoverPos && (
        <group 
          position={new THREE.Vector3(...hoverPos)} 
          rotation={[0, previewRotation * (Math.PI / 2), 0]}
        >
          <ProceduralBrick 
            type={activeBrickType} 
            color={activeColor} 
            opacity={0.5} 
            transparent 
            selected={false}
          />
        </group>
      )}

      {/* Ground Plane */}
      <mesh 
        name="ground" 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        onPointerMove={handlePointerMove} 
        onClick={handleClick}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f0f0f0" roughness={1} />
      </mesh>

      <Grid 
        position={[0, 0.01, 0]} 
        args={[100, 100]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6f6f6f" 
        sectionSize={4} 
        sectionThickness={1} 
        sectionColor="#9d4b4b" 
        fadeDistance={50} 
        infiniteGrid 
      />

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={50} blur={2} far={4} />
      
      <OrbitControls ref={orbitRef} makeDefault minDistance={5} maxDistance={100} dampingFactor={0.1} />
    </>
  );
};

export const Scene: React.FC = () => {
  return (
    <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
      <SceneContent />
    </Canvas>
  );
};
