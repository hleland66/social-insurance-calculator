// src/hooks/useSpinner.ts
import { useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { Option } from '@/types';
import { calculateArcs, getRandomByWeight, calculateTargetAngle, canStartPlay } from '@/lib/spinner';

export function useSpinner(options: Option[]) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);  // 暴露 rotation 状态
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  const spin = useCallback(async () => {
    if (!canStartPlay(options) || isSpinning) return null;

    setIsSpinning(true);
    const result = getRandomByWeight(options);
    const targetRotation = calculateTargetAngle(result, options);

    return new Promise<Option>((resolve) => {
      gsap.to(rotationRef, {
        current: targetRotation,
        duration: 4,
        ease: 'power2.out',
        onUpdate: () => {
          // 更新 rotation 状态，触发 SpinnerCanvas 重绘
          setRotation(rotationRef.current);
        },
        onComplete: () => {
          setIsSpinning(false);
          setLastResult(result.name);
          resolve(result);
        }
      });
    });
  }, [options, isSpinning]);

  return {
    isSpinning,
    lastResult,
    rotation,  // 返回 rotation 状态
    canvasRef,
    spin,
    canStartPlay: canStartPlay(options)
  };
}
