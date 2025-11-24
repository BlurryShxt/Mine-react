import React, { useCallback } from 'react';
import { BlockType, Position } from '../types';
import Block from './Block';

interface WorldProps {
  blocks: Map<string, BlockType>; // Changed to receive blocks as prop
}

const World: React.FC<WorldProps> = ({ blocks }) => {
  // Helper to get block key from position (still useful for internal Block component keying)
  const getBlockKey = useCallback((x: number, y: number, z: number) => `${x},${y},${z}`, []);

  return (
    <group>
      {Array.from(blocks.entries()).map(([key, type]) => {
        const [x, y, z] = key.split(',').map(Number);
        return <Block key={key} position={[x, y, z]} type={type} />;
      })}
    </group>
  );
};

export default World;