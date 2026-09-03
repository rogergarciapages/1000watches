'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Slot from './Slot';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function Grid() {
  const [filledSlots, setFilledSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filledCount, setFilledCount] = useState(0);
  const [featuredPhotos, setFeaturedPhotos] = useState<Record<string, string>>({});

  const fetchSlots = useCallback(async () => {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('status', 'filled')
      .order('id', { ascending: true });

    if (!error && data) {
      setFilledSlots(data);
      setFilledCount(data.length);

      const uuids = data.map(s => s.uuid).filter(Boolean);
      if (uuids.length) {
        const { data: photos } = await supabase
          .from('watch_photos')
          .select('watch_id, image_url')
          .in('watch_id', uuids)
          .eq('is_default', true);

        if (photos) {
          const map: Record<string, string> = {}
          photos.forEach(p => { map[p.watch_id] = p.image_url })
          setFeaturedPhotos(map)
        }
      }
    }
    setLoading(false)
  }, []);

  useEffect(() => {
    fetchSlots();

    const channel = supabase
      .channel('slots-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots' }, () => {
        fetchSlots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSlots]);

  const allSlots = Array.from({ length: 1000 }, (_, i) => {
    const slotId = i + 1;
    const filled = filledSlots.find(s => s.id === slotId);
    const slot = filled ?? { id: slotId, status: 'empty', brand: null, model: null, year: null };
    if (filled && filled.uuid) {
      slot.featuredImage = featuredPhotos[filled.uuid] ?? null;
    }
    return slot;
  });

  return (
    <div className="relative">
      {/* Live counter bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
            {filledCount} / 1,000 filled
          </span>
        </div>
        <div className="h-1 flex-1 mx-6 rounded-full bg-[var(--border-subtle)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${(filledCount / 1000) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-[var(--text-dim)]">
          {(1000 - filledCount)} remaining
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-[repeat(12,minmax(0,1fr))] lg:grid-cols-[repeat(16,minmax(0,1fr))] xl:grid-cols-[repeat(20,minmax(0,1fr))] 2xl:grid-cols-[repeat(25,minmax(0,1fr))] gap-[2px] bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-2xl transition-colors duration-300">
        {allSlots.map((slot) => (
          <Slot
            key={slot.id}
            id={slot.id}
            brand={slot.brand}
            model={slot.model}
            year={slot.year}
            status={slot.status}
            featuredImage={slot.featuredImage ?? undefined}
          />
        ))}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--glass-bg)] backdrop-blur-sm rounded-xl transition-colors duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-sans">Loading Archive</span>
          </div>
        </div>
      )}
    </div>
  );
}
