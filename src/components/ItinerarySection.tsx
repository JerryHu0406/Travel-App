
import React, { useState } from 'react';
import { Plus, Clock, Copy, Move, Edit2, Trash2, MapPin, X, Navigation } from 'lucide-react';
import { Itinerary, Activity } from '../../types';

interface ItinerarySectionProps {
    itinerary: Itinerary;
    onUpdate: (updated: Itinerary) => void;
}

const ItinerarySection: React.FC<ItinerarySectionProps> = ({ itinerary, onUpdate }) => {
    const [showActivityForm, setShowActivityForm] = useState<string | null>(null); // dayId
    const [activityForm, setActivityForm] = useState({ location: '', time: '', notes: '' });

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
        const updated = itinerary.daily_itinerary.map(d => d.id === dayId ? { ...d, activities: [...d.activities, newAct] } : d);
        onUpdate({ ...itinerary, daily_itinerary: updated });
        setShowActivityForm(null);
        setActivityForm({ location: '', time: '', notes: '' });
    };

    return (
        <div className="space-y-12 pb-20">
            {itinerary.daily_itinerary.map(day => (
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
                            {showActivityForm === day.id ? <X size={20} /> : <Plus size={20} />}
                        </button>
                    </div>

                    {showActivityForm === day.id && (
                        <div className="ml-8 mb-8 p-8 glass-panel rounded-[2.5rem] border-indigo-500/30 animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white flex items-center gap-2"><MapPin size={20} className="text-indigo-400" /> 新增行程</h3>
                                <button onClick={() => setShowActivityForm(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">景點 / 地點名稱</label>
                                    <input
                                        value={activityForm.location}
                                        onChange={e => setActivityForm({ ...activityForm, location: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="輸入目的地 (如: 日本/東京/淺草寺)"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">預計時間</label>
                                        <input
                                            value={activityForm.time}
                                            onChange={e => setActivityForm({ ...activityForm, time: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="14:00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">備註資訊</label>
                                    <textarea
                                        value={activityForm.notes}
                                        onChange={e => setActivityForm({ ...activityForm, notes: e.target.value })}
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
                                    <div className="flex items-center gap-2 text-indigo-400 font-black"><Clock size={16} /> {act.time_slot}</div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => {
                                            const newAct = { ...act, id: Math.random().toString(36).substr(2, 9) };
                                            const updated = itinerary.daily_itinerary.map(d => d.id === day.id ? { ...d, activities: [...d.activities, newAct] } : d);
                                            onUpdate({ ...itinerary, daily_itinerary: updated });
                                        }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400"><Copy size={14} /></button>
                                        <button onClick={() => {
                                            const targetDay = prompt(`移動至第幾天？ (1-${itinerary.trip_summary.total_days})`);
                                            const dayNum = parseInt(targetDay || '');
                                            if (isNaN(dayNum) || dayNum < 1 || dayNum > itinerary.trip_summary.total_days) return;
                                            const updated = itinerary.daily_itinerary.map(d => {
                                                if (d.id === day.id) return { ...d, activities: d.activities.filter(a => a.id !== act.id) };
                                                if (d.day === dayNum) return { ...d, activities: [...d.activities, act] };
                                                return d;
                                            });
                                            onUpdate({ ...itinerary, daily_itinerary: updated });
                                        }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400"><Move size={14} /></button>
                                        <button onClick={() => {
                                            const loc = prompt('修改地點名稱:', act.location);
                                            if (loc) {
                                                const updated = itinerary.daily_itinerary.map(d => d.id === day.id ? { ...d, activities: d.activities.map(a => a.id === act.id ? { ...a, location: loc, mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` } : a) } : d);
                                                onUpdate({ ...itinerary, daily_itinerary: updated });
                                            }
                                        }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400"><Edit2 size={14} /></button>
                                        <button onClick={() => {
                                            const updated = itinerary.daily_itinerary.map(d => d.id === day.id ? { ...d, activities: d.activities.filter(a => a.id !== act.id) } : d);
                                            onUpdate({ ...itinerary, daily_itinerary: updated });
                                        }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{act.location}</h3>
                                {act.notes && <p className="text-slate-400 text-sm bg-slate-950/50 p-3 rounded-xl mb-4 border-l-4 border-indigo-600/30">{act.notes}</p>}
                                <div className="flex gap-3">
                                    <a href={act.mapUrl} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"><Navigation size={14} /> 導航</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItinerarySection;
