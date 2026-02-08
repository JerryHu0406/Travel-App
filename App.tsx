
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Calendar, ArrowLeft, Briefcase, Plane, Music, ShoppingBag, DollarSign, SortAsc, AlertTriangle, LogOut } from 'lucide-react';
import { Itinerary, DailyPlan, Activity } from './types';
import ItinerarySection from './src/components/ItinerarySection';
import PackingSection from './src/components/PackingSection';
import TransportSection from './src/components/TransportSection';
import ConcertSection from './src/components/ConcertSection';
import ShoppingSection from './src/components/ShoppingSection';
import ExpensesSection from './src/components/ExpensesSection';
import ImageLightbox from './src/components/ImageLightbox';
import AuthPage from './src/components/AuthPage';

// Main App Component
import { supabase } from './src/lib/supabase';

// Main App Component
const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<string | null>(null);

  // App State
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'view'>('home');
  const [subTab, setSubTab] = useState<'itinerary' | 'packing' | 'transport' | 'concert' | 'shopping' | 'expenses'>('itinerary');
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form State for Creating/Editing Trip
  const [tripTitle, setTripTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vibe, setVibe] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [homeSortBy, setHomeSortBy] = useState<'date' | 'destination'>('date');


  const [isLoaded, setIsLoaded] = useState(false);

  // Auth Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?.id || null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user changes
  useEffect(() => {
    const loadItineraries = async () => {
      if (user) {
        setIsLoaded(false);
        const { data, error } = await supabase
          .from('itineraries')
          .select('id, data')
          .eq('user_id', user);

        if (error) {
          console.error('Error loading itineraries:', error);
          setItineraries([]); // Fallback
        } else if (data) {
          // Flatten: Supabase returns { id, data: {...} }. We need {...data, id} or just the data object if ID is inside.
          // Our itinerary object HAS 'id'.
          // Let's assume we store the WHOLE itinerary in 'data'.
          const loaded = data.map(row => row.data as Itinerary);
          setItineraries(loaded);
        }
        setIsLoaded(true);
      } else {
        setItineraries([]);
        setIsLoaded(false);
      }
    };

    loadItineraries();
  }, [user]);

  // Save data when data changes
  // Strategy: We can save individual itineraries when they change? 
  // OR standard "save all" approach.
  // Ideally, Supabase 'upsert' works best per row.
  // Our state is `itineraries` (ARRAY).
  // Current local storage saves the WHOLE array.
  // To keep it simple and consistent with previous refactor:
  // We can't easily detect WHICH one changed in this effect without deep compare or previous state.
  // However, for this scale, we can just upsert ALL active itineraries for the user? NO, that's heavy.
  // Better: Only save when `handleSaveTrip` or `updateSelectedTrip` is called?
  // BUT the existing code relied on `useEffect` to sync everything.
  // Let's try to keep `useEffect` but be careful.
  // Actually, sending 5-10 requests on every keystroke (if controlled inputs update state) is bad?
  // Our inputs (packing list check) update state instantly.
  // Optimization: Debounce? Or just accept it for now?
  // Supabase has rate limits.
  // Let's rely on the fact that existing logic `setItineraries` triggers this.
  // Checking checkboxes triggers this.
  // To avoid spamming, let's implement a simple Debounce or Ref to track pending save.

  // Actually, to correctly map to DB rows:
  // Table: itineraries (id, user_id, data)
  // We should UPSERT each itinerary in the array.

  useEffect(() => {
    if (!user || !isLoaded) return;

    const saveToSupabase = async () => {
      // We need to map `itineraries` to rows
      // Note: This pushes ALL itineraries every time ONE changes. Not efficient but robust for synchronization.
      const rows = itineraries.map(it => ({
        id: it.id,
        user_id: user,
        data: it
      }));

      if (rows.length === 0) return; // Nothing to save? Or should we delete?
      // If itineraries is empty, we might have deleted all? 
      // If we deleted locally, we need to delete remote.
      // Syncing "Delete" is tricky with just "Upsert All".
      // Use 'deleteConfirmId' flow for explicit deletes.

      const { error } = await supabase
        .from('itineraries')
        .upsert(rows);

      if (error) console.error('Error saving itineraries:', error);
    };

    // Debounce to prevent rapid-fire updates
    const timeout = setTimeout(saveToSupabase, 1000);
    return () => clearTimeout(timeout);
  }, [itineraries, user, isLoaded]);

  // Handle explicit delete in DB
  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('itineraries').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete:', error);
      alert('刪除失敗，請檢查網路');
      return; // Don't remove nicely if DB failed? Or optimistic?
    }
    setItineraries(itineraries.filter(t => t.id !== id));
    setDeleteConfirmId(null);
    if (selectedItinerary?.id === id) {
      setSelectedItinerary(null);
      setActiveTab('home');
    }
  };

  const resetForm = () => {
    setTripTitle(''); setDestination(''); setStartDate(''); setEndDate(''); setVibe([]); setEditingTripId(null); setFormError(null);
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (new Date(startDate) > new Date(endDate)) {
      setFormError(`出發日期不能晚於回程日期 (${startDate.replace(/-/g, '/')} ~ ${endDate.replace(/-/g, '/')})`);
      return;
    }

    const days = calculateDays(startDate, endDate);

    if (editingTripId) {
      const updated = itineraries.map(t => {
        if (t.id === editingTripId) {
          // If days changed, we might need to adjust daily_itinerary array
          let newDaily = t.daily_itinerary;
          if (days > t.trip_summary.total_days) {
            const added = Array.from({ length: days - t.trip_summary.total_days }, (_, i) => ({
              id: Math.random().toString(36).substr(2, 9),
              day: t.trip_summary.total_days + i + 1,
              date: addDays(startDate, t.trip_summary.total_days + i),
              theme: 'Free Day',
              activities: [] as Activity[]
            }));
            newDaily = [...newDaily, ...added];
          } else if (days < t.trip_summary.total_days) {
            newDaily = newDaily.slice(0, days);
          }
          // Update dates
          newDaily = newDaily.map((d, i) => ({ ...d, date: addDays(startDate, i) }));

          return {
            ...t,
            title: tripTitle, startDate, endDate,
            trip_summary: { ...t.trip_summary, city: destination, total_days: days, vibe },
            daily_itinerary: newDaily
          };
        }
        return t;
      });
      setItineraries(updated);
      setEditingTripId(null);
      setActiveTab('home');
    } else {
      const newTrip: Itinerary = {
        id: Date.now().toString(),
        title: tripTitle, startDate, endDate,
        trip_summary: { city: destination, total_days: days, vibe },
        daily_itinerary: Array.from({ length: days }, (_, i) => ({
          id: Math.random().toString(36).substr(2, 9),
          day: i + 1,
          date: addDays(startDate, i),
          theme: i === 0 ? 'Arrival' : i === days - 1 ? 'Departure' : 'Exploration',
          activities: []
        })),
        packing_list: [], transports: [], concerts: [], shopping_list: [],
        createdAt: Date.now()
      };
      setItineraries([...itineraries, newTrip]);
      setActiveTab('home');
    }
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const addDays = (date: string, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const startEditing = (trip: Itinerary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTripId(trip.id);
    setTripTitle(trip.title);
    setDestination(trip.trip_summary.city);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setVibe(trip.trip_summary.vibe || []);
    setActiveTab('create');
  };

  const updateSelectedTrip = (updated: Itinerary) => {
    setSelectedItinerary(updated);
    setItineraries(itineraries.map(t => t.id === updated.id ? updated : t));
  };

  const sortedItineraries = [...itineraries].sort((a, b) => {
    if (homeSortBy === 'date') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    return a.trip_summary.city.localeCompare(b.trip_summary.city);
  });

  const toggleVibe = (v: string) => {
    if (vibe.includes(v)) setVibe(vibe.filter(i => i !== v));
    else setVibe([...vibe, v]);
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen pb-10">
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

      {/* Header / Nav (Simple) */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">V</div>
          <span className="font-bold text-white tracking-widest uppercase text-xs">Voyage Genie</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-xs font-bold bg-slate-900 px-3 py-1 rounded-full">{user.substring(0, 8)}...</span>
          <button onClick={() => { supabase.auth.signOut(); setUser(null); }} className="text-slate-500 text-xs font-bold hover:text-white transition-colors flex items-center gap-1"><LogOut size={12} /> LOGOUT</button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6">
        {activeTab === 'home' && (
          <div className="py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter">探索<span className="text-indigo-500">之旅</span></h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Manage your voyages</p>
                  <div className="h-4 w-px bg-slate-800"></div>
                  <button
                    onClick={() => setHomeSortBy(homeSortBy === 'date' ? 'destination' : 'date')}
                    className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase hover:text-white transition-all"
                  >
                    <SortAsc size={12} /> {homeSortBy === 'date' ? 'Sort by Destination' : 'Sort by Date'}
                  </button>
                </div>
              </div>
              <button onClick={() => { resetForm(); setActiveTab('create'); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95"><Plus /> 新增旅程</button>
            </div>
            {itineraries.length === 0 ? <div className="text-center py-20 opacity-20 font-black text-3xl uppercase tracking-tighter">No Voyages Yet</div> : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sortedItineraries.map(trip => (
                  <div key={trip.id} onClick={() => { setSelectedItinerary(trip); setSubTab('itinerary'); setActiveTab('view'); }} className="group bg-slate-900 rounded-[3rem] p-10 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[20rem] shadow-xl">
                    <div className="absolute top-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-all z-10 translate-y-2 group-hover:translate-y-0">
                      <button onClick={(e) => startEditing(trip, e)} className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 hover:text-indigo-400"><Edit2 size={20} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(trip.id); }} className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 hover:text-red-400"><Trash2 size={20} /></button>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-indigo-500/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400"><MapPin size={32} /></div>
                      <div>
                        <h3 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors mb-2">{trip.title}</h3>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{trip.trip_summary.city}</div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {trip.trip_summary.vibe?.map(v => (
                            <span key={v} className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">{v}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800/50 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 tracking-tighter">{trip.startDate?.replace(/-/g, '/')} - {trip.endDate?.replace(/-/g, '/')}</span>
                      <ArrowLeft className="text-slate-800 group-hover:text-indigo-500 transition-all rotate-180" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="py-12 max-w-2xl mx-auto">
            <button onClick={() => setActiveTab('home')} className="mb-10 flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-indigo-400 transition-colors"><ArrowLeft size={16} /> Back to home</button>
            <div className="glass-panel p-12 rounded-[3.5rem] shadow-2xl space-y-10 border-white/5">
              <div className="flex items-center gap-5">
                <div className="bg-indigo-600 p-4 rounded-[1.5rem] shadow-xl shadow-indigo-600/20">{editingTripId ? <Edit2 className="text-white" /> : <Plus className="text-white" />}</div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{editingTripId ? '編輯旅程' : '新計畫'}</h2>
              </div>
              <form onSubmit={handleSaveTrip} className="space-y-8">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-center gap-3 text-red-400 font-bold">
                    <AlertTriangle size={20} />
                    {formError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">行程名稱</label>
                  <input required value={tripTitle} onChange={e => setTripTitle(e.target.value)} placeholder="例: 2026 櫻花祭東京行" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-xl font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">目的地 (國家 / 都市)</label>
                  <input required value={destination} onChange={e => setDestination(e.target.value)} placeholder="例: 日本/東京" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-xl font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">開始日期</label>
                    <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 font-black outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">結束日期</label>
                    <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 font-black outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">旅行風格 (可多選)</label>
                  <div className="flex flex-wrap gap-2">
                    {['演唱會', '自由行', '跟團', '商務'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleVibe(v)}
                        className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border ${vibe.includes(v) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 rounded-[2rem] text-white font-black text-xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.98] transition-all">
                  {editingTripId ? '儲存更新內容' : '開始你的精彩旅程'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'view' && selectedItinerary && (
          <div className="py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <button onClick={() => setActiveTab('home')} className="mb-6 flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-indigo-400 transition-colors"><ArrowLeft size={16} /> Return Home</button>
                <h1 className="text-6xl font-black text-white tracking-tighter mb-4">{selectedItinerary.title}</h1>
                <div className="flex gap-3 items-center">
                  <div className="bg-slate-800 text-slate-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedItinerary.trip_summary.city}</div>
                  <div className="flex gap-1">
                    {selectedItinerary.trip_summary.vibe?.map(v => (
                      <div key={v} className="bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{v}</div>
                    ))}
                  </div>
                  <div className="bg-slate-800 text-slate-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedItinerary.trip_summary.total_days} Days Voyage</div>
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-4 mb-16 pb-6 scrollbar-hide">
              {[
                { id: 'itinerary', label: '每日行程', icon: MapPin },
                { id: 'packing', label: '行李清單', icon: Briefcase },
                { id: 'transport', label: '交通運輸', icon: Plane },
                { id: 'concert', label: '追星資訊', icon: Music },
                { id: 'shopping', label: '購物筆記', icon: ShoppingBag },
                { id: 'expenses', label: '預算統計', icon: DollarSign },
              ].map(item => (
                <button key={item.id} onClick={() => setSubTab(item.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black whitespace-nowrap transition-all border-2 ${subTab === item.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-300'}`}>
                  <item.icon size={20} /><span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="animate-in fade-in duration-700 slide-in-from-bottom-5">
              {subTab === 'itinerary' && <ItinerarySection itinerary={selectedItinerary} onUpdate={updateSelectedTrip} />}
              {subTab === 'packing' && <PackingSection itinerary={selectedItinerary} onUpdate={updateSelectedTrip} />}
              {subTab === 'transport' && <TransportSection itinerary={selectedItinerary} onUpdate={updateSelectedTrip} onImageClick={setLightboxImage} />}
              {subTab === 'concert' && <ConcertSection itinerary={selectedItinerary} onUpdate={updateSelectedTrip} onImageClick={setLightboxImage} />}
              {subTab === 'shopping' && <ShoppingSection itinerary={selectedItinerary} onUpdate={updateSelectedTrip} onImageClick={setLightboxImage} />}
              {subTab === 'expenses' && <ExpensesSection itinerary={selectedItinerary} />}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="glass-panel relative w-full max-w-sm p-10 rounded-[3rem] border-red-500/20 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto shadow-inner"><AlertTriangle size={40} /></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">確定刪除旅程？</h3>
              <p className="text-slate-500 font-bold text-sm">此動作將會抹除該次旅遊的所有內容，且無法還原。</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirmId)} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] font-black transition-all">狠心刪除</button>
              <button onClick={() => setDeleteConfirmId(null)} className="w-full py-5 bg-slate-800 text-slate-400 rounded-[2rem] font-black">再想一下</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
