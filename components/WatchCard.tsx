import React from 'react';
import Link from 'next/link';
import { WatchItem } from '@/lib/watch-queries';
import VoteButton from '@/components/VoteButton';

interface WatchCardProps {
  watch: WatchItem;
  rank?: number;
}

export default function WatchCard({ watch, rank }: WatchCardProps) {
  const title = [
    watch.year,
    watch.brand,
    watch.line,
    watch.model,
    watch.nickname ? `"${watch.nickname}"` : '',
    watch.model_number || ''
  ].filter(Boolean).join(' ');

  const isTop1000 = rank ? rank <= 1000 : watch.isFilledSlot;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border border-[var(--border-medium)] bg-[var(--bg-card)] hover:border-amber-500/40 transition-all duration-300 shadow-sm hover:shadow-xl">
      {/* Rank Badge */}
      {rank !== undefined && (
        <div className="absolute top-3 left-3 z-10">
          {isTop1000 ? (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/90 text-black font-mono font-bold text-[10px] tracking-wider shadow-md backdrop-blur-sm">
              #{rank}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-black/60 border border-[var(--border-medium)] text-[var(--text-muted)] font-mono text-[10px] tracking-wider backdrop-blur-sm">
              #{rank} Contender
            </span>
          )}
        </div>
      )}

      {/* Image Container */}
      <Link href={`/timepieces/${watch.slug}`} className="block relative aspect-square bg-[var(--bg-secondary)] overflow-hidden">
        {watch.image_url ? (
          <img
            src={watch.image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full border border-[var(--border-medium)] flex items-center justify-center mb-3">
              <span className="text-xl font-serif text-[var(--text-muted)]">{watch.brand.charAt(0)}</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-mono">No Image</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-xs text-amber-400 font-medium uppercase tracking-wider font-sans">
            View Timepiece →
          </span>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Taxonomy Links */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px] uppercase tracking-wider font-sans">
            <Link
              href={`/brands/${watch.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="text-amber-500 hover:underline font-semibold"
            >
              {watch.brand}
            </Link>
            {watch.line && (
              <>
                <span className="text-[var(--text-dim)]">•</span>
                <Link
                  href={`/lines/${watch.line.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="text-[var(--text-muted)] hover:text-amber-500 transition-colors"
                >
                  {watch.line}
                </Link>
              </>
            )}
            <span className="text-[var(--text-dim)]">•</span>
            <Link
              href={`/years/${watch.year}`}
              className="text-[var(--text-dim)] hover:text-amber-500 transition-colors font-mono"
            >
              {watch.year}
            </Link>
          </div>

          {/* Model & Nickname */}
          <Link href={`/timepieces/${watch.slug}`} className="block group-hover:text-amber-500 transition-colors">
            <h3 className="text-lg font-serif font-light text-[var(--text-primary)] group-hover:text-amber-500 transition-colors leading-snug">
              {watch.model}
            </h3>
          </Link>

          {watch.nickname && (
            <Link
              href={`/nicknames/${watch.nickname.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="inline-block text-xs font-serif italic text-amber-400/90 hover:underline mt-0.5"
            >
              "{watch.nickname}"
            </Link>
          )}

          {watch.model_number && (
            <p className="text-[11px] font-mono text-[var(--text-dim)] mt-1 tracking-wider">
              Ref. {watch.model_number}
            </p>
          )}
        </div>

        {/* Footer: Vote Button */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-mono">
            {watch.movement_type || watch.material || 'Horology'}
          </span>
          {watch.uuid && (
            <VoteButton
              submissionId={watch.uuid}
              initialVotes={watch.votes || 0}
              size="sm"
              table={watch.isFilledSlot ? 'slots' : 'submissions'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
