'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsOverview, getCampaignsPerformance } from '@/lib/api';
import { Users, TrendingUp, Megaphone, Send, ArrowRight, Zap, Activity, ShieldAlert } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] } as any })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

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
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm animate-pulse">Loading intelligence…</p>
      </div>
    );
  }

  const data = stats || {
    total_customers: 500,
    total_revenue: 1250000,
    total_campaigns: 12,
    avg_delivery_rate: 92.5
  };

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  // AI Insight cards
  const insights = [
    { icon: <ShieldAlert size={16} />, color: 'rose', text: '43 customers are at high churn risk this week. Launch a win-back campaign.' },
    { icon: <Zap size={16} />, color: 'amber', text: 'Best send time for your audience: Tuesday 10 AM – 12 PM IST.' },
    { icon: <Activity size={16} />, color: 'emerald', text: 'Mumbai segment has 28% higher open rate than average. Consider a city-specific blast.' },
  ];

  // Revenue trend sparkline (mock data for demo)
  const revenueTrend = [
    { day: 'Mon', revenue: 32000 }, { day: 'Tue', revenue: 58000 }, { day: 'Wed', revenue: 47000 },
    { day: 'Thu', revenue: 76000 }, { day: 'Fri', revenue: 91000 }, { day: 'Sat', revenue: 62000 }, { day: 'Sun', revenue: 84000 }
  ];

  // Channel distribution pie
  const channelData = [
    { name: 'Email', value: 45 }, { name: 'WhatsApp', value: 30 },
    { name: 'SMS', value: 15 }, { name: 'RCS', value: 10 }
  ];

  const kpis = [
    {
      label: 'Total Customers', value: data.total_customers.toLocaleString(),
      sub: '+12% from last month', icon: <Users size={20} />, color: 'primary',
      glowColor: 'primary'
    },
    {
      label: 'Total Revenue', value: formatter.format(data.total_revenue),
      sub: 'Across all orders', icon: <TrendingUp size={20} />, color: 'emerald',
      glowColor: 'emerald'
    },
    {
      label: 'Campaigns Sent', value: data.total_campaigns,
      sub: 'Active + Completed', icon: <Megaphone size={20} />, color: 'blue',
      glowColor: 'blue'
    },
    {
      label: 'Avg Delivery Rate', value: `${data.avg_delivery_rate?.toFixed(1)}%`,
      sub: 'Channel average', icon: <Send size={20} />, color: 'amber',
      glowColor: 'amber'
    }
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const glowMap: Record<string, string> = {
    primary: 'bg-primary/10', emerald: 'bg-emerald-500/10',
    blue: 'bg-blue-500/10', amber: 'bg-amber-500/10',
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-1">Good morning, Marketer 👋</h1>
        <p className="text-muted-foreground">Here is the pulse of <span className="text-primary font-semibold">Lumière</span> today.</p>
      </motion.header>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {kpis.map((kpi, i) => (
          <motion.div key={i} custom={i} variants={fadeInUp} className="glass p-6 rounded-2xl relative overflow-hidden group cursor-default">
            <div className={`absolute top-0 right-0 w-36 h-36 ${glowMap[kpi.glowColor]} rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:scale-125`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <h3 className="text-3xl font-bold mt-1 tracking-tight">{kpi.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${colorMap[kpi.glowColor]}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="flex items-center text-sm text-emerald-400 relative z-10 gap-1">
              <TrendingUp size={14} />
              <span>{kpi.sub}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {/* Campaign Performance Bar Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Campaign Performance</h3>
          <div className="h-[280px]">
            {campaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip
                    cursor={{ fill: '#1e1e2e', opacity: 0.5 }}
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid #2a2a3c', borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Bar dataKey="delivery_rate" name="Delivered %" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="open_rate" name="Opened %" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Megaphone size={40} className="opacity-20" />
                <p className="text-sm">Launch a campaign to see analytics here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Channel Distribution Pie */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Channel Mix</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" paddingAngle={3} stroke="none">
                  {channelData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid #2a2a3c', borderRadius: '10px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channelData.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                {c.name} ({c.value}%)
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Revenue Trend + AI Insights */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue This Week</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid #2a2a3c', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-primary" />
            <h3 className="text-lg font-semibold">Xena's Insights</h3>
          </div>
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
              className={`p-4 rounded-xl border text-sm leading-relaxed ${ins.color === 'rose' ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' : ins.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'}`}
            >
              <div className="flex gap-2 items-start">
                <span className="mt-0.5 flex-shrink-0">{ins.icon}</span>
                <span>{ins.text}</span>
              </div>
            </motion.div>
          ))}

          <Link href="/chat" className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Zap size={16} /> Ask Xena Anything
          </Link>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="glass rounded-2xl p-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { href: '/chat', label: 'Start AI Campaign', sub: 'Let Xena orchestrate a campaign end-to-end', color: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/60' },
            { href: '/segments', label: 'Build a Segment', sub: 'Filter customers by rules or natural language', color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/50' },
            { href: '/customers', label: 'Browse Customers', sub: 'Explore churn risk and LTV predictions', color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50' },
          ].map((a, i) => (
            <Link key={i} href={a.href} className={`flex items-center justify-between p-5 rounded-xl bg-gradient-to-r ${a.color} border transition-all group`}>
              <div>
                <h4 className="font-semibold text-foreground">{a.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{a.sub}</p>
              </div>
              <ArrowRight size={18} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
