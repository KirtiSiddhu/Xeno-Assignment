'use client';

import { useEffect, useState } from 'react';
import { getSegments, createSegment, previewSegment } from '@/lib/api';
import { PieChart, Plus, Users, Search, X, Filter, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const RULE_FIELDS = [
  { key: 'min_total_spend', label: 'Min Total Spend (₹)', type: 'number', placeholder: 'e.g. 5000', group: 'Monetary' },
  { key: 'max_total_spend', label: 'Max Total Spend (₹)', type: 'number', placeholder: 'e.g. 20000', group: 'Monetary' },
  { key: 'min_orders', label: 'Min Orders', type: 'number', placeholder: 'e.g. 2', group: 'Frequency' },
  { key: 'max_orders', label: 'Max Orders', type: 'number', placeholder: 'e.g. 10', group: 'Frequency' },
  { key: 'min_days_since_last_order', label: 'Min Days Since Last Order', type: 'number', placeholder: 'e.g. 30', group: 'Recency' },
  { key: 'max_days_since_last_order', label: 'Max Days Since Last Order', type: 'number', placeholder: 'e.g. 90', group: 'Recency' },
  { key: 'city', label: 'City (comma-separated)', type: 'text', placeholder: 'e.g. Mumbai, Delhi', group: 'Demographics' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['', 'M', 'F'], labels: ['Any', 'Male', 'Female'], group: 'Demographics' },
  { key: 'min_age', label: 'Min Age', type: 'number', placeholder: 'e.g. 25', group: 'Demographics' },
  { key: 'max_age', label: 'Max Age', type: 'number', placeholder: 'e.g. 45', group: 'Demographics' },
];

const GROUPS = ['Monetary', 'Frequency', 'Recency', 'Demographics'];
const GROUP_COLORS: Record<string, string> = {
  Monetary: 'emerald',
  Frequency: 'blue',
  Recency: 'amber',
  Demographics: 'purple',
};

function groupColorClass(group: string, type: 'bg' | 'text' | 'border') {
  const map: Record<string, Record<string, string>> = {
    bg: { Monetary: 'bg-emerald-500/10', Frequency: 'bg-blue-500/10', Recency: 'bg-amber-500/10', Demographics: 'bg-violet-500/10' },
    text: { Monetary: 'text-emerald-400', Frequency: 'text-blue-400', Recency: 'text-amber-400', Demographics: 'text-violet-400' },
    border: { Monetary: 'border-emerald-500/20', Frequency: 'border-blue-500/20', Recency: 'border-amber-500/20', Demographics: 'border-violet-500/20' },
  };
  return map[type][group] || '';
}

function parseRules(raw: Record<string, string>) {
  const out: Record<string, any> = {};
  RULE_FIELDS.forEach(f => {
    const v = raw[f.key];
    if (v === '' || v === undefined) return;
    if (f.key === 'city') {
      out.city = v.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (f.type === 'number') {
      out[f.key] = Number(v);
    } else {
      out[f.key] = v;
    }
  });
  return out;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState<Record<string, string>>({});
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

  const activeRules = parseRules(rules);
  const hasAnyRule = Object.keys(activeRules).length > 0;

  const handlePreview = async () => {
    if (!hasAnyRule) return;
    setPreviewing(true);
    try {
      setPreview(await previewSegment(activeRules));
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreate = async () => {
    if (!name) return;
    setCreating(true);
    try {
      await createSegment({ name, description: desc, rules: activeRules });
      closeModal();
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName(''); setDesc('');
    setRules({}); setPreview(null);
  };

  const setRule = (key: string, val: string) => setRules(r => ({ ...r, [key]: val }));
  const clearRule = (key: string) => setRules(r => { const n = { ...r }; delete n[key]; return n; });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Segments</h1>
          <p className="text-muted-foreground">Define target audiences for your campaigns.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
        >
          <Plus size={18} /> New Segment
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16 text-muted-foreground flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading segments…
          </div>
        ) : segments.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground glass rounded-2xl flex flex-col items-center gap-3">
            <PieChart size={40} className="opacity-20" />
            <p>No segments yet. Create your first one!</p>
          </div>
        ) : (
          segments.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="glass p-6 rounded-2xl flex flex-col group hover:border-primary/40 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-all" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PieChart size={20} />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e1e2e] text-xs font-semibold text-muted-foreground">
                  <Users size={12} /> {s.customer_count?.toLocaleString() || 0}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors relative z-10">{s.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{s.description || 'No description.'}</p>

              {/* Rule tags */}
              {s.rules && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Object.entries(s.rules).slice(0, 4).map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                      {k.replace(/_/g, ' ')}: {Array.isArray(v) ? v.join(', ') : String(v)}
                    </span>
                  ))}
                  {Object.keys(s.rules).length > 4 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#1e1e2e] text-muted-foreground text-[10px]">+{Object.keys(s.rules).length - 4} more</span>
                  )}
                </div>
              )}

              <button className="flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors group/btn">
                <span>Use in Campaign</span>
                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Segment Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              className="glass w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-[#111118]/90 backdrop-blur-sm px-6 py-5 border-b border-[#1e1e2e] flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Create Segment</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Build a rule-based audience filter.</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1e1e2e] text-muted-foreground hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Name & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Segment Name <span className="text-rose-500">*</span></label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="e.g. High Value Mumbaikars"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <input
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                {/* Rules by group */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Filter Rules</h3>
                    {hasAnyRule && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {Object.keys(activeRules).length} active
                      </span>
                    )}
                  </div>

                  {GROUPS.map(group => (
                    <div key={group} className={clsx('rounded-xl border p-4', groupColorClass(group, 'border'), groupColorClass(group, 'bg'))}>
                      <div className={clsx('text-xs font-bold uppercase tracking-wider mb-3', groupColorClass(group, 'text'))}>{group}</div>
                      <div className="grid grid-cols-2 gap-3">
                        {RULE_FIELDS.filter(f => f.group === group).map(field => (
                          <div key={field.key} className="relative">
                            <label className="block text-xs font-medium mb-1 text-muted-foreground">{field.label}</label>
                            {field.type === 'select' ? (
                              <select
                                value={rules[field.key] || ''}
                                onChange={e => e.target.value ? setRule(field.key, e.target.value) : clearRule(field.key)}
                                className="w-full bg-[#0a0a0f] border border-[#2a2a3c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-white transition-colors"
                              >
                                {field.options!.map((opt, i) => (
                                  <option key={opt} value={opt}>{field.labels![i]}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="relative">
                                <input
                                  type={field.type}
                                  value={rules[field.key] || ''}
                                  onChange={e => e.target.value ? setRule(field.key, e.target.value) : clearRule(field.key)}
                                  placeholder={field.placeholder}
                                  className="w-full bg-[#0a0a0f] border border-[#2a2a3c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors pr-7"
                                />
                                {rules[field.key] && (
                                  <button
                                    onClick={() => clearRule(field.key)}
                                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-white transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview result */}
                <AnimatePresence>
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-primary font-bold mb-2">
                          <Sparkles size={15} />
                          {preview.count} customers match these rules
                        </div>
                        {preview.sample_customers?.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Sample: {preview.sample_customers.slice(0, 3).map((c: any) => c.name).join(', ')}
                            {preview.sample_customers.length > 3 && '…'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#1e1e2e]">
                  <button
                    onClick={handlePreview}
                    disabled={!hasAnyRule || previewing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-secondary text-secondary hover:bg-secondary/10 disabled:opacity-40 transition-all text-sm font-medium"
                  >
                    {previewing ? (
                      <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    ) : <Search size={15} />}
                    Preview Audience
                  </button>
                  <div className="ml-auto flex gap-3">
                    <button onClick={closeModal} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e1e2e] transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!name || creating}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                    >
                      {creating ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                      ) : (
                        <><Plus size={16} /> Save Segment</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
