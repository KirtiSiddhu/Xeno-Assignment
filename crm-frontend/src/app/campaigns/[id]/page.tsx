'use client';

import { useEffect, useState } from 'react';
import { getCampaign, getCampaignFunnel, getCampaignCommunications, launchCampaign } from '@/lib/api';
import { Rocket, RefreshCw, Send, CheckCircle2, MailOpen, MousePointerClick, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [comms, setComms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [c, f, m] = await Promise.all([
        getCampaign(params.id),
        getCampaignFunnel(params.id),
        getCampaignCommunications(params.id)
      ]);
      setCampaign(c);
      setFunnel(f);
      setComms(m.communications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [params.id]);

  // Auto-refresh every 5s when campaign is running to show real-time delivery updates
  useEffect(() => {
    if (!campaign || campaign.status !== 'running') return;
    const interval = setInterval(() => load(true), 5000);
    return () => clearInterval(interval);
  }, [campaign?.status]);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      await launchCampaign(params.id);
      load(); // Reload to show running status
    } catch (e) {
      console.error('Launch failed:', e);
      alert('Launch failed. Check console.');
    } finally {
      setLaunching(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center flex-col gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm animate-pulse">Loading campaign…</p>
    </div>
  );
  if (!campaign) return <div className="p-12 text-center text-muted-foreground">Campaign not found</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <div className={clsx(
              "px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider",
              campaign.status === 'running' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
              campaign.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              "bg-[#1e1e2e] text-muted-foreground border border-[#2a2a3c]"
            )}>
              {campaign.status}
            </div>
          </div>
          <p className="text-muted-foreground">{campaign.description || 'No description'}</p>
        </div>
        
        <div className="flex gap-3 items-center">
          {campaign.status === 'running' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live — auto-refreshing
            </div>
          )}
          <button 
            onClick={() => load(true)}
            className="p-2 rounded-xl bg-[#1e1e2e] hover:bg-[#2a2a3c] transition-colors"
            title="Refresh Stats"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin text-primary' : ''} />
          </button>
          
          {campaign.status === 'draft' && (
            <button 
              onClick={handleLaunch}
              disabled={launching}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)] disabled:opacity-50"
            >
              <Rocket size={18} /> {launching ? 'Launching...' : 'Launch Campaign'}
            </button>
          )}
        </div>
      </header>

      {/* Funnel */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Delivery Funnel</h3>
          {campaign.total_sent > 0 && (
            <span className="text-xs text-muted-foreground">{campaign.total_sent.toLocaleString()} messages sent</span>
          )}
        </div>
        <div className="flex justify-between relative mb-8">
          <div className="absolute top-6 left-0 w-full h-1 bg-[#1e1e2e] -translate-y-1/2 z-0" />
          
          {funnel.map((step, idx) => {
            const isZero = campaign.total_sent === 0;
            const percentage = isZero ? 0 : Math.round((step.count / campaign.total_sent) * 100);
            const isFirst = idx === 0;
            
            return (
              <div key={step.stage} className="relative z-10 flex flex-col items-center group">
                <motion.div
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#111118] text-white transition-transform group-hover:scale-110",
                    step.count > 0 ? "bg-primary" : "bg-[#2a2a3c]"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                >
                  {idx === 0 ? <Send size={18}/> : 
                   idx === 1 ? <CheckCircle2 size={18}/> : 
                   idx === 2 ? <MailOpen size={18}/> : 
                   idx === 3 ? <MousePointerClick size={18}/> : 
                   <ShoppingCart size={18}/>}
                </motion.div>
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold">{step.stage}</div>
                  <motion.div
                    className="text-xl font-bold text-primary my-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                  >
                    {step.count?.toLocaleString() || 0}
                  </motion.div>
                  {!isFirst && <div className="text-xs text-muted-foreground">{percentage}% of sent</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated bar chart below funnel nodes */}
        {campaign.total_sent > 0 && (
          <div className="space-y-2.5 pt-4 border-t border-[#1e1e2e]">
            {funnel.map((step, idx) => {
              const pct = Math.round((step.count / campaign.total_sent) * 100);
              const colors = ['bg-primary', 'bg-cyan-500', 'bg-blue-400', 'bg-amber-400', 'bg-emerald-400'];
              return (
                <div key={step.stage} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground text-right">{step.stage}</div>
                  <div className="flex-1 h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${colors[idx % colors.length]} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.15 }}
                    />
                  </div>
                  <div className="w-10 text-xs font-bold text-right">{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template info */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Configuration</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Target Segment</div>
              <div className="font-medium text-sm px-3 py-2 bg-[#1e1e2e] rounded-lg border border-[#2a2a3c]">{campaign.segment_name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Channel</div>
              <div className="font-medium text-sm px-3 py-2 bg-[#1e1e2e] rounded-lg border border-[#2a2a3c] uppercase">{campaign.channel}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Message Template</div>
              <div className="text-sm p-4 bg-[#0a0a0f] rounded-xl border border-[#2a2a3c] whitespace-pre-wrap font-mono text-muted-foreground">
                {campaign.message_template}
              </div>
            </div>
          </div>
        </div>

        {/* Communications Log */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#1e1e2e] flex justify-between items-center bg-[#111118]">
            <h3 className="text-lg font-semibold">Communication Log</h3>
            <span className="text-xs text-muted-foreground">Real-time updates</span>
          </div>
          
          <div className="flex-1 overflow-auto max-h-[500px]">
            {comms.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No messages sent yet.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-[#0a0a0f] text-muted-foreground uppercase text-xs sticky top-0 border-b border-[#1e1e2e]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Recipient</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e2e]/50">
                  {comms.map(c => (
                    <tr key={c.id} className="hover:bg-[#1e1e2e]/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-semibold">{c.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{c.customer_email || c.customer_phone}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className={clsx(
                            "w-2 h-2 rounded-full",
                            c.status === 'failed' ? "bg-red-500" :
                            c.status === 'pending' ? "bg-amber-500 animate-pulse" :
                            c.status === 'sent' ? "bg-blue-400" :
                            c.status === 'delivered' ? "bg-cyan-400" :
                            "bg-emerald-400"
                          )}></div>
                          <span className="capitalize font-medium">{c.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {c.created_at && <div>Created: {new Date(c.created_at).toLocaleTimeString()}</div>}
                        {c.delivered_at && <div>Delivered: {new Date(c.delivered_at).toLocaleTimeString()}</div>}
                        {c.opened_at && <div className="text-cyan-400">Opened: {new Date(c.opened_at).toLocaleTimeString()}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
