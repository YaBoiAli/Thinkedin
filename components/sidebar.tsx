"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUser, FaRobot, FaBars, FaTimes } from "react-icons/fa";
import { FaHashtag } from "react-icons/fa";
import { Logo } from './logo';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-neutral-800 text-white rounded-lg shadow-lg hover:bg-neutral-700 transition-colors"
        aria-label="Open menu"
      >
        <FaBars className="text-xl" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        h-screen w-64 bg-neutral-900 text-neutral-100 flex flex-col py-8 px-4 shadow-xl border-r border-neutral-800 z-50
        fixed left-0 top-0 transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <FaTimes className="text-xl" />
        </button>

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
      </aside>
    </>
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