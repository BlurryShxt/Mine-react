import { useState, useEffect, useCallback } from 'react';

const useKeyboardInput = () => {
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeysPressed((prevKeys) => new Set(prevKeys).add(event.code));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeysPressed((prevKeys) => {
      const newKeys = new Set(prevKeys);
      newKeys.delete(event.code);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return keysPressed;
};

export default useKeyboardInput;