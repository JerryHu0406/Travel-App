
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, MapPin, Calendar, Trash2, ChevronRight, Clock, 
  Navigation, Info, ArrowLeft, Search, Layout, Briefcase, 
  Plane, Music, ShoppingBag, CreditCard, CheckCircle2, Circle, 
  Wallet, X, Edit2, Save, AlertTriangle, ExternalLink, Copy, Move, Image as ImageIcon,
  DollarSign, ListChecks, ChevronDown, ChevronUp, Tag, Bus, TrainFront, Car, Camera, Utensils, Maximize2, SortAsc
} from 'lucide-react';
import { 
  Itinerary, DailyPlan, Activity, PackingItem, 
  TransportInfo, ConcertInfo, ShoppingItem, Currency
} from './types';

const App: React.FC = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'view'>('home');
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [subTab, setSubTab] = useState<'itinerary' | 'packing' | 'transport' | 'concert' | 'shopping' | 'expenses'>('itinerary');
  const [homeSortBy, setHomeSortBy] = useState<'date' | 'destination'>('date');
  
  // Form State
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripTitle, setTripTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [vibe, setVibe] = useState<string[]>([]);

  // Activity Add Form State
  const [showActivityForm, setShowActivityForm] = useState<string | null>(null); // dayId
  const [activityForm, setActivityForm] = useState({ location: '', time: '', notes: '' });

  // Modal/Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('voyage_genie_v10');
    if (saved) setItineraries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('voyage_genie_v10', JSON.stringify(itineraries));
  }, [itineraries]);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const sortedItineraries = useMemo(() => {
    const list = [...itineraries];
    if (homeSortBy === 'date') {
      return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else {
      return list.sort((a, b) => a.trip_summary.city.localeCompare(b.trip_summary.city, 'zh-TW'));
    }
  }, [itineraries, homeSortBy]);

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Date Validation
    if (new Date(startDate) > new Date(endDate)) {
      alert('日期輸入錯誤：開始日期不能晚於結束日期，請修正！');
      return;
    }

    const totalDays = calculateDays(startDate, endDate);
    
    if (editingTripId) {
      const updated = itineraries.map(trip => {
        if (trip.id === editingTripId) {
          let newDailyPlan = [...trip.daily_itinerary];
          if (totalDays > newDailyPlan.length) {
            for (let i = newDailyPlan.length; i < totalDays; i++) {
              newDailyPlan.push({ id: Math.random().toString(36).substr(2, 9), day: i + 1, theme: `Day ${i + 1}`, activities: [] });
            }
          } else if (totalDays < newDailyPlan.length) {
            newDailyPlan = newDailyPlan.slice(0, totalDays);
          }
          return { 
            ...trip, 
            title: tripTitle || `${destination}之旅`,
            startDate, 
            endDate, 
            trip_summary: { ...trip.trip_summary, city: destination, total_days: totalDays, vibe }, 
            daily_itinerary: newDailyPlan 
          };
        }
        return trip;
      });
      setItineraries(updated);
    } else {
      const daily: DailyPlan[] = Array.from({ length: totalDays }, (_, i) => ({
        id: Math.random().toString(36).substr(2, 9), day: i + 1, theme: `Day ${i + 1}`, activities: []
      }));
      const newTrip: Itinerary = {
        id: Date.now().toString(),
        title: tripTitle || `${destination}之旅`,
        startDate, endDate, createdAt: Date.now(),
        trip_summary: { city: destination, total_days: totalDays, vibe },
        daily_itinerary: daily, packing_list: [], transports: [], concerts: [], shopping_list: []
      };
      setItineraries([newTrip, ...itineraries]);
    }
    setActiveTab('home');
    resetForm();
  };

  const resetForm = () => {
    setTripTitle(''); setDestination(''); setStartDate(new Date().toISOString().split('T')[0]); 
    setEndDate(new Date().toISOString().split('T')[0]); setVibe([]); setEditingTripId(null);
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

  const toggleVibe = (val: string) => {
    if (vibe.includes(val)) {
      setVibe(vibe.filter(v => v !== val));
    } else {
      setVibe([...vibe, val]);
    }
  };

  const updateSelectedTrip = (updated: Itinerary) => {
    setSelectedItinerary(updated);
    setItineraries(itineraries.map(t => t.id === updated.id ? updated : t));
  };

  // --- Components ---

  const ImageLightbox = () => {
    if (!lightboxImage) return null;
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
        onClick={() => setLightboxImage(null)}
      >
        <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full"><X size={32}/></button>
        <img 
          src={lightboxImage} 
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95" 
          alt="Full size" 
        />
      </div>
    );
  };

  const ItinerarySection = () => {
    if (!selectedItinerary) return null;

    const handleAddActivity = (dayId: string) => {
      const { location, time, notes } = activityForm;
      if (!location.trim()) {
        alert('請輸入景點名稱');
        return;
      }
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      const newAct: Activity = { 
        id: Math.random().toString(36).substr(2, 9), 
        location: location.trim(), 
        notes: notes.trim(), 
        time_slot: time.trim(), 
        mapUrl 
      };
      const updated = selectedItinerary.daily_itinerary.map(d => d.id === dayId ? { ...d, activities: [...d.activities, newAct] } : d);
      updateSelectedTrip({ ...selectedItinerary, daily_itinerary: updated });
      setShowActivityForm(null);
      setActivityForm({ location: '', time: '', notes: '' });
    };

    return (
      <div className="space-y-12 pb-20">
        {selectedItinerary.daily_itinerary.map(day => (
          <div key={day.id} className="relative">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <span className="text-[10px] font-black uppercase opacity-70">Day</span>
                <span className="text-2xl font-black">{day.day}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">{day.theme}</h2>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Journey Track</div>
              </div>
              <button 
                onClick={() => {
                  if (showActivityForm === day.id) {
                    setShowActivityForm(null);
                  } else {
                    setShowActivityForm(day.id);
                    setActivityForm({ location: '', time: '', notes: '' });
                  }
                }} 
                className="w-10 h-10 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
              >
                {showActivityForm === day.id ? <X size={20}/> : <Plus size={20}/>}
              </button>
            </div>

            {showActivityForm === day.id && (
              <div className="ml-8 mb-8 p-8 glass-panel rounded-[2.5rem] border-indigo-500/30 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-2"><MapPin size={20} className="text-indigo-400"/> 新增行程</h3>
                  <button onClick={() => setShowActivityForm(null)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">景點 / 地點名稱</label>
                    <input 
                      value={activityForm.location} 
                      onChange={e => setActivityForm({...activityForm, location: e.target.value})} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="輸入目的地 (如: 日本/東京/淺草寺)"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">預計時間</label>
                      <input 
                        value={activityForm.time} 
                        onChange={e => setActivityForm({...activityForm, time: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="14:00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">備註資訊</label>
                    <textarea 
                      value={activityForm.notes} 
                      onChange={e => setActivityForm({...activityForm, notes: e.target.value})} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none" 
                      placeholder="輸入備註，如門票價格、注意事項等..."
                    />
                  </div>
                  <button 
                    onClick={() => handleAddActivity(day.id)} 
                    className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                  >
                    加入計畫
                  </button>
                </div>
              </div>
            )}

            <div className="ml-8 pl-12 border-l-2 border-slate-800 space-y-6">
              {day.activities.length === 0 ? <p className="text-slate-700 italic text-sm">此日尚未規畫行程...</p> : day.activities.map(act => (
                <div key={act.id} className="group relative bg-slate-900/80 border border-slate-800 p-6 rounded-[2rem] hover:border-indigo-500/40 transition-all">
                  <div className="absolute -left-[58px] top-8 w-4 h-4 rounded-full bg-slate-950 border-4 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-indigo-400 font-black"><Clock size={16}/> {act.time_slot}</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        const newAct = { ...act, id: Math.random().toString(36).substr(2, 9) };
                        const updated = selectedItinerary.daily_itinerary.map(d => d.id === day.id ? { ...d, activities: [...d.activities, newAct] } : d);
                        updateSelectedTrip({ ...selectedItinerary, daily_itinerary: updated });
                      }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400"><Copy size={14}/></button>
                      <button onClick={() => {
                        const targetDay = prompt(`移動至第幾天？ (1-${selectedItinerary.trip_summary.total_days})`);
                        const dayNum = parseInt(targetDay || '');
                        if (isNaN(dayNum) || dayNum < 1 || dayNum > selectedItinerary.trip_summary.total_days) return;
                        const updated = selectedItinerary.daily_itinerary.map(d => {
                          if (d.id === day.id) return { ...d, activities: d.activities.filter(a => a.id !== act.id) };
                          if (d.day === dayNum) return { ...d, activities: [...d.activities, act] };
                          return d;
                        });
                        updateSelectedTrip({ ...selectedItinerary, daily_itinerary: updated });
                      }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400"><Move size={14}/></button>
                      <button onClick={() => {
                        const loc = prompt('修改地點名稱:', act.location);
                        if (loc) {
                          const updated = selectedItinerary.daily_itinerary.map(d => d.id === day.id ? { ...d, activities: d.activities.map(a => a.id === act.id ? { ...a, location: loc, mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` } : a) } : d);
                          updateSelectedTrip({ ...selectedItinerary, daily_itinerary: updated });
                        }
                      }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400"><Edit2 size={14}/></button>
                      <button onClick={() => {
                        const updated = selectedItinerary.daily_itinerary.map(d => d.id === day.id ? { ...d, activities: d.activities.filter(a => a.id !== act.id) } : d);
                        updateSelectedTrip({ ...selectedItinerary, daily_itinerary: updated });
                      }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{act.location}</h3>
                  {act.notes && <p className="text-slate-400 text-sm bg-slate-950/50 p-3 rounded-xl mb-4 border-l-4 border-indigo-600/30">{act.notes}</p>}
                  <div className="flex gap-3">
                    <a href={act.mapUrl} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"><Navigation size={14}/> 導航</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PackingSection = () => {
    if (!selectedItinerary) return null;
    const predefined = ['票券', '重要文件', '藥品'];
    const usedCategories = Array.from(new Set(selectedItinerary.packing_list.map(i => i.category)));
    const [newItemName, setNewItemName] = useState('');
    const [cat, setCat] = useState('票券');
    const [customCat, setCustomCat] = useState('');

    const addItem = () => {
      if (!newItemName) return;
      const finalCat = cat === '自定義名稱' ? customCat || '其他' : cat;
      const item: PackingItem = { id: Date.now().toString(), name: newItemName, checked: false, category: finalCat };
      updateSelectedTrip({ ...selectedItinerary, packing_list: [...selectedItinerary.packing_list, item] });
      setNewItemName('');
    };

    return (
      <div className="space-y-10">
        <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">項目名稱</label>
            <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="行李清單項目..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">分類</label>
            <select value={cat} onChange={e => setCat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 font-bold outline-none">
              {predefined.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="自定義名稱">自定義名稱</option>
            </select>
          </div>
          {cat === '自定義名稱' && (
            <div className="w-full md:w-48 space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">自定義分類</label>
              <input value={customCat} onChange={e => setCustomCat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 font-bold outline-none" placeholder="輸入分類" />
            </div>
          )}
          <button onClick={addItem} className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-600/20 mb-[1px]"><Plus/></button>
        </div>
        
        {usedCategories.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
            <p className="text-slate-600 font-bold italic">目前尚無行李清單項目，快去新增吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {usedCategories.map(c => {
              const items = selectedItinerary.packing_list.filter(i => i.category === c);
              return (
                <div key={c} className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> {c}</h3>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} onClick={() => {
                        const updated = selectedItinerary.packing_list.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i);
                        updateSelectedTrip({ ...selectedItinerary, packing_list: updated });
                      }} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800/50 group transition-all">
                        <div className="flex items-center gap-4">
                          {item.checked ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-slate-700" />}
                          <span className={`font-bold ${item.checked ? 'line-through text-slate-600' : 'text-slate-200'}`}>{item.name}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); updateSelectedTrip({ ...selectedItinerary, packing_list: selectedItinerary.packing_list.filter(i => i.id !== item.id) }); }} className="text-slate-800 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={18}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const TransportSection = () => {
    if (!selectedItinerary) return null;
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [expandedImgId, setExpandedImgId] = useState<string | null>(null);

    const initialForm: Omit<TransportInfo, 'id'> = { 
      type: '飛機', detail: '', time: '', date: new Date().toISOString().split('T')[0], cost: 0, currency: 'TWD', 
      flightNumber: '', gate: '', seat: '', arrivalTime: '', terminal: '', arrivalTerminal: '',
      pickupDate: '', returnDate: '', pickupTime: '', returnTime: '', pickupLocation: '', returnLocation: '', isSameLocation: false,
      images: [] 
    };
    const [form, setForm] = useState(initialForm);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updated = selectedItinerary.transports.map(t => t.id === id ? { ...t, images: [...(t.images || []), base64] } : t);
        updateSelectedTrip({ ...selectedItinerary, transports: updated });
      };
      reader.readAsDataURL(file);
    };

    const save = () => {
      const payload = { ...form };
      if (form.type === '租車' && form.isSameLocation) {
        payload.returnLocation = form.pickupLocation;
      }

      if (editId) {
        const updated = selectedItinerary.transports.map(t => t.id === editId ? { ...payload, id: editId } : t);
        updateSelectedTrip({ ...selectedItinerary, transports: updated as TransportInfo[] });
      } else {
        const newItem: TransportInfo = { id: Date.now().toString(), ...payload as TransportInfo };
        updateSelectedTrip({ ...selectedItinerary, transports: [...selectedItinerary.transports, newItem] });
      }
      setIsAdding(false);
      setEditId(null);
      setForm(initialForm);
    };

    const renderTicketCard = (t: TransportInfo) => {
      const isFlight = t.type === '飛機';
      const isCar = t.type === '租車';
      const isMetro = t.type === '地鐵';
      const isBus = t.type === '巴士';

      const config = {
        label: isFlight ? 'STARLUX STYLE' : isCar ? 'RENTAL CAR' : isMetro ? 'METRO TICKET' : 'BUS VOYAGE',
        icon: isFlight ? Plane : isCar ? Car : isMetro ? TrainFront : Bus,
        primaryColor: isFlight ? '#a18a5f' : isCar ? '#3b82f6' : isMetro ? '#10b981' : '#f59e0b',
        secondaryColor: isFlight ? 'rgba(161, 138, 95, 0.2)' : isCar ? 'rgba(59, 130, 246, 0.2)' : isMetro ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
        gradient: isFlight ? 'from-[#1c2a41] to-[#0a0f18]' : isCar ? 'from-[#0f172a] to-[#020617]' : isMetro ? 'from-[#064e3b] to-[#020617]' : 'from-[#78350f] to-[#020617]'
      };

      const TicketIcon = config.icon;

      return (
        <div className={`bg-gradient-to-br ${config.gradient} border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all relative group`} style={{ borderColor: `${config.primaryColor}4D` }}>
          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
            <button onClick={() => { setEditId(t.id); setForm(t); setIsAdding(true); }} className="p-3 bg-slate-800/80 rounded-xl text-slate-400 hover:text-white transition-all"><Edit2 size={16}/></button>
            <button onClick={() => updateSelectedTrip({ ...selectedItinerary, transports: selectedItinerary.transports.filter(x => x.id !== t.id) })} className="p-3 bg-slate-800/80 rounded-xl text-slate-400 hover:text-red-400 transition-all"><Trash2 size={16}/></button>
          </div>

          <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: config.secondaryColor, borderColor: `${config.primaryColor}33` }}>
            <div className="flex items-center gap-3 font-black italic tracking-tighter" style={{ color: config.primaryColor }}><TicketIcon size={20}/> {config.label}</div>
            <div className="text-xs font-black tracking-widest uppercase opacity-70" style={{ color: config.primaryColor }}>{isFlight ? t.flightNumber || 'JX-001' : t.type}</div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-10">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{isCar ? t.pickupLocation?.split(' ')[0] || 'PICKUP' : t.detail.split('-')[0]?.trim() || 'ORIGIN'}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{isCar ? 'Pickup Place' : 'Origin'}</div>
              </div>
              <div className="flex-1 px-10 relative flex flex-col items-center">
                <div className="w-full border-t-2 border-dashed relative" style={{ borderColor: `${config.primaryColor}4D` }}>
                  <TicketIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: config.primaryColor }} size={24}/>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white">{isCar ? t.returnLocation?.split(' ')[0] || 'RETURN' : t.detail.split('-')[1]?.trim() || 'DEST'}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{isCar ? 'Return Place' : 'Destination'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-800 pt-8">
              <div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isCar ? 'Pickup Date' : 'Date'}</div><div className="text-lg font-black text-white">{isCar ? t.pickupDate : t.date}</div></div>
              <div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isCar ? 'Pickup Time' : 'Time'}</div><div className="text-lg font-black text-white">{isCar ? t.pickupTime : t.time}</div></div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isFlight ? 'Trm / Gate' : isCar ? 'Rental Days' : 'Terminal'}</div>
                <div className="text-lg font-black" style={{ color: config.primaryColor }}>
                  {isFlight ? `${t.terminal || '-'}/${t.gate || '-'}` : isCar ? calculateDays(t.pickupDate || '', t.returnDate || '') : t.terminal || '-'}
                </div>
              </div>
              <div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cost</div><div className="text-lg font-black text-white">{t.currency} {t.cost}</div></div>
            </div>
          </div>

          <div className="border-t border-slate-800 bg-black/20">
            <button 
              onClick={() => setExpandedImgId(expandedImgId === t.id ? null : t.id)}
              className="w-full py-4 flex items-center justify-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
            >
              {expandedImgId === t.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              電子票券 / 憑證 ({(t.images?.length || 0)})
            </button>
            {expandedImgId === t.id && (
              <div className="p-6 border-t border-slate-800 animate-in slide-in-from-top-2">
                <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
                  <label className="w-24 h-24 bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 cursor-pointer hover:border-indigo-500 transition-all flex-shrink-0">
                    <ImageIcon size={20}/>
                    <span className="text-[8px] font-bold mt-1 uppercase">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImage(e, t.id)} />
                  </label>
                  {t.images?.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-800 flex-shrink-0 group/img shadow-lg cursor-zoom-in" onClick={() => setLightboxImage(img)}>
                      <img src={img} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-all">
                        <Maximize2 className="text-white opacity-0 group-hover/img:opacity-100 transition-all" size={20}/>
                      </div>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        const updated = selectedItinerary.transports.map(tr => tr.id === t.id ? { ...tr, images: tr.images?.filter((_, i) => i !== idx) } : tr);
                        updateSelectedTrip({ ...selectedItinerary, transports: updated });
                      }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-all"><X size={10}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-10 pb-20">
        <div className="flex justify-end">
          <button onClick={() => { setIsAdding(!isAdding); setEditId(null); setForm(initialForm); }} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-600/20">
            {isAdding ? <X size={20}/> : <Plus size={20}/>} {isAdding ? '取消' : '新增交通資訊'}
          </button>
        </div>

        {isAdding && (
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-indigo-500/20 shadow-2xl animate-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">類型</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none">
                  <option value="飛機">飛機</option><option value="地鐵">地鐵</option><option value="巴士">巴士</option><option value="租車">租車</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase">{form.type === '租車' ? '租車公司名稱' : '路線/詳細 (如: TPE - NRT)'}</label>
                <input value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" placeholder={form.type === '租車' ? 'Toyota Rent a Car' : '東京成田機場-上野站'} />
              </div>

              {form.type === '飛機' && (
                <>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">航班編號</label><input value={form.flightNumber} onChange={e => setForm({ ...form, flightNumber: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="JX-001" /></div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">出發/抵達航廈</label><div className="flex gap-2"><input placeholder="T1" value={form.terminal} onChange={e => setForm({ ...form, terminal: e.target.value })} className="w-1/2 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /><input placeholder="T2" value={form.arrivalTerminal} onChange={e => setForm({ ...form, arrivalTerminal: e.target.value })} className="w-1/2 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div></div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">登機門 / 座位</label><div className="flex gap-2"><input placeholder="A1" value={form.gate} onChange={e => setForm({ ...form, gate: e.target.value })} className="w-1/2 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /><input placeholder="12A" value={form.seat} onChange={e => setForm({ ...form, seat: e.target.value })} className="w-1/2 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div></div>
                </>
              )}

              {form.type === '租車' && (
                <>
                  <div className="space-y-2 md:col-span-1"><label className="text-xs font-black text-slate-500 uppercase">借車地點</label><input value={form.pickupLocation} onChange={e => setForm({ ...form, pickupLocation: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="成田機場第二航廈店" /></div>
                  <div className="space-y-2 md:col-span-1"><label className="text-xs font-black text-slate-500 uppercase">還車地點</label><input disabled={form.isSameLocation} value={form.isSameLocation ? form.pickupLocation : form.returnLocation} onChange={e => setForm({ ...form, returnLocation: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none disabled:opacity-50" placeholder="同借車地點" /></div>
                  <div className="flex items-center gap-2 md:col-span-1 pt-8 px-4">
                    <input type="checkbox" checked={form.isSameLocation} onChange={e => setForm({...form, isSameLocation: e.target.checked})} className="w-5 h-5 rounded-md bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-600" />
                    <span className="text-sm font-bold text-slate-400">同借車地點</span>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">借車日期/時間</label><div className="flex gap-2"><input type="date" value={form.pickupDate} onChange={e => setForm({ ...form, pickupDate: e.target.value })} className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-4 font-bold outline-none text-sm" /><input value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} className="w-1/3 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-4 font-bold outline-none text-sm" placeholder="10:00" /></div></div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">還車日期/時間</label><div className="flex gap-2"><input type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-4 font-bold outline-none text-sm" /><input value={form.returnTime} onChange={e => setForm({ ...form, returnTime: e.target.value })} className="w-1/3 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-4 font-bold outline-none text-sm" placeholder="10:00" /></div></div>
                </>
              )}

              {form.type !== '租車' && (
                <>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">出發日期</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-white" /></div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">出發時間</label><input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="14:00" /></div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">預估抵達時間</label><input value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="18:30" /></div>
                  {form.type !== '飛機' && <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">搭乘月台/航站</label><input value={form.terminal} onChange={e => setForm({ ...form, terminal: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="2號月台" /></div>}
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">金額 / 幣別</label>
                <div className="flex gap-2">
                  <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" />
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value as any })} className="w-1/3 bg-slate-950 border border-slate-800 rounded-2xl px-2 py-4 font-bold outline-none">
                    <option>TWD</option><option>JPY</option><option>USD</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={save} className="w-full py-5 bg-indigo-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-600/20">{editId ? '儲存修改' : '確認加入行程'}</button>
          </div>
        )}

        <div className="space-y-12">
          {['飛機', '地鐵', '巴士', '租車'].map(cat => {
            const list = selectedItinerary.transports.filter(t => t.type === cat);
            if (list.length === 0) return null;
            return (
              <div key={cat} className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> {cat}</h3>
                <div className="grid grid-cols-1 gap-8">
                  {list.map(t => renderTicketCard(t))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ConcertSection = () => {
    if (!selectedItinerary) return null;
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    const initialForm: Omit<ConcertInfo, 'id'> = {
      artist: '', venue: '', date: selectedItinerary.startDate, merchTime: '', entryTime: '', startTime: '', seat: '', 
      ticketCost: 0, merchCost: 0, currency: 'TWD', notes: '', checklist: [
        { id: '1', name: '票券', checked: false }, { id: '2', name: '證件', checked: false }, { id: '3', name: '手燈', checked: false }, { id: '4', name: '應援物', checked: false }
      ], imageUrl: ''
    };
    const [form, setForm] = useState(initialForm);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    };

    const groupedByMonth = useMemo(() => {
      const grouped: Record<string, ConcertInfo[]> = {};
      selectedItinerary.concerts.forEach(c => {
        const date = new Date(c.date);
        const monthKey = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
        if (!grouped[monthKey]) grouped[monthKey] = [];
        grouped[monthKey].push(c);
      });
      Object.keys(grouped).forEach(k => {
        grouped[k].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
      return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
    }, [selectedItinerary.concerts]);

    const save = () => {
      if (editId) {
        const updated = selectedItinerary.concerts.map(c => c.id === editId ? { ...form, id: editId } : c);
        updateSelectedTrip({ ...selectedItinerary, concerts: updated as ConcertInfo[] });
      } else {
        const newItem: ConcertInfo = { id: Date.now().toString(), ...form as ConcertInfo, venueMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.venue || '')}` };
        updateSelectedTrip({ ...selectedItinerary, concerts: [...selectedItinerary.concerts, newItem] });
      }
      setIsAdding(false);
      setEditId(null);
      setForm(initialForm);
    };

    return (
      <div className="space-y-10 pb-20">
        <div className="flex justify-end">
          <button onClick={() => { setIsAdding(!isAdding); setEditId(null); setForm(initialForm); }} className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-violet-600/20 flex items-center gap-2 transition-all hover:bg-violet-500">
            {isAdding ? <X size={20}/> : <Plus size={20}/>} {isAdding ? '取消' : '新增演唱會'}
          </button>
        </div>

        {(isAdding || editId) && (
          <div className="glass-panel p-10 rounded-[3rem] border-violet-500/20 space-y-8 animate-in slide-in-from-bottom-5">
            <h3 className="text-2xl font-black text-white flex items-center gap-3"><Music className="text-violet-400"/> {editId ? '修改' : '新增'}演唱會資訊</h3>
            <div className="flex flex-col md:flex-row gap-8">
               <label className="w-48 h-64 bg-slate-950 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 cursor-pointer overflow-hidden relative flex-shrink-0 group hover:border-violet-500/50 transition-all">
                 {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <><Camera size={40}/><span className="text-xs font-black mt-2 uppercase tracking-widest">Event Photo</span></>}
                 <input type="file" className="hidden" onChange={handleImage} />
               </label>
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2"><label className="text-xs font-black text-slate-500 uppercase">藝人 / 活動名稱</label><input value={form.artist} onChange={e => setForm({ ...form, artist: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">活動日期</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-white" /></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">場館地點</label><input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">座位編號</label><input value={form.seat} onChange={e => setForm({ ...form, seat: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">幣別選擇</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none">
                    <option>TWD</option><option>JPY</option><option>USD</option>
                  </select>
                </div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">周邊販售</label><input value={form.merchTime} onChange={e => setForm({ ...form, merchTime: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-xs" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">進場時間</label><input value={form.entryTime} onChange={e => setForm({ ...form, entryTime: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-xs" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">開演時間</label><input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-xs" /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">門票金額</label><input type="number" value={form.ticketCost} onChange={e => setForm({ ...form, ticketCost: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
              <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase">預計周邊金額</label><input type="number" value={form.merchCost} onChange={e => setForm({ ...form, merchCost: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
              <div className="md:col-span-2 space-y-2"><label className="text-xs font-black text-slate-500 uppercase">備註 (票券、手燈、應援物...)</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none h-24" /></div>
            </div>
            <button onClick={save} className="w-full py-5 bg-violet-600 text-white font-black text-xl rounded-3xl shadow-xl shadow-violet-600/30">{editId ? '儲存修改' : '確認加入行程'}</button>
          </div>
        )}

        <div className="space-y-16">
          {groupedByMonth.map(([month, list]) => (
            <div key={month} className="space-y-8">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black text-white tracking-tighter">{month}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent"></div>
              </div>
              <div className="space-y-6">
                {list.map(c => {
                  const isExpanded = expandedId === c.id;
                  return (
                    <div key={c.id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden transition-all hover:border-violet-500/40 shadow-xl">
                      <div 
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="flex flex-col md:flex-row cursor-pointer"
                      >
                        <div 
                          className="w-full md:w-48 h-48 bg-slate-950 flex-shrink-0 relative overflow-hidden cursor-zoom-in"
                          onClick={(e) => {
                            if (c.imageUrl) {
                              e.stopPropagation();
                              setLightboxImage(c.imageUrl);
                            }
                          }}
                        >
                           {c.imageUrl ? (
                             <>
                               <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                               <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all">
                                 <Maximize2 className="text-white opacity-0 hover:opacity-100 transition-all" size={24}/>
                               </div>
                             </>
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-900"><Music size={64}/></div>
                           )}
                           <div className="absolute top-4 left-4 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                             {c.date.split('-').slice(1).join('/')}
                           </div>
                        </div>
                        <div className="flex-1 p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-2xl font-black text-white mb-2">{c.artist}</h4>
                              <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                                <span className="flex items-center gap-1.5"><MapPin size={14}/> {c.venue}</span>
                                <span className="flex items-center gap-1.5"><Layout size={14}/> {c.seat}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <button onClick={(e) => { e.stopPropagation(); setEditId(c.id); setForm(c); setIsAdding(true); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><Edit2 size={18}/></button>
                               <button onClick={(e) => { e.stopPropagation(); updateSelectedTrip({ ...selectedItinerary, concerts: selectedItinerary.concerts.filter(x => x.id !== c.id) }); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-400"><Trash2 size={18}/></button>
                               <div className="p-3 text-slate-700">{isExpanded ? <ChevronUp/> : <ChevronDown/>}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <span className="text-violet-400 font-black tracking-widest text-lg">{c.currency} {(c.ticketCost + c.merchCost).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Estimated Total</span>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                              <div className="text-center">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">周邊販售</div>
                                <div className="text-lg font-black text-white">{c.merchTime || '--:--'}</div>
                              </div>
                              <div className="text-center border-x border-slate-800">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">進場時間</div>
                                <div className="text-lg font-black text-violet-400">{c.entryTime || '--:--'}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">開演時間</div>
                                <div className="text-lg font-black text-white">{c.startTime || '--:--'}</div>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                             <div className="space-y-4">
                               <div className="flex justify-between items-center border-b border-slate-800/50 pb-2"><span className="text-sm text-slate-500 font-bold">座位號碼</span><span className="font-black text-white">{c.seat}</span></div>
                               <div className="flex justify-between items-center border-b border-slate-800/50 pb-2"><span className="text-sm text-slate-500 font-bold">門票金額</span><span className="font-black text-white">{c.currency} {c.ticketCost.toLocaleString()}</span></div>
                               <div className="flex justify-between items-center border-b border-slate-800/50 pb-2"><span className="text-sm text-slate-500 font-bold">周邊預算</span><span className="font-black text-white">{c.currency} {c.merchCost.toLocaleString()}</span></div>
                             </div>
                             <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800 h-full">
                               <div className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><ListChecks size={14}/> 應援物清單</div>
                               <div className="flex flex-wrap gap-2">
                                  {c.checklist.map(item => (
                                    <div key={item.id} onClick={() => {
                                      const updated = selectedItinerary.concerts.map(conc => conc.id === c.id ? { ...conc, checklist: conc.checklist.map(cli => cli.id === item.id ? { ...cli, checked: !cli.checked } : cli) } : conc);
                                      updateSelectedTrip({ ...selectedItinerary, concerts: updated });
                                    }} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${item.checked ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'}`}>
                                      {item.name}
                                    </div>
                                  ))}
                               </div>
                             </div>
                           </div>
                           {c.notes && (
                             <div className="bg-violet-950/10 p-5 rounded-2xl border-l-4 border-violet-600 mb-6">
                               <div className="text-[10px] font-black text-violet-400 uppercase mb-1">備註資訊</div>
                               <p className="text-slate-400 text-sm whitespace-pre-wrap">{c.notes}</p>
                             </div>
                           )}
                           <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.venue)}`} target="_blank" className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 text-white rounded-2xl font-black shadow-xl shadow-violet-600/20 hover:bg-violet-500 transition-all"><Navigation size={18}/> 場館導航</a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ShoppingSection = () => {
    if (!selectedItinerary) return null;
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const initialForm: Omit<ShoppingItem, 'id'> = { 
      name: '', price: 0, currency: 'TWD', quantity: 1, priority: '重要必買', 
      date: new Date().toISOString().split('T')[0],
      imageUrl: '', locationUrl: '', link: '', checked: false 
    };
    const [form, setForm] = useState(initialForm);

    const priorities: ShoppingItem['priority'][] = ['重要必買', '不買沒關係', '在地美食'];

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    };

    const save = () => {
      if (editId) {
        const updated = selectedItinerary.shopping_list.map(s => s.id === editId ? { ...form, id: editId } : s);
        updateSelectedTrip({ ...selectedItinerary, shopping_list: updated as ShoppingItem[] });
      } else {
        const newItem: ShoppingItem = { id: Date.now().toString(), ...form as ShoppingItem };
        updateSelectedTrip({ ...selectedItinerary, shopping_list: [...selectedItinerary.shopping_list, newItem] });
      }
      setIsAdding(false);
      setEditId(null);
      setForm(initialForm);
    };

    return (
      <div className="space-y-10 pb-20">
        <div className="flex justify-end">
          <button onClick={() => { setIsAdding(!isAdding); setEditId(null); setForm(initialForm); }} className="bg-pink-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-pink-600/20 flex items-center gap-2">
            {isAdding ? <X size={20}/> : <Plus size={20}/>} {isAdding ? '取消' : '新增清單'}
          </button>
        </div>

        {(isAdding || editId) && (
          <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-pink-500/20">
            <div className="flex flex-col md:flex-row gap-10">
               <label className="w-48 h-48 bg-slate-950 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 cursor-pointer overflow-hidden relative flex-shrink-0 group hover:border-pink-500/50 transition-all">
                 {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <><ImageIcon size={40}/><span className="text-xs font-black mt-2 uppercase tracking-widest">Image</span></>}
                 <input type="file" className="hidden" onChange={handleImage} />
               </label>
               <div className="flex-1 space-y-8">
                 <div className="space-y-3">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest">名稱</label>
                   <input placeholder="商品或美食名稱..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-pink-500" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">分類標籤</label>
                      <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none appearance-none cursor-pointer">
                        <option>重要必買</option><option>不買沒關係</option><option>在地美食</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">消費日期</label>
                      <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-white" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">幣別</label>
                      <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none appearance-none cursor-pointer">
                        <option>TWD</option><option>JPY</option><option>USD</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">金額 (單個)</label>
                      <input type="number" placeholder="金額" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">數量</label>
                      <input type="number" placeholder="數量" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" />
                    </div>
                 </div>

                 <div className="space-y-3">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest">購買地點 / 連結</label>
                   <input placeholder="哪裡買？ (地點或連結)" value={form.locationUrl} onChange={e => setForm({...form, locationUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold outline-none" />
                 </div>
               </div>
            </div>
            <button onClick={save} className="w-full py-6 bg-pink-600 text-white font-black text-xl rounded-3xl shadow-xl shadow-pink-600/30 active:scale-[0.98] transition-all">{editId ? '儲存更新' : '加入清單'}</button>
          </div>
        )}

        <div className="space-y-12">
          {priorities.map(prio => {
            const list = selectedItinerary.shopping_list.filter(s => s.priority === prio);
            if (list.length === 0) return null;
            return (
              <div key={prio} className="space-y-6">
                <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 ${prio === '重要必買' ? 'text-pink-500' : prio === '在地美食' ? 'text-orange-400' : 'text-slate-500'}`}>
                   <span className={`w-2 h-2 rounded-full ${prio === '重要必買' ? 'bg-pink-500' : prio === '在地美食' ? 'bg-orange-400' : 'bg-slate-500'}`}></span> {prio}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {list.map(item => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex gap-5 items-center group relative transition-all hover:border-pink-500/20">
                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                        <button onClick={() => { setEditId(item.id); setForm(item); setIsAdding(true); }} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-pink-400"><Edit2 size={16}/></button>
                        <button onClick={() => updateSelectedTrip({...selectedItinerary, shopping_list: selectedItinerary.shopping_list.filter(x => x.id !== item.id)})} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                      <div 
                        className="w-24 h-24 bg-slate-950 rounded-[1.5rem] overflow-hidden border border-slate-800 flex-shrink-0 shadow-inner cursor-zoom-in group/img relative"
                        onClick={() => item.imageUrl && setLightboxImage(item.imageUrl)}
                      >
                        {item.imageUrl ? (
                          <>
                            <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100">
                              <Maximize2 size={20} className="text-white"/>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-900">{prio === '在地美食' ? <Utensils size={32}/> : <ShoppingBag size={32}/>}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="text-xl font-black text-white truncate">{item.name}</h4>
                        </div>
                        <div className="flex flex-col gap-0.5 text-sm font-bold">
                          <div className="text-slate-500 text-[10px] mb-1">消費日期: {item.date}</div>
                          <div className="text-pink-400">單價: {item.currency} {item.price.toLocaleString()} <span className="text-slate-600 text-[10px] ml-1">x {item.quantity}</span></div>
                          <div className="text-white text-lg font-black mt-1">
                             總計: {item.currency} {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                        {item.locationUrl && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationUrl)}`} target="_blank" className="inline-flex items-center gap-1.5 text-[10px] text-indigo-400 font-black mt-3 hover:underline group/link">
                            <Navigation size={12} className="group-hover/link:translate-x-0.5 transition-all"/> 查看地點
                          </a>
                        )}
                      </div>
                      <div onClick={() => {
                        const updated = selectedItinerary.shopping_list.map(s => s.id === item.id ? { ...s, checked: !s.checked } : s);
                        updateSelectedTrip({ ...selectedItinerary, shopping_list: updated });
                      }} className="cursor-pointer p-4 transition-transform active:scale-90">
                        {item.checked ? <CheckCircle2 className="text-green-500" size={28}/> : <Circle className="text-slate-800" size={28}/>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ExpensesSection = () => {
    if (!selectedItinerary) return null;
    const [expandedCat, setExpandedCat] = useState<string | null>(null);
    
    const totalsByCurrency: Record<Currency, number> = { TWD: 0, JPY: 0, USD: 0 };
    
    selectedItinerary.transports.forEach(t => totalsByCurrency[t.currency] += t.cost);
    selectedItinerary.concerts.forEach(c => totalsByCurrency[c.currency] += (c.ticketCost + c.merchCost));
    // ONLY include checked shopping items in calculation
    selectedItinerary.shopping_list.filter(s => s.checked).forEach(s => totalsByCurrency[s.currency] += (s.price * s.quantity));

    const categories = [
      { id: 'transport', label: '交通運輸', icon: Plane, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      { id: 'concert', label: '追星資訊', icon: Music, color: 'text-violet-400', bg: 'bg-violet-500/10' },
      { id: 'shopping', label: '購物筆記', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-500/10' }
    ];

    const getItemsForCategory = (id: string) => {
      if (id === 'transport') return selectedItinerary.transports.map(t => ({ 
        name: `(${t.type}) ${t.detail}`, 
        amount: t.cost, 
        currency: t.currency,
        date: t.pickupDate || t.date || 'TBD'
      }));
      if (id === 'concert') return selectedItinerary.concerts.map(c => ({ 
        name: c.artist, 
        amount: c.ticketCost + c.merchCost, 
        currency: c.currency,
        date: c.date
      }));
      if (id === 'shopping') return selectedItinerary.shopping_list
        .filter(s => s.checked) // ONLY include checked shopping items in breakdown
        .map(s => ({ 
          name: s.name, 
          amount: s.price * s.quantity, 
          currency: s.currency,
          date: s.date || 'TBD'
        }));
      return [];
    };

    return (
      <div className="space-y-12 pb-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20"><Wallet size={24}/></div>
              <h3 className="text-2xl font-black text-white">預算統計表 (已選項目)</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(totalsByCurrency).map(([cur, amount]) => (
                <div key={cur} className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total {cur}</div>
                   <div className={`text-4xl font-black ${amount > 0 ? 'text-white' : 'text-slate-800'}`}>{amount.toLocaleString()}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           {categories.map(cat => {
              const curTotals: Record<string, number> = { TWD: 0, JPY: 0, USD: 0 };
              const catItems = getItemsForCategory(cat.id);
              catItems.forEach(i => curTotals[i.currency] += i.amount);
              const isExpanded = expandedCat === cat.id;

              return (
                <div key={cat.id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden transition-all hover:bg-slate-900">
                  <div 
                    onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                    className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer"
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={`${cat.bg} ${cat.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center`}>
                        <cat.icon size={28}/>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white">{cat.label}</h4>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">詳細預算明細</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-6 w-full md:w-auto">
                      {Object.entries(curTotals).map(([cur, amt]) => amt > 0 && (
                        <div key={cur} className="text-right">
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cur}</div>
                          <div className={`text-xl font-black ${cat.color}`}>{amt.toLocaleString()}</div>
                        </div>
                      ))}
                      {!Object.values(curTotals).some(v => v > 0) && <span className="text-slate-800 font-black tracking-widest uppercase text-xs">No Data</span>}
                      <div className="p-2 text-slate-700">{isExpanded ? <ChevronUp/> : <ChevronDown/>}</div>
                    </div>
                  </div>

                  {isExpanded && catItems.length > 0 && (
                    <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                       <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-800 space-y-3">
                         {catItems.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-900 last:border-0 hover:bg-white/5 px-4 rounded-xl transition-all">
                             <span className="text-slate-400 font-bold">
                               <span className="text-indigo-400 mr-2">({item.date})</span>
                               {item.name}
                             </span>
                             <span className="text-white font-black">{item.currency} {item.amount.toLocaleString()}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              );
           })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-10">
      <ImageLightbox />
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
                    <SortAsc size={12}/> {homeSortBy === 'date' ? 'Sort by Destination' : 'Sort by Date'}
                  </button>
                </div>
              </div>
              <button onClick={() => { resetForm(); setActiveTab('create'); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95"><Plus/> 新增旅程</button>
            </div>
            {itineraries.length === 0 ? <div className="text-center py-20 opacity-20 font-black text-3xl uppercase tracking-tighter">No Voyages Yet</div> : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sortedItineraries.map(trip => (
                  <div key={trip.id} onClick={() => { setSelectedItinerary(trip); setSubTab('itinerary'); setActiveTab('view'); }} className="group bg-slate-900 rounded-[3rem] p-10 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[20rem] shadow-xl">
                    <div className="absolute top-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-all z-10 translate-y-2 group-hover:translate-y-0">
                      <button onClick={(e) => startEditing(trip, e)} className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 hover:text-indigo-400"><Edit2 size={20}/></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(trip.id); }} className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 hover:text-red-400"><Trash2 size={20}/></button>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-indigo-500/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400"><MapPin size={32}/></div>
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
                      <ChevronRight className="text-slate-800 group-hover:text-indigo-500 transition-all"/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="py-12 max-w-2xl mx-auto">
            <button onClick={() => setActiveTab('home')} className="mb-10 flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-indigo-400 transition-colors"><ArrowLeft size={16}/> Back to home</button>
            <div className="glass-panel p-12 rounded-[3.5rem] shadow-2xl space-y-10 border-white/5">
              <div className="flex items-center gap-5">
                <div className="bg-indigo-600 p-4 rounded-[1.5rem] shadow-xl shadow-indigo-600/20">{editingTripId ? <Edit2 className="text-white"/> : <Plus className="text-white"/>}</div>
                <h2 className="text-4xl font-black text-white tracking-tighter">{editingTripId ? '編輯旅程' : '新計畫'}</h2>
              </div>
              <form onSubmit={handleSaveTrip} className="space-y-8">
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
                <button onClick={() => setActiveTab('home')} className="mb-6 flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-indigo-400 transition-colors"><ArrowLeft size={16}/> Return Home</button>
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
                   <item.icon size={20}/><span className="text-sm">{item.label}</span>
                 </button>
               ))}
            </div>

            <div className="animate-in fade-in duration-700 slide-in-from-bottom-5">
              {subTab === 'itinerary' && <ItinerarySection />}
              {subTab === 'packing' && <PackingSection />}
              {subTab === 'transport' && <TransportSection />}
              {subTab === 'concert' && <ConcertSection />}
              {subTab === 'shopping' && <ShoppingSection />}
              {subTab === 'expenses' && <ExpensesSection />}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="glass-panel relative w-full max-w-sm p-10 rounded-[3rem] border-red-500/20 shadow-2xl text-center space-y-8 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto shadow-inner"><AlertTriangle size={40}/></div>
             <div className="space-y-2">
               <h3 className="text-2xl font-black text-white">確定刪除旅程？</h3>
               <p className="text-slate-500 font-bold text-sm">此動作將會抹除該次旅遊的所有內容，且無法還原。</p>
             </div>
             <div className="flex flex-col gap-3">
               <button onClick={() => {
                 setItineraries(itineraries.filter(t => t.id !== deleteConfirmId));
                 setDeleteConfirmId(null);
                 if (selectedItinerary?.id === deleteConfirmId) setActiveTab('home');
               }} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] font-black transition-all">狠心刪除</button>
               <button onClick={() => setDeleteConfirmId(null)} className="w-full py-5 bg-slate-800 text-slate-400 rounded-[2rem] font-black">再想一下</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
