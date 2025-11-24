import { BlockType } from './types';

export const WORLD_WIDTH = 32;
export const WORLD_HEIGHT = 16;
export const WORLD_DEPTH = 32;
export const BLOCK_SIZE = 1; // Size of a single block unit

export const PLAYER_HEIGHT = 1.8;
export const PLAYER_RADIUS = 0.3;
export const PLAYER_SPEED = 5;
export const JUMP_VELOCITY = 8;
export const GRAVITY = -20;
export const TERMINAL_VELOCITY = -50; // Max falling speed

export const RAYCAST_DISTANCE = 5; // Max distance for block interaction

export const TEXTURE_MAP: Record<BlockType, string> = {
  [BlockType.Grass]: 'https://picsum.photos/seed/grass/64/64',
  [BlockType.Dirt]: 'https://picsum.photos/seed/dirt/64/64',
  [BlockType.Stone]: 'https://picsum.photos/seed/stone/64/64',
  [BlockType.Wood]: 'https://picsum.photos/seed/wood/64/64',
  [BlockType.Sand]: 'https://picsum.photos/seed/sand/64/64',
  [BlockType.Water]: 'https://picsum.photos/seed/water/64/64', // Water will just be a blue block
};

export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.Grass]: '#558B2F',
  [BlockType.Dirt]: '#8B4513',
  [BlockType.Stone]: '#808080',
  [BlockType.Wood]: '#8B4513',
  [BlockType.Sand]: '#F4A460',
  [BlockType.Water]: '#4682B4',
};

export const INITIAL_PLAYER_POSITION: [number, number, number] = [
  WORLD_WIDTH / 2,
  WORLD_HEIGHT + PLAYER_HEIGHT / 2, // Start above the world
  WORLD_DEPTH / 2,
];

export const INITIAL_ACTIVE_BLOCK = BlockType.Dirt;
