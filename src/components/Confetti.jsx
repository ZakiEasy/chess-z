import { useEffect, useMemo, useState } from 'react';

const ITEMS = ['🎉', '⭐', '✨', '🎊', '♟️', '👑'];

export default function Confetti() {
  const [on, setOn] = useState(true);
  const bits = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({
      left: Math.random() * 100, delay: Math.random() * 0.8,
      dur: 2 + Math.random() * 1.5, ch: ITEMS[i % ITEMS.length],
    })), []);
  useEffect(() => {
    const id = setTimeout(() => setOn(false), 4500);
    return () => clearTimeout(id);
  }, []);
  if (!on) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>{b.ch}</span>
      ))}
    </div>
  );
}
