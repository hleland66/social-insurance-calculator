// src/lib/spinner.ts
import type { Option, Segment } from '@/types';

export function calculateArcs(options: Option[]): Segment[] {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let accumulatedAngle = 0;

  return options.map(opt => {
    const arcSize = (opt.weight / totalWeight) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + arcSize;
    const midAngle = startAngle + arcSize / 2;

    accumulatedAngle = endAngle;

    return {
      id: opt.id,
      name: opt.name,
      color: opt.color,
      startAngle,
      endAngle,
      midAngle
    };
  });
}

export function getRandomByWeight(options: Option[]): Option {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let random = Math.random() * totalWeight;
  for (const opt of options) {
    random -= opt.weight;
    if (random <= 0) return opt;
  }
  return options[0];
}

export function calculateTargetAngle(result: Option, options: Option[]): number {
  const arcs = calculateArcs(options);
  const resultArc = arcs.find(a => a.id === result.id);
  if (!resultArc) return 0;

  const midAngle = resultArc.midAngle;
  // 指针固定在顶部（-90度），多转5圈
  return 360 * 5 + (360 - midAngle - 90);
}

export function canStartPlay(options: Option[]): boolean {
  return options.length >= 2 &&
         options.every(o => o.name.trim() !== '' && o.weight > 0);
}
