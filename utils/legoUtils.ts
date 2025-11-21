import * as THREE from 'three';
import { Dimensions } from '../types';

// Size of a single 1x1 stud block in world units
export const STUD_SIZE = 1; 
export const BRICK_HEIGHT = 1.2; // Height ratio relative to width (1 stud width = 1 unit)
export const PLATE_HEIGHT = 0.4; 

export const snapToGrid = (position: THREE.Vector3, dims: Dimensions, rotation: number): [number, number, number] => {
  // Basic grid size
  const gridSize = 1;
  
  // Adjust for even/odd dimensions based on rotation
  // If a brick is 2x4, the center is on a grid line. If 1x1, center is middle of square.
  // For simplicity in this demo, we align everything to 0.5 offsets
  
  let x = Math.round(position.x);
  let z = Math.round(position.z);
  // Vertical snap (plates are 1/3 of brick)
  let y = Math.round(position.y / PLATE_HEIGHT) * PLATE_HEIGHT;

  // Minimal constraints
  if (y < 0) y = 0;

  return [x, y, z];
};

export const getDimensionsWithRotation = (dims: Dimensions, rotation: number): { x: number, z: number, y: number } => {
  const isRotated = rotation % 2 !== 0;
  return {
    x: isRotated ? dims.depth : dims.width,
    z: isRotated ? dims.width : dims.depth,
    y: dims.height === 1 ? BRICK_HEIGHT : PLATE_HEIGHT
  };
};
