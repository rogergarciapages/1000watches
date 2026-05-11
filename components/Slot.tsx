'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface SlotTooltipProps {
  brand: string;
  model: string;
  year: number;
}

function SlotTooltip({ brand, model, year }: SlotTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none
      bg-[#111] border border-amber-500/30 rounded-lg p-3 shadow-2xl min-w-[140px] text-center
      animate-fade-in whitespace-nowrap">
      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{brand}</p>
      <p className="text-xs text-white/80 mt-0.5">{model}</p>
      <p className="text-[10px] text-white/40 mt-0.5">{year}</p>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500/30" />
    </div>
  );
}

interface SlotProps {
  id: number;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  status: 'empty' | 'filled';
}

export default function Slot({ id, brand, model, year, status }: SlotProps) {
  const [hovered, setHovered] = useState(false);
  const isEmpty = status === 'empty';

  return (
    <div
      className={`relative aspect-square flex flex-col items-center justify-center transition-all duration-300 group cursor-default
        ${isEmpty
          ? 'border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/20'
          : 'border border-amber-500/25 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] hover:border-amber-500/50'
        }
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Slot Number */}
      <span className="absolute top-[2px] left-[3px] text-[7px] font-mono opacity-20 group-hover:opacity-50 transition-opacity leading-none">
        {String(id).padStart(4, '0')}
      </span>

      {/* Tooltip for filled slots */}
      {!isEmpty && hovered && brand && model && year && (
        <SlotTooltip brand={brand} model={model} year={year} />
      )}

      {isEmpty ? (
        <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-amber-500/30 transition-colors" />
      ) : (
        <div className="text-center px-1 overflow-hidden w-full">
          <p className="text-[8px] font-bold text-amber-400 uppercase tracking-tighter truncate leading-tight">
            {brand}
          </p>
          <p className="text-[7px] text-white/60 truncate leading-tight">
            {model}
          </p>
        </div>
      )}

      {/* Corner accents for filled slots */}
      {!isEmpty && (
        <>
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-500/30 group-hover:border-amber-500/60 transition-colors" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-500/30 group-hover:border-amber-500/60 transition-colors" />
        </>
      )}
    </div>
  );
}
