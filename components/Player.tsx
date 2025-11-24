import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import useKeyboardInput from '../hooks/useKeyboardInput';
import {
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
  TERMINAL_VELOCITY,
  BLOCK_SIZE,
  RAYCAST_DISTANCE,
  INITIAL_PLAYER_POSITION,
  INITIAL_ACTIVE_BLOCK,
} from '../constants';
import { BlockType, Position } from '../types'; // Fix: Import BlockType from types.ts

// For collision detection, simple AABB/Capsule collision with world blocks
const checkCollision = (
  playerPos: THREE.Vector3,
  playerRadius: number,
  playerHeight: number,
  blockPositions: Map<string, BlockType>,
) => {
  const playerMin = new THREE.Vector3(
    playerPos.x - playerRadius,
    playerPos.y - playerHeight / 2,
    playerPos.z - playerRadius,
  );
  const playerMax = new THREE.Vector3(
    playerPos.x + playerRadius,
    playerPos.y + playerHeight / 2,
    playerPos.z + playerRadius,
  );

  const collidedBlocks: THREE.Vector3[] = [];

  for (const blockKey of blockPositions.keys()) {
    const [bx, by, bz] = blockKey.split(',').map(Number);
    // Fix: Corrected THREE.3D.Vector3 to THREE.Vector3
    const blockMin = new THREE.Vector3(bx - BLOCK_SIZE / 2, by - BLOCK_SIZE / 2, bz - BLOCK_SIZE / 2);
    // Fix: Corrected THREE.3D.Vector3 to THREE.Vector3
    const blockMax = new THREE.Vector3(bx + BLOCK_SIZE / 2, by + BLOCK_SIZE / 2, bz + BLOCK_SIZE / 2);

    // AABB intersection test
    if (
      playerMax.x > blockMin.x &&
      playerMin.x < blockMax.x &&
      playerMax.y > blockMin.y &&
      playerMin.y < blockMax.y &&
      playerMax.z > blockMin.z &&
      playerMin.z < blockMax.z
    ) {
      collidedBlocks.push(new THREE.Vector3(bx, by, bz));
    }
  }
  return collidedBlocks;
};

interface PlayerProps {
  worldBlocks: Map<string, BlockType>;
  addBlock: (position: Position, type: BlockType) => void;
  removeBlock: (position: Position) => void;
  onActiveBlockChange: (type: BlockType) => void;
}

const Player: React.FC<PlayerProps> = ({
  worldBlocks,
  addBlock,
  removeBlock,
  onActiveBlockChange,
}) => {
  const { camera, scene, gl } = useThree();
  const controls = useRef<any>(null); // PointerLockControls ref
  const keyboard = useKeyboardInput();

  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const playerPosition = useRef(new THREE.Vector3(...INITIAL_PLAYER_POSITION));
  const isGrounded = useRef(false);
  const movementVector = useRef(new THREE.Vector3());

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [activeBlockType, setActiveBlockType] = useState<BlockType>(INITIAL_ACTIVE_BLOCK);

  // Update active block type in parent
  useEffect(() => {
    onActiveBlockChange(activeBlockType);
  }, [activeBlockType, onActiveBlockChange]);

  // Handle block type selection
  useEffect(() => {
    const handleNumberKeys = (event: KeyboardEvent) => {
      const numKey = parseInt(event.key, 10);
      if (!isNaN(numKey) && numKey >= 1 && numKey <= Object.keys(BlockType).length) {
        const blockTypes = Object.values(BlockType).filter((v) => typeof v === 'string') as BlockType[];
        const newBlockType = blockTypes[numKey - 1];
        if (newBlockType) {
          setActiveBlockType(newBlockType);
        }
      }
    };

    window.addEventListener('keydown', handleNumberKeys);
    return () => {
      window.removeEventListener('keydown', handleNumberKeys);
    };
  }, []);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(...INITIAL_PLAYER_POSITION);
    camera.lookAt(playerPosition.current.x, playerPosition.current.y, playerPosition.current.z + 1);
  }, [camera]);

  // Handle pointer lock and mouse clicks
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!controls.current?.isLocked) {
        controls.current?.lock();
      } else {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(scene.children);

        if (intersects.length > 0) {
          const intersect = intersects[0];
          const clickedBlock = intersect.object;

          // Ensure it's a block (not player or other objects)
          // Simple check: blocks are typically positioned at integer coordinates
          const blockPos = clickedBlock.position;
          const isWorldBlock = worldBlocks.has(
            `${Math.round(blockPos.x)},${Math.round(blockPos.y)},${Math.round(blockPos.z)}`,
          );

          if (isWorldBlock) {
            const hitPoint = intersect.point;
            const normal = intersect.face?.normal;

            if (normal && blockPos) {
              const targetBlockPos: Position = [
                Math.round(blockPos.x),
                Math.round(blockPos.y),
                Math.round(blockPos.z),
              ];

              if (event.button === 0) { // Left click: destroy block
                removeBlock(targetBlockPos);
              } else if (event.button === 2) { // Right click: place block
                const newBlockPosition: Position = [
                  targetBlockPos[0] + normal.x * BLOCK_SIZE,
                  targetBlockPos[1] + normal.y * BLOCK_SIZE,
                  targetBlockPos[2] + normal.z * BLOCK_SIZE,
                ];

                // Prevent placing block inside player
                const playerBodyMin = new THREE.Vector3(
                  playerPosition.current.x - PLAYER_RADIUS,
                  playerPosition.current.y - PLAYER_HEIGHT / 2,
                  playerPosition.current.z - PLAYER_RADIUS,
                );
                const playerBodyMax = new THREE.Vector3(
                  playerPosition.current.x + PLAYER_RADIUS,
                  playerPosition.current.y + PLAYER_HEIGHT / 2,
                  playerPosition.current.z + PLAYER_RADIUS,
                );

                const newBlockMin = new THREE.Vector3(
                  newBlockPosition[0] - BLOCK_SIZE / 2,
                  newBlockPosition[1] - BLOCK_SIZE / 2,
                  newBlockPosition[2] - BLOCK_SIZE / 2,
                );
                const newBlockMax = new THREE.Vector3(
                  newBlockPosition[0] + BLOCK_SIZE / 2,
                  newBlockPosition[1] + BLOCK_SIZE / 2,
                  newBlockPosition[2] + BLOCK_SIZE / 2,
                );

                const overlapsPlayer =
                  playerBodyMax.x > newBlockMin.x &&
                  playerBodyMin.x < newBlockMax.x &&
                  playerBodyMax.y > newBlockMin.y &&
                  playerBodyMin.y < newBlockMax.y &&
                  playerBodyMax.z > newBlockMin.z &&
                  playerBodyMin.z < newBlockMax.z;

                if (!overlapsPlayer) {
                  addBlock(newBlockPosition, activeBlockType);
                }
              }
            }
          }
        }
      }
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent right-click context menu

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [camera, scene.children, gl.domElement, controls, worldBlocks, addBlock, removeBlock, activeBlockType]);

  useFrame((state, delta) => {
    if (!controls.current?.isLocked) return;

    // Apply gravity
    playerVelocity.current.y += GRAVITY * delta;
    if (playerVelocity.current.y < TERMINAL_VELOCITY) {
      playerVelocity.current.y = TERMINAL_VELOCITY;
    }

    // Reset movement vector
    movementVector.current.set(0, 0, 0);

    // Handle movement input
    if (keyboard.has('KeyW')) movementVector.current.z -= 1;
    if (keyboard.has('KeyS')) movementVector.current.z += 1;
    if (keyboard.has('KeyA')) movementVector.current.x -= 1;
    if (keyboard.has('KeyD')) movementVector.current.x += 1;

    // Normalize and apply speed
    if (movementVector.current.length() > 0) {
      movementVector.current.normalize().multiplyScalar(PLAYER_SPEED * delta);
      controls.current.moveRight(movementVector.current.x);
      controls.current.moveForward(movementVector.current.z);
    }

    // Update player position based on controls
    playerPosition.current.copy(controls.current.getObject().position);

    // Jumping
    if (keyboard.has('Space') && isGrounded.current) {
      playerVelocity.current.y = JUMP_VELOCITY;
      isGrounded.current = false;
    }

    // Apply vertical velocity
    playerPosition.current.y += playerVelocity.current.y * delta;

    // Collision detection (simplified)
    const newPlayerPos = playerPosition.current.clone();
    const collided = checkCollision(
      newPlayerPos,
      PLAYER_RADIUS,
      PLAYER_HEIGHT,
      worldBlocks,
    );

    isGrounded.current = false; // Assume not grounded unless collision is found below

    if (collided.length > 0) {
      for (const block of collided) {
        // Simple vertical collision: check if player is trying to move into a block from below/above
        // For a full game, this would involve separating axes
        const blockMinY = block.y - BLOCK_SIZE / 2;
        const blockMaxY = block.y + BLOCK_SIZE / 2;
        const playerMinY = playerPosition.current.y - PLAYER_HEIGHT / 2;
        const playerMaxY = playerPosition.current.y + PLAYER_HEIGHT / 2;

        if (playerVelocity.current.y < 0 && playerMinY < blockMaxY && playerMaxY > blockMaxY) {
          // Falling and hit block from above
          playerPosition.current.y = blockMaxY + PLAYER_HEIGHT / 2 + 0.001; // Rest on top
          playerVelocity.current.y = 0;
          isGrounded.current = true;
        } else if (playerVelocity.current.y > 0 && playerMaxY > blockMinY && playerMinY < blockMinY) {
          // Jumping and hit block from below
          playerPosition.current.y = blockMinY - PLAYER_HEIGHT / 2 - 0.001; // Stop at bottom
          playerVelocity.current.y = 0;
        }

        // Horizontal collision (very basic - just stop movement if collided)
        // More robust collision would push player out
        if (playerVelocity.current.x !== 0 || playerVelocity.current.z !== 0) {
          const prevPlayerPos = controls.current.getObject().position.clone().sub(movementVector.current);
          const prevCollided = checkCollision(prevPlayerPos, PLAYER_RADIUS, PLAYER_HEIGHT, worldBlocks);
          if (!prevCollided.length) {
            // If we were not collided before, but are now, then stop
            controls.current.getObject().position.copy(prevPlayerPos);
          }
        }
      }
    }

    // Update camera position to follow player
    camera.position.copy(playerPosition.current);
  });

  return (
    <>
      <PointerLockControls ref={controls} />
      {/* Optional: Add a visible mesh for the player for debugging or other interactions */}
      {/* <mesh position={playerPosition.current} visible={false}>
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT]} />
        <meshStandardMaterial color="red" />
      </mesh> */}
    </>
  );
};

export default Player;