// src/hooks/useSound.ts
import { useRef, useEffect } from 'react';

export function useSound(enabled: boolean) {
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled) {
      spinSoundRef.current = new Audio('/spin.mp3');
      winSoundRef.current = new Audio('/win.mp3');
      spinSoundRef.current.loop = true;

      return () => {
        spinSoundRef.current?.pause();
        winSoundRef.current?.pause();
      };
    }
  }, [enabled]);

  const playSpin = () => {
    if (enabled && spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(() => {});
    }
  };

  const stopSpin = () => {
    if (spinSoundRef.current) {
      spinSoundRef.current.pause();
    }
  };

  const playWin = () => {
    stopSpin();
    if (enabled && winSoundRef.current) {
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play().catch(() => {});
    }
  };

  return { playSpin, stopSpin, playWin };
}
