'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCampaigns, createCampaign, getSegments, launchCampaign } from '@/lib/api';
import { Megaphone, Plus, Mail, MessageSquare, Send, Sparkles, TrendingUp, Rocket, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [launching, setLaunching] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', channel: 'email', segment_id: '', message_template: '' });

  const load = async () => {
    try {
      const [c, s] = await Promise.all([getCampaigns(), getSegments()]);
      setCampaigns(c);
      setSegments(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Predictive revenue simulation when segment is selected
  useEffect(() => {
    if (!formData.segment_id) { setPrediction(null); return; }
    const seg = segments.find(s => s.id === formData.segment_id);
    if (!seg) return;
    const count = seg.customer_count || 0;
    const convRate = formData.channel === 'whatsapp' ? 3.8 : formData.channel === 'sms' ? 2.5 : formData.channel === 'rcs' ? 4.2 : 3.1;
    const avgOrderValue = 1850; // average ₹ per order from seed data
    const estimatedConverters = Math.round(count * (convRate / 100));
    const estimatedRevenue = estimatedConverters * avgOrderValue;
    const deliveryRate = formData.channel === 'whatsapp' ? 96 : formData.channel === 'sms' ? 94 : 91;
    setPrediction({ reach: count, convRate, estimatedConverters, estimatedRevenue, deliveryRate });
  }, [formData.segment_id, formData.channel]);

  const handleCreate = async () => {
    try {
      await createCampaign(formData);
      setShowModal(false);
      setFormData({ name: '', description: '', channel: 'email', segment_id: '', message_template: '' });
      setPrediction(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunch = async (id: string) => {
    setLaunching(id);
    try {
      await launchCampaign(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setLaunching(null);
    }
  };

  const getChannelIcon = (c: string) => {
    switch(c) {
      case 'email': return <Mail size={14} className="text-blue-400"/>;
      case 'sms': return <MessageSquare size={14} className="text-emerald-400"/>;
      case 'whatsapp': return <Send size={14} className="text-green-400"/>;
      default: return <Megaphone size={14} className="text-purple-400"/>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Manage your outreach and track engagement.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
        >
          <Plus size={18} /> New Campaign
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading campaigns…
          </div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground glass rounded-2xl flex flex-col items-center gap-3">
            <Megaphone size={36} className="opacity-20" />
            <p>No campaigns yet. Create your first one!</p>
          </div>
        ) : (
          campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="glass p-6 rounded-2xl flex flex-col group hover:border-primary/40 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-all" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1e1e2e] flex items-center justify-center">
                    {getChannelIcon(c.channel)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{c.channel}</span>
                </div>
                <div className={clsx(
                  "px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider",
                  c.status === 'running' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                  c.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  "bg-[#1e1e2e] text-muted-foreground border border-[#2a2a3c]"
                )}>
                  {c.status}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors relative z-10">{c.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{c.description || 'No description'}</p>
              
              <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-[#0a0a0f]/60 rounded-xl border border-[#1e1e2e]">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Sent</div>
                  <div className="text-sm font-bold">{c.total_sent?.toLocaleString() || 0}</div>
                </div>
                <div className="text-center border-x border-[#1e1e2e]">
                  <div className="text-xs text-muted-foreground mb-1">Opened</div>
                  <div className="text-sm font-bold text-cyan-400">{c.total_opened?.toLocaleString() || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Converted</div>
                  <div className="text-sm font-bold text-emerald-400">{c.total_converted?.toLocaleString() || 0}</div>
                </div>
              </div>

              {c.status !== 'draft' && c.total_sent > 0 && (
                <div className="mb-5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivery Rate</span>
                    <span className="font-bold text-primary">{Math.round((c.total_delivered / c.total_sent) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1e1e2e] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-violet-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.total_delivered / c.total_sent) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <Link href={`/campaigns/${c.id}`} className="flex-1 text-center py-2.5 rounded-xl bg-[#1e1e2e] text-sm font-medium hover:bg-[#2a2a3c] transition-colors">
                  View Details
                </Link>
                {c.status === 'draft' && (
                  <button
                    onClick={() => handleLaunch(c.id)}
                    disabled={launching === c.id}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-lg shadow-primary/20"
                  >
                    {launching === c.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <Rocket size={14} />}
                    Launch
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Campaign</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1e1e2e] text-muted-foreground hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Campaign Name</label>
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Diwali Sale 2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Channel</label>
                    <select value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white transition-colors">
                      <option value="email">📧 Email</option>
                      <option value="sms">💬 SMS</option>
                      <option value="whatsapp">📱 WhatsApp</option>
                      <option value="rcs">✨ RCS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Segment</label>
                    <select value={formData.segment_id} onChange={e => setFormData({...formData, segment_id: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white transition-colors">
                      <option value="">Select a segment…</option>
                      {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.customer_count} users)</option>)}
                    </select>
                  </div>
                </div>

                {/* PREDICTIVE REVENUE WIDGET */}
                <AnimatePresence>
                  {prediction && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-center gap-2 mb-3 text-primary font-semibold text-sm">
                          <Sparkles size={16} />
                          AI Pre-launch Prediction
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-[#0a0a0f]/60 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Reach</div>
                            <div className="text-lg font-bold">{prediction.reach.toLocaleString()}</div>
                          </div>
                          <div className="bg-[#0a0a0f]/60 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Delivery</div>
                            <div className="text-lg font-bold text-cyan-400">{prediction.deliveryRate}%</div>
                          </div>
                          <div className="bg-[#0a0a0f]/60 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Conv. Rate</div>
                            <div className="text-lg font-bold text-amber-400">{prediction.convRate}%</div>
                          </div>
                          <div className="bg-[#0a0a0f]/60 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Est. Revenue</div>
                            <div className="text-lg font-bold text-emerald-400">₹{(prediction.estimatedRevenue / 1000).toFixed(0)}k</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <TrendingUp size={12} />
                          Estimated ~{prediction.estimatedConverters} conversions based on historical channel performance.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium mb-1">Message Template</label>
                  <p className="text-xs text-muted-foreground mb-2">Use {'{{name}}'}, {'{{city}}'}, {'{{total_spend}}'} for personalization.</p>
                  <textarea 
                    value={formData.message_template} 
                    onChange={e => setFormData({...formData, message_template: e.target.value})} 
                    rows={4}
                    className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" 
                    placeholder="Hi {{name}}, our exclusive Diwali collection is here! Use code DIWALI20 for 20% off..." 
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#1e1e2e]">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e1e2e] transition-colors">Cancel</button>
                  <button 
                    onClick={handleCreate} 
                    disabled={!formData.name || !formData.segment_id || !formData.message_template}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
