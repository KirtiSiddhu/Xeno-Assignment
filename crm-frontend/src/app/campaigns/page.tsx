'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCampaigns, createCampaign, getSegments, launchCampaign } from '@/lib/api';
import { Megaphone, Plus, Mail, MessageSquare, Send, Sparkles, TrendingUp, Rocket, X, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';


export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [launching, setLaunching] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({ name: '', description: '', channel: 'email', segment_id: '', message_template: '' });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  // Predictive revenue
  useEffect(() => {
    if (!formData.segment_id) { setPrediction(null); return; }
    const seg = segments.find(s => s.id === formData.segment_id);
    if (!seg) return;
    const count = seg.customer_count || 0;
    const convRate = formData.channel === 'whatsapp' ? 3.8 : formData.channel === 'sms' ? 2.5 : formData.channel === 'rcs' ? 4.2 : 3.1;
    const avgOrderValue = 1850;
    const estimatedConverters = Math.round(count * (convRate / 100));
    const estimatedRevenue = estimatedConverters * avgOrderValue;
    const deliveryRate = formData.channel === 'whatsapp' ? 96 : formData.channel === 'sms' ? 94 : 91;
    setPrediction({ reach: count, convRate, estimatedConverters, estimatedRevenue, deliveryRate });
  }, [formData.segment_id, formData.channel]);

  const handleCreate = async () => {
    if (!formData.name || !formData.segment_id || !formData.message_template) return;
    setCreating(true);
    try {
      await createCampaign(formData);
      setShowModal(false);
      setFormData({ name: '', description: '', channel: 'email', segment_id: '', message_template: '' });
      setPrediction(null);
      showToast('Campaign created successfully!', 'success');
      await load();
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.error || 'Failed to create campaign.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleLaunch = async (id: string) => {
    setLaunching(id);
    try {
      await launchCampaign(id);
      showToast('Campaign launched! Messages dispatching…', 'success');
      await load();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Failed to launch campaign.', 'error');
    } finally {
      setLaunching(null);
    }
  };

  const isFormValid = formData.name.trim() && formData.segment_id && formData.message_template.trim();

  const getChannelIcon = (c: string) => {
    switch (c) {
      case 'email': return <Mail size={14} className="text-blue-400" />;
      case 'sms': return <MessageSquare size={14} className="text-emerald-400" />;
      case 'whatsapp': return <Send size={14} className="text-green-400" />;
      default: return <Megaphone size={14} className="text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={clsx(
              'fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium',
              toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            )}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

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
                  'px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border',
                  c.status === 'running' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-[#1e1e2e] text-muted-foreground border-[#2a2a3c]'
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
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Create Campaign</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Fill all fields to enable the Create button.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1e1e2e] text-muted-foreground hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Campaign Name <span className="text-rose-500">*</span></label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Diwali Sale 2024"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description <span className="text-muted-foreground text-xs">(optional)</span></label>
                  <input
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="What is this campaign about?"
                  />
                </div>

                {/* Channel + Segment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Channel <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.channel}
                      onChange={e => setFormData({ ...formData, channel: e.target.value })}
                      className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white transition-colors"
                    >
                      <option value="email">📧 Email</option>
                      <option value="sms">💬 SMS</option>
                      <option value="whatsapp">📱 WhatsApp</option>
                      <option value="rcs">✨ RCS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Target Segment <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={formData.segment_id}
                      onChange={e => setFormData({ ...formData, segment_id: e.target.value })}
                      placeholder="Enter segment ID..."
                      className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Predictive Revenue Widget */}
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
                          <Sparkles size={16} /> AI Pre-launch Prediction
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: 'Reach', value: prediction.reach.toLocaleString(), color: '' },
                            { label: 'Delivery', value: `${prediction.deliveryRate}%`, color: 'text-cyan-400' },
                            { label: 'Conv. Rate', value: `${prediction.convRate}%`, color: 'text-amber-400' },
                            { label: 'Est. Revenue', value: `₹${(prediction.estimatedRevenue / 1000).toFixed(0)}k`, color: 'text-emerald-400' },
                          ].map((item, i) => (
                            <div key={i} className="bg-[#0a0a0f]/60 p-3 rounded-lg text-center">
                              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                              <div className={clsx('text-lg font-bold', item.color)}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <TrendingUp size={12} /> ~{prediction.estimatedConverters} conversions based on historical channel performance.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Template */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message Template <span className="text-rose-500">*</span></label>
                  <p className="text-xs text-muted-foreground mb-2">Use <code className="bg-[#1e1e2e] px-1 py-0.5 rounded text-primary">{'{{name}}'}</code>, <code className="bg-[#1e1e2e] px-1 py-0.5 rounded text-primary">{'{{city}}'}</code>, <code className="bg-[#1e1e2e] px-1 py-0.5 rounded text-primary">{'{{total_spend}}'}</code> for personalization.</p>
                  <textarea
                    value={formData.message_template}
                    onChange={e => setFormData({ ...formData, message_template: e.target.value })}
                    rows={4}
                    className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Hi {{name}}, our exclusive collection is here! Use code SAVE20 for 20% off…"
                  />
                </div>

                {/* Validation hint */}
                {!isFormValid && (
                  <p className="text-xs text-amber-500 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Please fill in Campaign Name, Segment, and Message Template to continue.
                  </p>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-[#1e1e2e]">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e1e2e] transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!isFormValid || creating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                  >
                    {creating ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                    ) : (
                      <><Plus size={16} /> Create Campaign</>
                    )}
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
