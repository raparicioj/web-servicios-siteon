'use client';

import React from 'react';

interface SiteOnLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
}

export function SiteOnLogo({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Soporte TI, Redes & Soluciones • Chile',
}: SiteOnLogoProps) {
  const iconDimensions =
    size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const titleSize =
    size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-lg';

  return (
    <div className="inline-flex items-center gap-3 select-none group">
      {/* Isotipo Vectorial Oficial Site On (Grilla 3D en perspectiva + anillo orbital en Calipso Claro) */}
      <div
        className={`relative ${iconDimensions} shrink-0 flex items-center justify-center rounded-2xl bg-[#0a2233]/90 border border-[#5eead4]/35 shadow-[0_0_24px_rgba(94,234,212,0.22)] transition-transform duration-300 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 120 110"
          className="w-[86%] h-[86%] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="siteonRingGrad" x1="10" y1="60" x2="112" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="siteonTileTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="siteonTileMid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="siteonTileBot" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Anillo Orbital / Swoosh Corporativo Site On */}
          <path
            d="M36 44 C 12 54, 8 78, 32 90 C 58 102, 98 94, 110 74 C 115 64, 108 53, 95 47 C 104 54, 107 64, 101 73 C 90 88, 56 93, 35 82 C 18 73, 20 55, 36 44 Z"
            fill="url(#siteonRingGrad)"
          />

          {/* Grilla de Cubos en Perspectiva Isométrica (Símbolo Site On) */}
          <g transform="rotate(-19 62 46)">
            {/* Fila Superior */}
            <rect
              x="29"
              y="18"
              width="13"
              height="13"
              rx="3.2"
              fill="url(#siteonTileTop)"
            />
            <rect
              x="47"
              y="15"
              width="16"
              height="15"
              rx="3.5"
              fill="url(#siteonTileTop)"
            />
            <rect
              x="68"
              y="15"
              width="19"
              height="17"
              rx="4"
              fill="url(#siteonTileTop)"
            />

            {/* Fila Central (con el nodo blanco luminoso característico de Site On) */}
            <rect
              x="44"
              y="34"
              width="17"
              height="17"
              rx="4"
              fill="#f0fdfa"
              stroke="#5eead4"
              strokeWidth="1.2"
            />
            <rect
              x="66"
              y="36"
              width="20"
              height="18"
              rx="4.2"
              fill="url(#siteonTileMid)"
            />

            {/* Fila Inferior */}
            <rect
              x="41"
              y="55"
              width="18"
              height="18"
              rx="4.2"
              fill="url(#siteonTileBot)"
            />
            <rect
              x="63"
              y="58"
              width="20"
              height="19"
              rx="4.5"
              fill="url(#siteonTileBot)"
            />
          </g>
        </svg>
      </div>

      {/* Logotipo Tipográfico Limpio y Nítido */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display ${titleSize} font-extrabold tracking-tight text-white`}
          >
            SITE ON
          </span>
          <span
            className={`font-display ${titleSize} font-extrabold tracking-tight text-[#5eead4]`}
          >
            TECNOLOGÍA
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-teal-100/80 mt-1">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}

