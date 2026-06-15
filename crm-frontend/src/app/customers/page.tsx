'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api';
import { Search, MapPin, Users, Filter, Sparkles, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type ChurnLevel = 'High' | 'Medium' | 'Low';

function churnLevel(score: number): ChurnLevel {
  if (score > 75) return 'High';
  if (score > 40) return 'Medium';
  return 'Low';
}

const churnStyles: Record<ChurnLevel, string> = {
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const churnIcons: Record<ChurnLevel, React.ReactNode> = {
  High: <TrendingDown size={11} />,
  Medium: <Minus size={11} />,
  Low: <TrendingUp size={11} />,
};

// Next-best-action tooltip
function NBATooltip({ action }: { action: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      <button className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors">
        <Sparkles size={11} className="text-primary" />
      </button>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 z-50 bg-[#111118] border border-primary/30 rounded-xl p-3 shadow-2xl"
          >
            <div className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1 flex items-center gap-1">
              <Sparkles size={10} /> Next Best Action
            </div>
            <div className="text-xs text-foreground leading-relaxed">{action}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111118] border-r border-b border-primary/30 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);

  const loadCustomers = async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    try {
      const data = await getCustomers(currentPage, search, '', gender);
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(true);
  };

  const handleGenderChange = (g: string) => {
    setGender(g);
    setPage(1);
    setTimeout(() => loadCustomers(true), 0);
  };

  const highRiskCount = customers.filter(c => c.churn_risk > 75).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} shoppers ·{' '}
            {highRiskCount > 0 && (
              <span className="text-rose-400 font-medium">{highRiskCount} high churn risk on this page</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#1e1e2e] px-3 py-2 rounded-xl border border-[#2a2a3c]">
          <Sparkles size={12} className="text-primary" />
          Hover <span className="text-primary font-bold mx-1">✦</span> for AI recommendation
        </div>
      </header>

      {/* Filters */}
      <div className="glass p-4 rounded-2xl flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
        </form>

        {/* Gender filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          {(['', 'M', 'F'] as const).map((g) => (
            <button
              key={g}
              onClick={() => handleGenderChange(g)}
              className={clsx(
                'px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                gender === g
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-[#1e1e2e] text-muted-foreground hover:bg-[#2a2a3c]'
              )}
            >
              {g === '' ? 'All' : g === 'M' ? '♂ Male' : '♀ Female'}
            </button>
          ))}
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Search
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#111118] text-muted-foreground uppercase text-xs border-b border-[#1e1e2e]">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Orders</th>
                <th className="px-6 py-4 font-semibold">Total Spend</th>
                <th className="px-6 py-4 font-semibold">Churn Risk</th>
                <th className="px-6 py-4 font-semibold">Tags</th>
                <th className="px-6 py-4 font-semibold text-center">AI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex justify-center mb-4">
                      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading customers…
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                    <Users size={36} className="mx-auto mb-3 opacity-20" />
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => {
                  const level = churnLevel(c.churn_risk || 0);
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.3 }}
                      className="border-b border-[#1e1e2e]/50 hover:bg-[#1e1e2e]/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {c.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin size={13} /> {c.city || 'Unknown'}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 mt-0.5">{c.gender === 'M' ? 'Male' : c.gender === 'F' ? 'Female' : ''}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{c.total_orders || 0}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">
                        ₹{(c.total_spend || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {c.churn_risk != null ? (
                          <span className={clsx(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border',
                            churnStyles[level]
                          )}>
                            {churnIcons[level]}
                            {level} ({c.churn_risk})
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags && c.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {c.next_best_action && (
                          <NBATooltip action={c.next_best_action} />
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 50 && (
          <div className="p-4 border-t border-[#1e1e2e] flex justify-between items-center bg-[#111118]">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] disabled:opacity-40 text-sm hover:bg-[#2a2a3c] transition-colors"
              >
                ← Previous
              </button>
              <button
                disabled={page * 50 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] disabled:opacity-40 text-sm hover:bg-[#2a2a3c] transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
