
import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Maximize2, Plane, Car, TrainFront, Bus } from 'lucide-react';
import { Itinerary, TransportInfo } from '../../types';

interface TransportSectionProps {
    itinerary: Itinerary;
    onUpdate: (updated: Itinerary) => void;
    onImageClick: (img: string) => void;
}

const TransportSection: React.FC<TransportSectionProps> = ({ itinerary, onUpdate, onImageClick }) => {
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
            const updated = itinerary.transports.map(t => t.id === id ? { ...t, images: [...(t.images || []), base64] } : t);
            onUpdate({ ...itinerary, transports: updated });
        };
        reader.readAsDataURL(file);
    };

    const save = () => {
        const payload = { ...form };
        if (form.type === '租車' && form.isSameLocation) {
            payload.returnLocation = form.pickupLocation;
        }

        if (editId) {
            const updated = itinerary.transports.map(t => t.id === editId ? { ...payload, id: editId } : t);
            onUpdate({ ...itinerary, transports: updated as TransportInfo[] });
        } else {
            const newItem: TransportInfo = { id: Date.now().toString(), ...payload as TransportInfo };
            onUpdate({ ...itinerary, transports: [...itinerary.transports, newItem] });
        }
        setIsAdding(false);
        setEditId(null);
        setForm(initialForm);
    };

    const calculateDays = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const diff = e.getTime() - s.getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
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
                    <button onClick={() => { setEditId(t.id); setForm(t); setIsAdding(true); }} className="p-3 bg-slate-800/80 rounded-xl text-slate-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => onUpdate({ ...itinerary, transports: itinerary.transports.filter(x => x.id !== t.id) })} className="p-3 bg-slate-800/80 rounded-xl text-slate-400 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                </div>

                <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: config.secondaryColor, borderColor: `${config.primaryColor}33` }}>
                    <div className="flex items-center gap-3 font-black italic tracking-tighter" style={{ color: config.primaryColor }}><TicketIcon size={20} /> {config.label}</div>
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
                                <TicketIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: config.primaryColor }} size={24} />
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
                        {expandedImgId === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        電子票券 / 憑證 ({(t.images?.length || 0)})
                    </button>
                    {expandedImgId === t.id && (
                        <div className="p-6 border-t border-slate-800 animate-in slide-in-from-top-2">
                            <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
                                <label className="w-24 h-24 bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 cursor-pointer hover:border-indigo-500 transition-all flex-shrink-0">
                                    <ImageIcon size={20} />
                                    <span className="text-[8px] font-bold mt-1 uppercase">Upload</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImage(e, t.id)} />
                                </label>
                                {t.images?.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-800 flex-shrink-0 group/img shadow-lg cursor-zoom-in" onClick={() => onImageClick(img)}>
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-all">
                                            <Maximize2 className="text-white opacity-0 group-hover/img:opacity-100 transition-all" size={20} />
                                        </div>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            const updated = itinerary.transports.map(tr => tr.id === t.id ? { ...tr, images: tr.images?.filter((_, i) => i !== idx) } : tr);
                                            onUpdate({ ...itinerary, transports: updated });
                                        }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-all"><X size={10} /></button>
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
                    {isAdding ? <X size={20} /> : <Plus size={20} />} {isAdding ? '取消' : '新增交通資訊'}
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
                                    <input type="checkbox" checked={form.isSameLocation} onChange={e => setForm({ ...form, isSameLocation: e.target.checked })} className="w-5 h-5 rounded-md bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-600" />
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
                    const list = itinerary.transports.filter(t => t.type === cat);
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

export default TransportSection;
