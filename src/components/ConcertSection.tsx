
import React, { useState, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Camera, Music, MapPin, Layout, ChevronUp, ChevronDown, ListChecks, Navigation, Maximize2 } from 'lucide-react';
import { Itinerary, ConcertInfo } from '../../types';

interface ConcertSectionProps {
    itinerary: Itinerary;
    onUpdate: (updated: Itinerary) => void;
    onImageClick: (img: string) => void;
}

const ConcertSection: React.FC<ConcertSectionProps> = ({ itinerary, onUpdate, onImageClick }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const initialForm: Omit<ConcertInfo, 'id'> = {
        artist: '', venue: '', date: itinerary.startDate, merchTime: '', entryTime: '', startTime: '', seat: '',
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
        itinerary.concerts.forEach(c => {
            const date = new Date(c.date);
            const monthKey = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
            if (!grouped[monthKey]) grouped[monthKey] = [];
            grouped[monthKey].push(c);
        });
        Object.keys(grouped).forEach(k => {
            grouped[k].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
        return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
    }, [itinerary.concerts]);

    const save = () => {
        if (editId) {
            const updated = itinerary.concerts.map(c => c.id === editId ? { ...form, id: editId } : c);
            onUpdate({ ...itinerary, concerts: updated as ConcertInfo[] });
        } else {
            const newItem: ConcertInfo = { id: Date.now().toString(), ...form as ConcertInfo, venueMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.venue || '')}` };
            onUpdate({ ...itinerary, concerts: [...itinerary.concerts, newItem] });
        }
        setIsAdding(false);
        setEditId(null);
        setForm(initialForm);
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex justify-end">
                <button onClick={() => { setIsAdding(!isAdding); setEditId(null); setForm(initialForm); }} className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-violet-600/20 flex items-center gap-2 transition-all hover:bg-violet-500">
                    {isAdding ? <X size={20} /> : <Plus size={20} />} {isAdding ? '取消' : '新增演唱會'}
                </button>
            </div>

            {(isAdding || editId) && (
                <div className="glass-panel p-10 rounded-[3rem] border-violet-500/20 space-y-8 animate-in slide-in-from-bottom-5">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3"><Music className="text-violet-400" /> {editId ? '修改' : '新增'}演唱會資訊</h3>
                    <div className="flex flex-col md:flex-row gap-8">
                        <label className="w-48 h-64 bg-slate-950 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 cursor-pointer overflow-hidden relative flex-shrink-0 group hover:border-violet-500/50 transition-all">
                            {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <><Camera size={40} /><span className="text-xs font-black mt-2 uppercase tracking-widest">Event Photo</span></>}
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
                                                        onImageClick(c.imageUrl);
                                                    }
                                                }}
                                            >
                                                {c.imageUrl ? (
                                                    <>
                                                        <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all">
                                                            <Maximize2 className="text-white opacity-0 hover:opacity-100 transition-all" size={24} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-900"><Music size={64} /></div>
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
                                                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {c.venue}</span>
                                                            <span className="flex items-center gap-1.5"><Layout size={14} /> {c.seat}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditId(c.id); setForm(c); setIsAdding(true); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><Edit2 size={18} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); onUpdate({ ...itinerary, concerts: itinerary.concerts.filter(x => x.id !== c.id) }); }} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-400"><Trash2 size={18} /></button>
                                                        <div className="p-3 text-slate-700">{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
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
                                                        <div className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2"><ListChecks size={14} /> 應援物清單</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {c.checklist.map(item => (
                                                                <div key={item.id} onClick={() => {
                                                                    const updated = itinerary.concerts.map(conc => conc.id === c.id ? { ...conc, checklist: conc.checklist.map(cli => cli.id === item.id ? { ...cli, checked: !cli.checked } : cli) } : conc);
                                                                    onUpdate({ ...itinerary, concerts: updated });
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
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.venue)}`} target="_blank" className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 text-white rounded-2xl font-black shadow-xl shadow-violet-600/20 hover:bg-violet-500 transition-all"><Navigation size={18} /> 場館導航</a>
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

export default ConcertSection;
