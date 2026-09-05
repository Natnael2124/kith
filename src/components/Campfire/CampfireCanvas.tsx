import React, { useEffect, useRef } from 'react';

interface CampfireCanvasProps {
  campfireLevel: number; // 0 to 100
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

export const CampfireCanvas: React.FC<CampfireCanvasProps> = ({ campfireLevel, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];

    // Set canvas resolution
    const width = 360;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const baseColors = [
      'rgba(245, 158, 11, ', // Amber
      'rgba(249, 115, 22, ', // Orange
      'rgba(239, 68, 68, ',  // Red
      'rgba(252, 211, 77, ', // Light yellow
    ];

    const spawnParticle = (extraBurst = false) => {
      // Fire intensity scaled by campfireLevel
      const intensity = Math.max(0.1, campfireLevel / 100);
      const spawnX = width / 2 + (Math.random() - 0.5) * (50 * intensity + 20);
      const spawnY = height - 55;

      const maxLife = (extraBurst ? 70 : 40) + Math.random() * 30 * intensity;
      const vy = -(1.5 + Math.random() * 2.5 * intensity) * (extraBurst ? 1.6 : 1);
      const vx = (Math.random() - 0.5) * 1.5;
      const size = (3 + Math.random() * 6 * intensity) * (extraBurst ? 1.4 : 1);
      const color = baseColors[Math.floor(Math.random() * baseColors.length)];

      particles.push({
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        size,
        alpha: 0.9,
        color,
        life: 0,
        maxLife,
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const intensity = Math.max(0.05, campfireLevel / 100);

      // 1. Draw Hearth stones & Ground Glow
      const glowRadius = 50 + intensity * 90;
      const gradient = ctx.createRadialGradient(
        width / 2,
        height - 50,
        10,
        width / 2,
        height - 50,
        glowRadius
      );
      gradient.addColorStop(0, `rgba(245, 158, 11, ${0.35 * intensity})`);
      gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.15 * intensity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height - 50, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Firewood Logs
      ctx.save();
      // Left log
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(width / 2 - 28, height - 42, 36, 9, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Right log
      ctx.fillStyle = '#3e1804';
      ctx.beginPath();
      ctx.ellipse(width / 2 + 28, height - 42, 36, 9, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      // Center cross log
      ctx.fillStyle = '#291104';
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 38, 42, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a2509';
      ctx.stroke();
      ctx.restore();

      // 3. Spawn flame particles if fire is burning
      if (campfireLevel > 0) {
        const spawnCount = Math.floor(intensity * 4) + 1;
        for (let i = 0; i < spawnCount; i++) {
          spawnParticle();
        }
      }

      // 4. Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx + (Math.random() - 0.5) * 0.4;
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        p.size = Math.max(0.5, p.size * 0.98);

        if (p.life >= p.maxLife || p.y < 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra outer glow on larger particles
        if (p.size > 4 && intensity > 0.4) {
          ctx.beginPath();
          ctx.fillStyle = `${p.color}${p.alpha * 0.3})`;
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw inner ember heart
      if (campfireLevel > 5) {
        const innerGlow = ctx.createRadialGradient(
          width / 2,
          height - 52,
          2,
          width / 2,
          height - 52,
          22 * intensity + 4
        );
        innerGlow.addColorStop(0, `rgba(254, 240, 138, ${0.9 * intensity})`);
        innerGlow.addColorStop(0.6, `rgba(249, 115, 22, ${0.7 * intensity})`);
        innerGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(width / 2, height - 52, 22 * intensity + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Click canvas to sprinkle extra sparks
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 3 + Math.random() * 4,
          alpha: 1,
          color: baseColors[Math.floor(Math.random() * baseColors.length)],
          life: 0,
          maxLife: 45 + Math.random() * 25,
        });
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [campfireLevel]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="cursor-pointer transition-transform duration-300 hover:scale-[1.02] filter drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]"
        title="The Sacred Hearth (Click to stir sparks)"
      />
    </div>
  );
};
