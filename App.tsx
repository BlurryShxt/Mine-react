import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stats } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import World from './components/World';
import Player from './components/Player';
import Hud from './components/Hud';
import { BlockType, Position } from './types';
import { INITIAL_ACTIVE_BLOCK, WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH, GRAVITY } from './constants';

function App() {
  const [worldBlocks, setWorldBlocks] = useState<Map<string, BlockType>>(new Map());
  const [activeBlockType, setActiveBlockType] = useState<BlockType>(INITIAL_ACTIVE_BLOCK);

  const getBlockKey = useCallback((x: number, y: number, z: number) => `${x},${y},${z}`, []);

  // Function to generate the initial world
  const generateInitialWorld = useCallback(() => {
    const initialBlocks = new Map<string, BlockType>();
    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let z = 0; z < WORLD_DEPTH; z++) {
        // Base layer of dirt
        initialBlocks.set(getBlockKey(x, 0, z), BlockType.Dirt);

        // Grass layer on top, with some variation
        const height = Math.floor(Math.random() * 2); // 0 or 1 block high
        initialBlocks.set(getBlockKey(x, height + 1, z), BlockType.Grass);

        // Randomly place some stone blocks
        if (Math.random() < 0.05) { // 5% chance for stone
          initialBlocks.set(getBlockKey(x, height, z), BlockType.Stone);
        }
        if (Math.random() < 0.02) { // 2% chance for wood
          initialBlocks.set(getBlockKey(x, height + 2, z), BlockType.Wood);
        }
      }
    }
    setWorldBlocks(initialBlocks);
  }, [getBlockKey]);

  // Initialize world blocks on mount
  useEffect(() => {
    generateInitialWorld();
  }, [generateInitialWorld]);

  const handleAddBlock = useCallback(
    (position: Position, type: BlockType) => {
      setWorldBlocks((prevBlocks) => {
        const key = getBlockKey(position[0], position[1], position[2]);
        // Prevent placing blocks outside world boundaries or on existing blocks
        if (
          position[0] < 0 || position[0] >= WORLD_WIDTH ||
          position[1] < 0 || position[1] >= WORLD_HEIGHT ||
          position[2] < 0 || position[2] >= WORLD_DEPTH ||
          prevBlocks.has(key)
        ) {
          return prevBlocks; // Don't add
        }
        const newBlocks = new Map(prevBlocks);
        newBlocks.set(key, type);
        return newBlocks;
      });
    },
    [getBlockKey],
  );

  const handleRemoveBlock = useCallback(
    (position: Position) => {
      setWorldBlocks((prevBlocks) => {
        const key = getBlockKey(position[0], position[1], position[2]);
        if (!prevBlocks.has(key)) return prevBlocks; // Don't remove if not found
        const newBlocks = new Map(prevBlocks);
        newBlocks.delete(key);
        return newBlocks;
      });
    },
    [getBlockKey],
  );

  const handleActiveBlockChange = useCallback((type: BlockType) => {
    setActiveBlockType(type);
  }, []);

  return (
    <>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <color attach="background" args={['#87CEEB']} /> {/* Sky blue background */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Sky sunPosition={[100, 20, 100]} /> {/* Dynamic sky */}
        <Stats /> {/* Performance monitor */}

        {/* Physics wrapper for game entities */}
        <Physics gravity={[0, GRAVITY, 0]}>
          <World blocks={worldBlocks} />
          <Player
            worldBlocks={worldBlocks}
            addBlock={handleAddBlock}
            removeBlock={handleRemoveBlock}
            onActiveBlockChange={handleActiveBlockChange}
          />
        </Physics>
        {/* <OrbitControls /> */} {/* Commented out for first-person */}
      </Canvas>
      <Hud activeBlockType={activeBlockType} />
    </>
  );
}

export default App;