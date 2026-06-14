'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCampaigns, createCampaign, getSegments } from '@/lib/api';
import { Megaphone, Plus, Mail, MessageSquare, Send } from 'lucide-react';
import clsx from 'clsx';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
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

  const handleCreate = async () => {
    try {
      await createCampaign(formData);
      setShowModal(false);
      setFormData({ name: '', description: '', channel: 'email', segment_id: '', message_template: '' });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const getChannelIcon = (c: string) => {
    switch(c) {
      case 'email': return <Mail size={14} className="text-blue-400"/>;
      case 'sms': return <MessageSquare size={14} className="text-emerald-400"/>;
      case 'whatsapp': return <Send size={14} className="text-emerald-500"/>;
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
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          <Plus size={18} /> New Campaign
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground glass rounded-2xl">No campaigns yet.</div>
        ) : (
          campaigns.map(c => (
            <div key={c.id} className="glass p-6 rounded-2xl flex flex-col group hover:border-primary/50 transition-colors relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1e1e2e] flex items-center justify-center">
                    {getChannelIcon(c.channel)}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.channel}</span>
                </div>
                <div className={clsx(
                  "px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider",
                  c.status === 'running' ? "bg-cyan-500/10 text-cyan-400" :
                  c.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-[#1e1e2e] text-muted-foreground"
                )}>
                  {c.status}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{c.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{c.description || 'No description'}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Target</div>
                  <div className="text-sm font-medium">{c.segment_name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Sent</div>
                  <div className="text-sm font-medium">{c.total_sent?.toLocaleString() || 0}</div>
                </div>
              </div>

              {c.status !== 'draft' && c.total_sent > 0 && (
                <div className="mb-6 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-primary">{Math.round((c.total_delivered/c.total_sent)*100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1e1e2e] rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{width: `${(c.total_delivered/c.total_sent)*100}%`}}></div>
                  </div>
                </div>
              )}

              <Link href={`/campaigns/${c.id}`} className="mt-auto block w-full text-center py-2.5 rounded-xl bg-[#1e1e2e] text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl border-primary/20 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Campaign</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Summer Sale 2024" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" placeholder="What is this campaign about?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Channel</label>
                  <select value={formData.channel} onChange={e=>setFormData({...formData, channel: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary text-white">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="rcs">RCS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Segment</label>
                  <select value={formData.segment_id} onChange={e=>setFormData({...formData, segment_id: e.target.value})} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary text-white">
                    <option value="">Select a segment...</option>
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.customer_count} users)</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message Template</label>
                <p className="text-xs text-muted-foreground mb-2">Use {'{{name}}'}, {'{{first_name}}'}, {'{{city}}'}, {'{{total_spend}}'} for personalization.</p>
                <textarea 
                  value={formData.message_template} 
                  onChange={e=>setFormData({...formData, message_template: e.target.value})} 
                  rows={4}
                  className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" 
                  placeholder="Hi {{first_name}}, check out our new collection..." 
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-[#1e1e2e]">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e1e2e] transition-colors">Cancel</button>
                <button 
                  onClick={handleCreate} 
                  disabled={!formData.name || !formData.segment_id || !formData.message_template}
                  className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
