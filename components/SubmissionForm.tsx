'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const FIELD_CLASS = `
  w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)]
  placeholder:text-[var(--text-dim)] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40
  transition-all duration-200 appearance-none
`.trim();

const SELECT_CLASS = `
  w-full bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)]
  focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40
  transition-all duration-200 appearance-none cursor-pointer
`.trim();

const LABEL_CLASS = "block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-medium font-sans";

type FormData = {
  brand: string;
  model: string;
  year: string;
  material: string;
  movement_type: string;
};

export default function SubmissionForm() {
  const [form, setForm] = useState<FormData>({ brand: '', model: '', year: '', material: '', movement_type: '' });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image must be less than 5MB');
        setStatus('error');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `submissions/${fileName}`

      const { data, error } = await supabase.storage
        .from('watch-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        setErrorMsg('Failed to upload image. Please try again.')
        return null
      }

      const { data: urlData } = supabase.storage
        .from('watch-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      setErrorMsg('Failed to upload image. Please try again.')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    setErrorMsg('');

    const year = parseInt(form.year);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
      setErrorMsg('Please enter a valid year.');
      setStatus('error');
      setSubmitting(false);
      return;
    }

    try {
      let imageUrl: string | null = null;

      if (image) {
        setUploading(true);
        imageUrl = await uploadImage(image);
        setUploading(false);
      }

      const { error } = await supabase.from('submissions').insert([
        {
          brand: form.brand.trim(),
          model: form.model.trim(),
          year,
          material: form.material.trim() || null,
          movement_type: form.movement_type || null,
          image_url: imageUrl
        }
      ]);

      if (error) {
        console.error('Submission error details:', JSON.stringify(error));
        throw new Error(error.message || 'Failed to submit');
      }

      setStatus('success');
      setForm({ brand: '', model: '', year: '', material: '', movement_type: '' });
      removeImage();
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err: any) {
      console.error('Submission error:', err);
      const errorMessage = err?.message || 'Something went wrong. Please try again.';
      setErrorMsg(errorMessage);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl transition-colors duration-300">
      {/* Header */}
      <div className="mb-7">
        <h3 className="text-2xl font-serif font-light text-[var(--text-primary)] tracking-tight">Nominate a Piece</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">No account required. Submissions are reviewed by our curators.</p>
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

        {/* Year & Material Row */}
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className={LABEL_CLASS}>Material</label>
            <input
              id="submission-material"
              placeholder="e.g. Steel, Gold, Titanium"
              className={FIELD_CLASS}
              value={form.material}
              onChange={handleChange('material')}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Movement Type */}
        <div>
          <label className={LABEL_CLASS}>Movement Type</label>
          <select
            id="submission-movement"
            className={SELECT_CLASS}
            value={form.movement_type}
            onChange={handleChange('movement_type')}
          >
            <option value="" className="text-[var(--text-dim)]">Select movement type</option>
            <option value="automatic" className="text-[var(--text-primary)] bg-[var(--bg-card)]">Automatic</option>
            <option value="quartz" className="text-[var(--text-primary)] bg-[var(--bg-card)]">Quartz</option>
            <option value="manual" className="text-[var(--text-primary)] bg-[var(--bg-card)]">Manual</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className={LABEL_CLASS}>Watch Photo</label>
          <div className="relative">
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-[var(--border-medium)]">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border border-dashed border-[var(--border-medium)] bg-[var(--bg-primary)] cursor-pointer hover:border-amber-500/50 transition-all">
                <svg className="w-8 h-8 text-[var(--text-muted)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-[var(--text-muted)] font-sans">Click to upload photo</span>
                <span className="text-[10px] text-[var(--text-dim)] mt-1 font-sans">PNG, JPG up to 5MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          id="submission-submit"
          type="submit"
          disabled={submitting || uploading}
          className={`w-full py-4 mt-2 rounded-xl bg-amber-600 text-black font-bold text-xs uppercase tracking-[0.2em]
            transition-all transform hover:bg-amber-500 active:scale-[0.98] shadow-lg shadow-amber-600/10
            disabled:opacity-40 disabled:cursor-not-allowed font-sans`}
        >
          {submitting || uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
              {uploading ? 'Uploading Image...' : 'Processing...'}
            </span>
          ) : 'Submit Nomination'}
        </button>

        {/* Status messages */}
        {status === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <p className="text-xs text-green-500 font-sans">
              Nomination received. Our curators will review your submission.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <p className="text-xs text-red-500 font-sans">{errorMsg}</p>
          </div>
        )}
      </form>
    </div>
  );
}
