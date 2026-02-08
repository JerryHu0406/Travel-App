
import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Camera, Navigation, Maximize2, CheckCircle2, Circle, ShoppingBag, Utensils, ImageIcon } from 'lucide-react';
import { Itinerary, ShoppingItem } from '../../types';

interface ShoppingSectionProps {
    itinerary: Itinerary;
    onUpdate: (updated: Itinerary) => void;
    onImageClick: (img: string) => void;
}

const ShoppingSection: React.FC<ShoppingSectionProps> = ({ itinerary, onUpdate, onImageClick }) => {
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
            const updated = itinerary.shopping_list.map(s => s.id === editId ? { ...form, id: editId } : s);
            onUpdate({ ...itinerary, shopping_list: updated as ShoppingItem[] });
        } else {
            const newItem: ShoppingItem = { id: Date.now().toString(), ...form as ShoppingItem };
            onUpdate({ ...itinerary, shopping_list: [...itinerary.shopping_list, newItem] });
        }
        setIsAdding(false);
        setEditId(null);
        setForm(initialForm);
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex justify-end">
                <button onClick={() => { setIsAdding(!isAdding); setEditId(null); setForm(initialForm); }} className="bg-pink-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-pink-600/20 flex items-center gap-2">
                    {isAdding ? <X size={20} /> : <Plus size={20} />} {isAdding ? '取消' : '新增清單'}
                </button>
            </div>

            {(isAdding || editId) && (
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-pink-500/20">
                    <div className="flex flex-col md:flex-row gap-10">
                        <label className="w-48 h-48 bg-slate-950 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 cursor-pointer overflow-hidden relative flex-shrink-0 group hover:border-pink-500/50 transition-all">
                            {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <><ImageIcon size={40} /><span className="text-xs font-black mt-2 uppercase tracking-widest">Image</span></>}
                            <input type="file" className="hidden" onChange={handleImage} />
                        </label>
                        <div className="flex-1 space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">名稱</label>
                                <input placeholder="商品或美食名稱..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-pink-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">分類標籤</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none appearance-none cursor-pointer">
                                        <option>重要必買</option><option>不買沒關係</option><option>在地美食</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">消費日期</label>
                                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none text-white" />
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
                                    <input type="number" placeholder="金額" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">數量</label>
                                    <input type="number" placeholder="數量" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">購買地點 / 連結</label>
                                <input placeholder="哪裡買？ (地點或連結)" value={form.locationUrl} onChange={e => setForm({ ...form, locationUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold outline-none" />
                            </div>
                        </div>
                    </div>
                    <button onClick={save} className="w-full py-6 bg-pink-600 text-white font-black text-xl rounded-3xl shadow-xl shadow-pink-600/30 active:scale-[0.98] transition-all">{editId ? '儲存更新' : '加入清單'}</button>
                </div>
            )}

            <div className="space-y-12">
                {priorities.map(prio => {
                    const list = itinerary.shopping_list.filter(s => s.priority === prio);
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
                                            <button onClick={() => { setEditId(item.id); setForm(item); setIsAdding(true); }} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-pink-400"><Edit2 size={16} /></button>
                                            <button onClick={() => onUpdate({ ...itinerary, shopping_list: itinerary.shopping_list.filter(x => x.id !== item.id) })} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                        <div
                                            className="w-24 h-24 bg-slate-950 rounded-[1.5rem] overflow-hidden border border-slate-800 flex-shrink-0 shadow-inner cursor-zoom-in group/img relative"
                                            onClick={(e) => {
                                                if (item.imageUrl) {
                                                    e.stopPropagation();
                                                    onImageClick(item.imageUrl);
                                                }
                                            }}
                                        >
                                            {item.imageUrl ? (
                                                <>
                                                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100">
                                                        <Maximize2 size={20} className="text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-900">{prio === '在地美食' ? <Utensils size={32} /> : <ShoppingBag size={32} />}</div>
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
                                                    <Navigation size={12} className="group-hover/link:translate-x-0.5 transition-all" /> 查看地點
                                                </a>
                                            )}
                                        </div>
                                        <div onClick={() => {
                                            const updated = itinerary.shopping_list.map(s => s.id === item.id ? { ...s, checked: !s.checked } : s);
                                            onUpdate({ ...itinerary, shopping_list: updated });
                                        }} className="cursor-pointer p-4 transition-transform active:scale-90">
                                            {item.checked ? <CheckCircle2 className="text-green-500" size={28} /> : <Circle className="text-slate-800" size={28} />}
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

export default ShoppingSection;
