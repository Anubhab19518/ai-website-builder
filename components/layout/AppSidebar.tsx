import Link from "next/link";
import { Search, Home, Compass, Library, Clock } from "lucide-react";
import SidebarUser from "./SidebarUser";

export function AppSidebar() {
  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col h-screen hidden md:flex z-50">
      <div className="pt-8 pb-6 px-6 flex items-center gap-3">
        <span className="font-bold text-[var(--sidebar-foreground)] tracking-tight text-xl heading-future">SynthApp</span>
      </div>

      <div className="px-5 mb-6">
        <div className="relative flex items-center group">
          <Search className="absolute left-3 w-4 h-4 text-[var(--muted-foreground)] transition-colors" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-[10px] pl-9 pr-9 py-2 text-[13px] text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all placeholder:text-[var(--muted-foreground)]"
          />
          <div className="absolute right-3 flex items-center justify-center text-[var(--primary)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-0.5">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--sidebar-foreground)] bg-[var(--secondary)] transition-all">
          <Home className="w-4 h-4 text-[var(--sidebar-foreground)]" />
          Home
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--sidebar-accent-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--secondary)] transition-all">
          <Compass className="w-4 h-4 text-[var(--sidebar-accent-foreground)]" />
          Explore
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--sidebar-accent-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--secondary)] transition-all">
          <Library className="w-4 h-4 text-[var(--sidebar-accent-foreground)]" />
          Library
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--sidebar-accent-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--secondary)] transition-all">
          <Clock className="w-4 h-4 text-[var(--sidebar-accent-foreground)]" />
          History
        </Link>
      </nav>

      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mb-8">
          <h3 className="text-[12px] font-medium text-[var(--muted-foreground)] mb-4">Tomorrow</h3>
          <ul className="space-y-1">
            <li className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer truncate py-1.5 transition-colors">What's something you've learned...</li>
            <li className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer truncate py-1.5 transition-colors">If you could teleport anywhere...</li>
            <li className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer truncate py-1.5 transition-colors">What's one goal you want to ac...</li>
          </ul>
        </div>
        <div>
          <h3 className="text-[12px] font-medium text-[var(--muted-foreground)] mb-4">7 Days Ago</h3>
          <ul className="space-y-1">
            <li className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer truncate py-1.5 transition-colors">Ask me anything weird or rand...</li>
            <li className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer truncate py-1.5 transition-colors">How are you feeling today, reall...</li>
            <li className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] cursor-pointer truncate py-1.5 transition-colors">What's one habit you wish you...</li>
          </ul>
        </div>
      </div>
      {/* User area */}
      <SidebarUser />
    </aside>
  );
}
