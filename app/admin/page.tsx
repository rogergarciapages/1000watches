import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import SubmissionsQueue from '@/components/admin/SubmissionsQueue'
import SlotsManager from '@/components/admin/SlotsManager'
import AdminLogout from '@/components/admin/AdminLogout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Panel — 1,000 Watches',
  robots: 'noindex, nofollow',
}

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (session !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login')
  }
}

export default async function AdminPage() {
  await checkAuth()

  const supabase = await createAdminClient()

  const [
    { data: submissions },
    { data: filledSlots },
    { count: totalFilled },
    { count: totalSubmissions },
  ] = await Promise.all([
    supabase.from('submissions').select('*').order('created_at', { ascending: false }),
    supabase.from('slots').select('*').eq('status', 'filled').order('id', { ascending: true }),
    supabase.from('slots').select('*', { count: 'exact', head: true }).eq('status', 'filled'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
  ])

  // Fetch featured photos for filled slots
  let slotPhotos: Record<string, { image_url: string; count: number }> = {}
  if (filledSlots) {
    const uuids = filledSlots.map(s => s.uuid).filter(Boolean)
    if (uuids.length) {
      const { data: photos } = await supabase
        .from('watch_photos')
        .select('watch_id, image_url')
        .in('watch_id', uuids)
        .eq('is_default', true)

      const { data: counts } = await supabase
        .from('watch_photos')
        .select('watch_id')
        .in('watch_id', uuids)

      const countMap: Record<string, number> = {}
      counts?.forEach(p => {
        countMap[p.watch_id] = (countMap[p.watch_id] || 0) + 1
      })

      if (photos) {
        photos.forEach(p => {
          slotPhotos[p.watch_id] = { image_url: p.image_url, count: countMap[p.watch_id] || 0 }
        })
      }
    }
  }

  const slotsRemaining = 1000 - (totalFilled ?? 0)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/[0.06] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full border border-amber-500/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-white/50">1,000 Watches</span>
            <span className="text-white/10">/</span>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-500">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
            >
              View Site ↗
            </a>
            <AdminLogout />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Slots Filled', value: totalFilled ?? 0, accent: true },
            { label: 'Slots Remaining', value: slotsRemaining },
            { label: 'Total Submissions', value: totalSubmissions ?? 0 },
            { label: 'Photos Uploaded', value: Object.keys(slotPhotos).length },
            {
              label: 'Progress',
              value: `${(((totalFilled ?? 0) / 1000) * 100).toFixed(1)}%`,
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <p className={`text-2xl font-light ${accent ? 'text-amber-500' : 'text-white'}`}>
                {value}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/25">
            <span>Archive Progress</span>
            <span>{totalFilled ?? 0} / 1,000</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${((totalFilled ?? 0) / 1000) * 100}%` }}
            />
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-medium text-white">Submissions Queue</h2>
              <p className="text-xs text-white/30 mt-0.5">
                {totalSubmissions ?? 0} pending nomination{(totalSubmissions ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-6">
            <SubmissionsQueue submissions={submissions ?? []} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-medium text-white">Filled Slots</h2>
              <p className="text-xs text-white/30 mt-0.5">
                {totalFilled ?? 0} slot{(totalFilled ?? 0) !== 1 ? 's' : ''} in the archive
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-6">
            <SlotsManager filledSlots={filledSlots ?? []} slotPhotos={slotPhotos} />
          </div>
        </section>
      </main>
    </div>
  )
}