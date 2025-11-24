import React from 'react';
import { BlockType } from '../types';
import { BLOCK_COLORS } from '../constants';

interface HudProps {
  activeBlockType: BlockType;
}

const Hud: React.FC<HudProps> = ({ activeBlockType }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between items-center pointer-events-none text-white text-shadow-md">
      {/* Top Left Instructions */}
      <div className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 rounded-lg text-sm text-left">
        <p><span className="font-bold">Controls:</span></p>
        <p>W, A, S, D - Move</p>
        <p>Space - Jump</p>
        <p>Left Click - Destroy Block</p>
        <p>Right Click - Place Block</p>
        <p>1-6 - Select Block</p>
        <p>Click to Lock/Unlock Pointer</p>
      </div>

      {/* Crosshair */}
      <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center -translate-y-1/2">
        <div className="w-1 h-1 bg-white rounded-full"></div>
      </div>

      {/* Bottom Center - Selected Block */}
      <div className="absolute bottom-4 p-4 bg-black bg-opacity-70 rounded-lg flex items-center space-x-2">
        <span className="text-lg">Selected:</span>
        <div
          className="w-8 h-8 rounded-md border-2 border-white flex items-center justify-center"
          style={{ backgroundColor: BLOCK_COLORS[activeBlockType] }}
        >
          {/* You could add a small icon or initial here */}
        </div>
        <span className="text-lg font-bold">{activeBlockType}</span>
      </div>
    </div>
  );
};

export default Hud;