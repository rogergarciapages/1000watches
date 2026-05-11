'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const FIELD_CLASS = `
  w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white
  placeholder:text-white/20 focus:outline-none focus:border-amber-500/60 focus:bg-white/[0.05]
  transition-all duration-200 appearance-none
`.trim();

const LABEL_CLASS = "block text-[10px] uppercase tracking-widest text-white/35 mb-2 font-medium";

export default function SubmissionForm() {
  const [form, setForm] = useState({ brand: '', model: '', year: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');

    const year = parseInt(form.year);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
      setErrorMsg('Please enter a valid year.');
      setStatus('error');
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('submissions').insert([
        { brand: form.brand.trim(), model: form.model.trim(), year }
      ]);

      if (error) throw error;

      setStatus('success');
      setForm({ brand: '', model: '', year: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl">
      {/* Header */}
      <div className="mb-7">
        <h3 className="text-xl font-display font-light text-white tracking-tight">Nominate a Piece</h3>
        <p className="text-xs text-white/30 mt-1">No account required. Submissions are reviewed by our curators.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Brand */}
        <div>
          <label className={LABEL_CLASS}>Manufacturer / Brand</label>
          <input
            id="submission-brand"
            required
            placeholder="e.g. Patek Philippe"
            className={FIELD_CLASS}
            value={form.brand}
            onChange={handleChange('brand')}
            autoComplete="off"
          />
        </div>

        {/* Model */}
        <div>
          <label className={LABEL_CLASS}>Reference / Model Name</label>
          <input
            id="submission-model"
            required
            placeholder="e.g. Nautilus 5711"
            className={FIELD_CLASS}
            value={form.model}
            onChange={handleChange('model')}
            autoComplete="off"
          />
        </div>

        {/* Year */}
        <div>
          <label className={LABEL_CLASS}>Original Release Year</label>
          <input
            id="submission-year"
            required
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            placeholder="e.g. 1976"
            className={FIELD_CLASS}
            value={form.year}
            onChange={handleChange('year')}
          />
        </div>

        {/* Submit */}
        <button
          id="submission-submit"
          type="submit"
          disabled={submitting}
          className={`w-full py-4 mt-2 rounded-xl bg-amber-600 text-black font-bold text-xs uppercase tracking-[0.2em]
            transition-all transform hover:bg-amber-500 active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
              Processing...
            </span>
          ) : 'Submit Nomination'}
        </button>

        {/* Status messages */}
        {status === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <p className="text-xs text-green-400">
              Nomination received. Our curators will review your submission.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}
      </form>
    </div>
  );
}
