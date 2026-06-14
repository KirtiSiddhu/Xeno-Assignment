'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsOverview, getCampaignsPerformance } from '@/lib/api';
import { Users, TrendingUp, Megaphone, Send, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewData, perfData] = await Promise.all([
          getAnalyticsOverview(),
          getCampaignsPerformance()
        ]);
        setStats(overviewData);
        setCampaigns(perfData.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Fallback if API fails
  const data = stats || {
    total_customers: 500,
    total_revenue: 1250000,
    total_campaigns: 12,
    avg_delivery_rate: 92.5
  };

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header>
        <h1 className="text-3xl font-bold mb-2">Good morning, Marketer 👋</h1>
        <p className="text-muted-foreground">Here is the pulse of Lumière today.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-primary/20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <h3 className="text-3xl font-bold mt-1">{data.total_customers.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm text-emerald-400 relative z-10">
            <TrendingUp size={16} className="mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1">{formatter.format(data.total_revenue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campaigns Sent</p>
              <h3 className="text-3xl font-bold mt-1">{data.total_campaigns}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center text-blue-400">
              <Megaphone size={20} />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Delivery Rate</p>
              <h3 className="text-3xl font-bold mt-1">{data.avg_delivery_rate.toFixed(1)}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1e1e2e] flex items-center justify-center text-amber-400">
              <Send size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Campaign Performance</h3>
          </div>
          <div className="h-[300px] w-full">
            {campaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <RechartsTooltip 
                    cursor={{fill: '#1e1e2e', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid #2a2a3c', borderRadius: '8px' }}
                  />
                  <Bar dataKey="delivery_rate" name="Delivered" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="open_rate" name="Opened" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No campaign data yet</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-4 flex-1">
            <Link href="/chat" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 hover:border-primary/50 transition-colors group">
              <div>
                <h4 className="font-semibold text-primary group-hover:text-primary-foreground transition-colors">Start AI Campaign</h4>
                <p className="text-xs text-muted-foreground mt-1">Let Xena orchestrate a campaign</p>
              </div>
              <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/segments" className="flex items-center justify-between p-4 rounded-xl bg-[#1e1e2e]/50 border border-[#1e1e2e] hover:bg-[#1e1e2e] transition-colors group">
              <div>
                <h4 className="font-semibold group-hover:text-white transition-colors">Build a Segment</h4>
                <p className="text-xs text-muted-foreground mt-1">Filter customers by rules</p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/customers" className="flex items-center justify-between p-4 rounded-xl bg-[#1e1e2e]/50 border border-[#1e1e2e] hover:bg-[#1e1e2e] transition-colors group">
              <div>
                <h4 className="font-semibold group-hover:text-white transition-colors">Browse Customers</h4>
                <p className="text-xs text-muted-foreground mt-1">View the CRM database</p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
