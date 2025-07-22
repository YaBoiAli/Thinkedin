"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUser, FaRobot } from "react-icons/fa";
import { FaHashtag } from "react-icons/fa";
import { Logo } from './logo';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FiLogOut } from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-64 bg-neutral-900 text-neutral-100 flex flex-col py-8 px-4 shadow-xl border-r border-neutral-800 fixed left-0 top-0 z-20">
      <div className="mb-10 flex items-center gap-3">
        <Link href="/">
          <Logo size={48} className="cursor-pointer hover:opacity-80 transition" />
        </Link>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        <SidebarLink href="/" icon={<FaHome />} active={pathname === "/"}>
          Home
        </SidebarLink>
        <SidebarLink href="/posts" icon={<FaHashtag />} active={pathname.startsWith("/posts")}> 
          Posts
        </SidebarLink>
        <SidebarLink href="/dashboard" icon={<FaUser />} active={pathname.startsWith("/dashboard")}> 
          Dashboard
        </SidebarLink>
        <SidebarLink href="/chatbot" icon={<FaRobot />} active={pathname.startsWith("/chatbot")}> 
          Chatbot
        </SidebarLink>
      </nav>
      <div className="mt-10 p-4 bg-neutral-800 rounded-lg text-sm text-neutral-200 border border-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <FaRobot className="text-lg" />
          <span>AI Chatbot</span>
        </div>
        <p className="opacity-80">Ask for advice, stories, or find posts about your needs. Try: <span className="italic">"motivation"</span></p>
      </div>
      {/* Sign Out Button */}
      <button
        onClick={async () => { await signOut(auth); }}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-base transition-colors shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        style={{ marginTop: 'auto' }}
      >
        <FiLogOut className="text-lg" />
        Sign Out
      </button>
    </aside>
  );
}

function SidebarLink({ href, icon, children, active }: { href: string; icon: React.ReactNode; children: React.ReactNode; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${active ? "bg-neutral-800" : "hover:bg-neutral-800"}`}>
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
} 