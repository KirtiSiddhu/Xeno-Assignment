'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Megaphone, 
  PieChart 
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'Segments', href: '/segments', icon: PieChart },
  ];

  return (
    <aside className="w-64 bg-[#111118] border-r border-[#1e1e2e] flex flex-col glass z-10 relative">
      <div className="h-20 flex items-center px-6 border-b border-[#1e1e2e]">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
          Lumière CRM
        </h1>
      </div>
      
      <div className="px-6 py-4">
        <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4">
          Main Menu
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-[inset_2px_0_0_0_#7c3aed]' 
                    : 'text-muted-foreground hover:bg-[#1e1e2e]/50 hover:text-foreground'
                )}
              >
                <item.icon className={clsx("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Powered by</span>
          </div>
          <p className="text-sm font-medium text-foreground">Gemini AI Engine</p>
        </div>
      </div>
    </aside>
  );
}
