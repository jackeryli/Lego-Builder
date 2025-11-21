import * as THREE from 'three';

export type BrickType = '1x1' | '1x2' | '1x3' | '1x4' | '2x2' | '2x3' | '2x4' | '2x6' | 'plate1x1' | 'plate2x4' | 'slope2x2';

export interface BrickData {
  id: string;
  type: BrickType;
  position: [number, number, number]; // x, y, z in grid units
  rotation: number; // 0, 1, 2, 3 (multiples of 90 degrees)
  color: string;
  opacity?: number;
  isTransparent?: boolean;
}

export interface Dimensions {
  width: number; // studs x
  depth: number; // studs z
  height: number; // standard brick height units (1 = brick, 0.33 = plate)
}

export const BRICK_DIMENSIONS: Record<BrickType, Dimensions> = {
  '1x1': { width: 1, depth: 1, height: 1 },
  '1x2': { width: 1, depth: 2, height: 1 },
  '1x3': { width: 1, depth: 3, height: 1 },
  '1x4': { width: 1, depth: 4, height: 1 },
  '2x2': { width: 2, depth: 2, height: 1 },
  '2x3': { width: 2, depth: 3, height: 1 },
  '2x4': { width: 2, depth: 4, height: 1 },
  '2x6': { width: 2, depth: 6, height: 1 },
  'plate1x1': { width: 1, depth: 1, height: 0.333 },
  'plate2x4': { width: 2, depth: 4, height: 0.333 },
  'slope2x2': { width: 2, depth: 2, height: 1 },
};

export const LEGO_COLORS = [
  { name: 'Red', hex: '#C91A09' },
  { name: 'Blue', hex: '#0055BF' },
  { name: 'Yellow', hex: '#F2CD37' },
  { name: 'Black', hex: '#05131D' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Green', hex: '#237841' },
  { name: 'Dark Grey', hex: '#6B5A5A' },
  { name: 'Light Grey', hex: '#A0A5A9' },
  { name: 'Brown', hex: '#582A12' },
  { name: 'Orange', hex: '#FE8A18' },
  { name: 'Lime', hex: '#BBE90B' },
  { name: 'Sand Green', hex: '#A0BCAC' },
  { name: 'Trans-Clear', hex: '#EEEEEE', transparent: true, opacity: 0.6 },
  { name: 'Trans-Blue', hex: '#AEEFEC', transparent: true, opacity: 0.6 },
  { name: 'Trans-Red', hex: '#C91A09', transparent: true, opacity: 0.6 },
];

export type ToolMode = 'view' | 'place' | 'select' | 'paint' | 'erase';
