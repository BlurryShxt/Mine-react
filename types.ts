export enum BlockType {
  Grass = 'Grass',
  Dirt = 'Dirt',
  Stone = 'Stone',
  Wood = 'Wood',
  Sand = 'Sand',
  Water = 'Water', // For visual representation only, no swimming physics
}

export type Position = [number, number, number];

export interface BlockData {
  type: BlockType;
  position: Position;
}