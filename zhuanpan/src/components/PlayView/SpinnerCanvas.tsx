// src/components/PlayView/SpinnerCanvas.tsx
import { useEffect, useRef } from 'react';
import type { Option } from '@/types';
import { calculateArcs } from '@/lib/spinner';

interface SpinnerCanvasProps {
  options: Option[];
  rotation: number;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

export function SpinnerCanvas({ options, rotation, onCanvasRef }: SpinnerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    onCanvasRef(canvasRef.current);
  }, [onCanvasRef]);

  // 使用 JSON.stringify 来稳定 options 依赖
  const optionsKey = JSON.stringify(options.map(o => ({ id: o.id, name: o.name, weight: o.weight, color: o.color })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 大小（支持 Retina）
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth * 0.8, 400);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const segments = calculateArcs(options);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // 清除画布
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // 绘制扇形
    segments.forEach(seg => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius,
        (seg.startAngle * Math.PI) / 180,
        (seg.endAngle * Math.PI) / 180
      );
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制文字
      ctx.save();
      ctx.rotate((seg.midAngle * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(seg.name, radius * 0.65, 0);
      ctx.restore();
    });

    ctx.restore();

    // 绘制指针（固定在顶部）
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 10, 35);
    ctx.lineTo(centerX + 10, 35);
    ctx.closePath();
    ctx.fillStyle = '#2D3436';
    ctx.fill();

  }, [optionsKey, rotation]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <canvas
        ref={canvasRef}
        style={{ borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      />
    </div>
  );
}
