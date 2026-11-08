'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tier: 'hub' | 'medium' | 'satellite';
  fillColor: string;
  strokeColor: string;
  pulsePhase: number;
}

export function NetworkGraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname() || '/';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width * 0.55,
      y: height * 0.42,
      active: false,
    };

    const createNodes = (w: number, h: number): GraphNode[] => {
      const isMobile = w < 768;
      const totalCount = isMobile ? 52 : 98;
      const list: GraphNode[] = [];

      for (let i = 0; i < totalCount; i++) {
        // Distribución orgánica con mayor densidad en clusters pero cubriendo toda la pantalla
        let x = Math.random() * w;
        let y = Math.random() * h;

        // 45% de los nodos gravitan suavemente hacia dos núcleos principales como en la imagen de referencia
        if (i < totalCount * 0.35) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * Math.min(w, h) * 0.34;
          x = w * 0.46 + Math.cos(angle) * dist * 1.25;
          y = h * 0.46 + Math.sin(angle) * dist * 0.95;
        } else if (i < totalCount * 0.52) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * Math.min(w, h) * 0.22;
          x = w * 0.8 + Math.cos(angle) * dist;
          y = h * 0.5 + Math.sin(angle) * dist;
        }

        let tier: 'hub' | 'medium' | 'satellite' = 'satellite';
        let radius = 2.2 + Math.random() * 2.2;
        let fillColor = 'rgba(45, 212, 191, 0.75)'; // #2dd4bf Calipso
        let strokeColor = 'rgba(13, 38, 56, 0.9)';

        if (i < 9) {
          // Nodos centrales grandes (Hubs) en blanco / hielo calipso como en la imagen de referencia
          tier = 'hub';
          radius = isMobile ? 8 + Math.random() * 4 : 10 + Math.random() * 5.5;
          fillColor = i < 4 ? 'rgba(240, 253, 250, 0.92)' : 'rgba(153, 246, 228, 0.88)';
          strokeColor = 'rgba(15, 118, 110, 0.95)';
        } else if (i < 34) {
          // Nodos medianos en calipso claro y celeste agua
          tier = 'medium';
          radius = isMobile ? 4.5 + Math.random() * 2.5 : 5.5 + Math.random() * 3.5;
          fillColor =
            i % 2 === 0
              ? 'rgba(94, 234, 212, 0.82)' // #5eead4
              : 'rgba(103, 232, 249, 0.80)'; // #67e8f9
          strokeColor = 'rgba(13, 48, 68, 0.95)';
        } else {
          // Nodos satélite periféricos
          tier = 'satellite';
          radius = 2 + Math.random() * 2.4;
          fillColor =
            i % 3 === 0
              ? 'rgba(34, 211, 238, 0.72)'
              : 'rgba(20, 184, 166, 0.72)';
          strokeColor = 'rgba(9, 30, 46, 0.85)';
        }

        const speed = tier === 'hub' ? 0.18 : tier === 'medium' ? 0.28 : 0.42;
        list.push({
          x,
          y,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius,
          tier,
          fillColor,
          strokeColor,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      return list;
    };

    let nodes = createNodes(width, height);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      nodes = createNodes(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const maxLinkDist = width < 768 ? 150 : 215;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Actualizar posiciones de los nodos con movimiento fluido continuo
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulsePhase += 0.015;

        // Rebote suave en los bordes con margen
        if (n.x < -30) n.x = width + 30;
        if (n.x > width + 30) n.x = -30;
        if (n.y < -30) n.y = height + 30;
        if (n.y > height + 30) n.y = -30;

        // Interacción sutil con el puntero del mouse
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220 && dist > 1) {
            n.x += (dx / dist) * 0.18;
            n.y += (dy / dist) * 0.18;
          }
        }
      }

      // 2. Dibujar aristas / conexiones del grafo (más gruesas entre nodos Hub como en la referencia)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          const limit =
            a.tier === 'hub' && b.tier === 'hub'
              ? maxLinkDist * 1.45
              : a.tier === 'hub' || b.tier === 'hub'
                ? maxLinkDist * 1.15
                : maxLinkDist;

          if (distSq < limit * limit) {
            const dist = Math.sqrt(distSq);
            const ratio = 1 - dist / limit;

            if (a.tier === 'hub' && b.tier === 'hub') {
              // Conexiones troncales principales más marcadas (igual que en el centro de tu imagen)
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(153, 246, 228, ${ratio * 0.42})`;
              ctx.lineWidth = 2.2 * ratio + 0.6;
              ctx.stroke();
            } else if (a.tier === 'hub' || b.tier === 'hub') {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(94, 234, 212, ${ratio * 0.28})`;
              ctx.lineWidth = 1.3 * ratio + 0.3;
              ctx.stroke();
            } else {
              // Red fina de fondo calipso
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(45, 212, 191, ${ratio * 0.17})`;
              ctx.lineWidth = 0.85;
              ctx.stroke();
            }
          }
        }
      }

      // 3. Dibujar los nodos circulares con borde definido (exactamente el estilo visual del grafo de referencia)
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const pulseRadius =
          n.tier === 'hub'
            ? n.radius + Math.sin(n.pulsePhase) * 0.9
            : n.radius;

        // Halo luminoso suave para los nodos principales (Hubs)
        if (n.tier === 'hub') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, pulseRadius * 2.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(94, 234, 212, 0.11)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = n.fillColor;
        ctx.fill();
        ctx.lineWidth = n.tier === 'hub' ? 2 : 1.2;
        ctx.strokeStyle = n.strokeColor;
        ctx.stroke();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Gradiente base Calipso Oceánico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(20,66,94,0.85)_0%,rgba(13,38,56,0.96)_70%,#0a1e2e_100%)]" />
      {/* Lienzo de Grafos en Movimiento */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-90"
      />
      {/* Velo sutil para garantizar legibilidad perfecta de los textos blancos */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d2638]/25 via-transparent to-[#0d2638]/55" />
    </div>
  );
}

