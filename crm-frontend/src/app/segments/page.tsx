'use client';

import { useEffect, useState } from 'react';
import { getSegments, createSegment, previewSegment } from '@/lib/api';
import { PieChart, Plus, Users, Search } from 'lucide-react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState<any>({
    min_total_spend: '',
    min_days_since_last_order: '',
    city: '',
  });
  
  const [preview, setPreview] = useState<any>(null);

  const load = async () => {
    try {
      setSegments(await getSegments());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePreview = async () => {
    const parsedRules: any = {};
    if (rules.min_total_spend) parsedRules.min_total_spend = Number(rules.min_total_spend);
    if (rules.min_days_since_last_order) parsedRules.min_days_since_last_order = Number(rules.min_days_since_last_order);
    if (rules.city) parsedRules.city = rules.city.split(',').map((s: string) => s.trim());
    
    try {
      setPreview(await previewSegment(parsedRules));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    const parsedRules: any = {};
    if (rules.min_total_spend) parsedRules.min_total_spend = Number(rules.min_total_spend);
    if (rules.min_days_since_last_order) parsedRules.min_days_since_last_order = Number(rules.min_days_since_last_order);
    if (rules.city) parsedRules.city = rules.city.split(',').map((s: string) => s.trim());

    try {
      await createSegment({ name, description: desc, rules: parsedRules });
      setShowModal(false);
      setName(''); setDesc(''); setRules({min_total_spend:'', min_days_since_last_order:'', city:''});
      setPreview(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Segments</h1>
          <p className="text-muted-foreground">Define target audiences for your campaigns.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          <Plus size={18} /> New Segment
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading segments...</div>
        ) : segments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground glass rounded-2xl">No segments created yet.</div>
        ) : (
          segments.map(s => (
            <div key={s.id} className="glass p-6 rounded-2xl flex flex-col group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PieChart size={20} />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e1e2e] text-xs font-medium text-muted-foreground">
                  <Users size={12} /> {s.customer_count?.toLocaleString() || 0}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{s.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{s.description || 'No description provided.'}</p>
              
              <div className="text-xs text-muted-foreground bg-[#0a0a0f] p-3 rounded-xl border border-[#1e1e2e] font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {JSON.stringify(s.rules)}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl border-primary/20 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Segment</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Segment Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. High Value Mumbaikars" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={desc} onChange={e=>setDesc(e.target.value)} className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" placeholder="What is this segment?" />
              </div>

              <div className="pt-4 border-t border-[#1e1e2e]">
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Min Total Spend (₹)</label>
                    <input type="number" value={rules.min_total_spend} onChange={e=>setRules({...rules, min_total_spend: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#2a2a3c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Min Days Since Last Order</label>
                    <input type="number" value={rules.min_days_since_last_order} onChange={e=>setRules({...rules, min_days_since_last_order: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#2a2a3c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">City (comma separated)</label>
                    <input value={rules.city} onChange={e=>setRules({...rules, city: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#2a2a3c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Mumbai, Delhi" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={handlePreview} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-secondary text-secondary hover:bg-secondary/10 transition-colors text-sm font-medium">
                  <Search size={16} /> Preview Audience
                </button>
              </div>

              {preview && (
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 animate-fade-in">
                  <div className="text-secondary font-bold mb-2 flex items-center gap-2">
                    <Users size={16} /> {preview.count} customers match these rules
                  </div>
                  {preview.sample_customers.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Sample: {preview.sample_customers.slice(0,3).map((c:any) => c.name).join(', ')}...
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6 flex justify-end gap-3 border-t border-[#1e1e2e]">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e1e2e] transition-colors">Cancel</button>
                <button 
                  onClick={handleCreate} 
                  disabled={!name || Object.keys(rules).length === 0}
                  className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                >
                  Save Segment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
