import React from 'react';
import { useTexture } from '@react-three/drei';
import { BlockType, Position } from '../types';
import { BLOCK_SIZE, TEXTURE_MAP, BLOCK_COLORS } from '../constants';
import * as THREE from 'three';

interface BlockProps {
  position: Position;
  type: BlockType;
  onClick?: (event: THREE.Event) => void;
}

const Block: React.FC<BlockProps> = ({ position, type, onClick }) => {
  const textureUrl = TEXTURE_MAP[type];
  const color = BLOCK_COLORS[type];

  // Try to load texture, fall back to color if texture fails or is not applicable
  const texture = useTexture(textureUrl, (loadedTexture) => {
    loadedTexture.magFilter = THREE.NearestFilter;
    loadedTexture.minFilter = THREE.NearestFilter;
    loadedTexture.wrapS = THREE.RepeatWrapping;
    loadedTexture.wrapT = THREE.RepeatWrapping;
  });

  return (
    <mesh position={[position[0], position[1], position[2]]} onClick={onClick}>
      <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
      {type === BlockType.Water ? (
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      ) : (
        <meshStandardMaterial map={texture || undefined} color={texture ? undefined : color} />
      )}
    </mesh>
  );
};

export default Block;