'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SlotTooltipProps {
  brand: string;
  model: string;
  year: number;
}

function SlotTooltip({ brand, model, year }: SlotTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none
      bg-[var(--bg-elevated)] border border-amber-500/40 rounded-lg p-3 shadow-2xl min-w-[140px] text-center
      animate-fade-in whitespace-nowrap">
      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider font-sans">{brand}</p>
      <p className="text-xs text-[var(--text-primary)] mt-0.5 font-serif italic">{model}</p>
      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-sans">{year}</p>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500/40" />
    </div>
  );
}

function createSlug(brand: string, model: string): string {
  const slugBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slugModel = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slugBrand}/${slugModel}`;
}

interface SlotProps {
  id: number;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  status: 'empty' | 'filled';
  featuredImage?: string;
}

export default function Slot({ id, brand, model, year, status, featuredImage }: SlotProps) {
  const [hovered, setHovered] = useState(false);
  const isEmpty = status === 'empty';

  const watchLink = !isEmpty && brand && model 
    ? `/timepieces/${createSlug(brand, model)}` 
    : null;

  const content = (
    <>
      {/* Slot Number */}
      <span className="absolute top-[2px] left-[3px] text-[7px] font-mono text-[var(--text-dim)] opacity-40 group-hover:opacity-80 transition-opacity leading-none">
        {String(id).padStart(4, '0')}
      </span>

      {/* Tooltip for filled slots */}
      {!isEmpty && hovered && brand && model && year && (
        <SlotTooltip brand={brand} model={model} year={year} />
      )}

      {isEmpty ? (
        <div className="w-1 h-1 rounded-full bg-[var(--border-medium)] group-hover:bg-amber-500/60 transition-colors" />
      ) : featuredImage ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded">
          <img
            src={featuredImage}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-1 left-0 right-0 text-center px-0.5">
            <p className="text-[7px] font-bold text-white truncate leading-tight font-sans">{brand}</p>
          </div>
        </div>
      ) : (
        <div className="text-center px-1 overflow-hidden w-full">
          <p className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter truncate leading-tight font-sans">
            {brand}
          </p>
          <p className="text-[7px] text-[var(--text-secondary)] truncate leading-tight font-serif italic">
            {model}
          </p>
        </div>
      )}

      {/* Corner accents for filled slots */}
      {!isEmpty && (
        <>
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-500/40 group-hover:border-amber-500 transition-colors" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-500/40 group-hover:border-amber-500 transition-colors" />
        </>
      )}
    </>
  );

  if (isEmpty || !watchLink) {
    return (
      <div
        className={`relative aspect-square flex flex-col items-center justify-center transition-all duration-300 group cursor-default
          ${isEmpty
            ? 'border border-[var(--border-subtle)] bg-[var(--bg-card)]/40 hover:bg-amber-500/[0.04] hover:border-amber-500/30'
            : 'border border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] hover:border-amber-500/60'
          }
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={watchLink}
      className="relative aspect-square flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer
        border border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] hover:border-amber-500/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </Link>
  );
}
