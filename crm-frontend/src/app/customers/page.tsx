'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api';
import { Search, MapPin, Tag } from 'lucide-react';
import clsx from 'clsx';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(page, search);
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-muted-foreground">Manage and view your {total} shoppers.</p>
        </div>
      </header>

      <div className="glass p-4 rounded-2xl flex gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
        </form>
        <button onClick={handleSearch} className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2a2a3c] rounded-xl text-sm font-medium transition-colors">
          Filter
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center mb-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-[#1e1e2e]/50 hover:bg-[#1e1e2e]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin size={14} /> {c.city || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{c.total_orders || 0}</td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      ₹{c.total_spend?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      {c.churn_risk ? (
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
                          c.churn_risk > 75 ? "bg-rose-500/10 text-rose-500" :
                          c.churn_risk > 40 ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {c.churn_risk > 75 ? 'High' : c.churn_risk > 40 ? 'Medium' : 'Low'} ({c.churn_risk})
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.tags && c.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && total > 50 && (
          <div className="p-4 border-t border-[#1e1e2e] flex justify-between items-center bg-[#111118]">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * 50 + 1} to Math.min(page * 50, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] disabled:opacity-50 text-sm hover:bg-[#2a2a3c] transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page * 50 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] disabled:opacity-50 text-sm hover:bg-[#2a2a3c] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
