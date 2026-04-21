"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SidebarUser() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string; email?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setProfile(null)
          setLoading(false)
          return
        }

        const user = session.user
        // Try to fetch a profiles row (non-blocking fallback)
        let fullName = user.user_metadata?.full_name || user.user_metadata?.name
        let avatar = user.user_metadata?.avatar_url

        try {
          const { data } = await supabase.from('profiles').select('full_name, avatar_url, email').eq('id', user.id).single()
          if (data) {
            fullName = data.full_name || fullName
            avatar = data.avatar_url || avatar
            if (!user.email && data.email) {
              // fallback
            }
          }
        } catch (e) {
          // ignore if table doesn't exist
        }

        if (mounted) {
          setProfile({ full_name: fullName, avatar_url: avatar, email: user.email || undefined })
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-4 text-sm text-[var(--muted-foreground)]">Loading...</div>

  if (!profile) {
    return (
      <div className="p-4 text-sm text-[var(--muted-foreground)]">Not signed in</div>
    )
  }

  const initials = profile.full_name ? profile.full_name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : (profile.email ? profile.email[0].toUpperCase() : 'U')

  return (
    <div className="px-4 py-4 border-t border-[var(--border)] bg-[var(--sidebar)]">
      <div className="flex items-center gap-3">
        {profile.avatar_url ? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--muted)]">
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] font-medium">{initials}</div>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">{profile.full_name || profile.email}</div>
          {profile.email && <div className="text-xs text-[var(--muted-foreground)] truncate">{profile.email}</div>}
        </div>

        <button onClick={handleLogout} className="ml-2 text-sm text-[var(--primary)] hover:underline">Logout</button>
      </div>
    </div>
  )
}
