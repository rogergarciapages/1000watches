'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Slot from './Slot';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function Grid() {
  const [filledSlots, setFilledSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filledCount, setFilledCount] = useState(0);

  const fetchSlots = useCallback(async () => {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('status', 'filled')
      .order('id', { ascending: true });

    if (!error && data) {
      setFilledSlots(data);
      setFilledCount(data.length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlots();

    // Subscribe to realtime changes
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

  // Merge: start with 1000 empty, overlay filled slots
  const allSlots = Array.from({ length: 1000 }, (_, i) => {
    const slotId = i + 1;
    const filled = filledSlots.find(s => s.id === slotId);
    return filled ?? { id: slotId, status: 'empty', brand: null, model: null, year: null };
  });

  return (
    <div className="relative">
      {/* Live counter bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
            {filledCount} / 1,000 filled
          </span>
        </div>
        <div className="h-1 flex-1 mx-6 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${(filledCount / 1000) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-white/20">
          {(1000 - filledCount)} remaining
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-[repeat(12,minmax(0,1fr))] lg:grid-cols-[repeat(16,minmax(0,1fr))] xl:grid-cols-[repeat(20,minmax(0,1fr))] 2xl:grid-cols-[repeat(25,minmax(0,1fr))] gap-[2px] bg-black/40 p-1 rounded-xl border border-white/5 shadow-2xl">
        {allSlots.map((slot) => (
          <Slot
            key={slot.id}
            id={slot.id}
            brand={slot.brand}
            model={slot.model}
            year={slot.year}
            status={slot.status}
          />
        ))}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Loading Archive</span>
          </div>
        </div>
      )}
    </div>
  );
}
