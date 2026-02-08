
import React, { useState } from 'react';
import { Plus, X, CheckCircle2, Circle } from 'lucide-react';
import { Itinerary, PackingItem } from '../../types';

interface PackingSectionProps {
    itinerary: Itinerary;
    onUpdate: (updated: Itinerary) => void;
}

const PackingSection: React.FC<PackingSectionProps> = ({ itinerary, onUpdate }) => {
    const predefined = ['重要文件', '託運', '手提'];
    const usedCategories = Array.from(new Set(itinerary.packing_list.map(i => i.category)));
    const [newItemName, setNewItemName] = useState('');
    const [cat, setCat] = useState('重要文件');
    const [customCat, setCustomCat] = useState('');

    const addItem = () => {
        if (!newItemName) return;
        const finalCat = cat === '自定義名稱' ? customCat || '其他' : cat;
        const item: PackingItem = { id: Date.now().toString(), name: newItemName, checked: false, category: finalCat };
        onUpdate({ ...itinerary, packing_list: [...itinerary.packing_list, item] });
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
                <button onClick={addItem} className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-600/20 mb-[1px]"><Plus /></button>
            </div>

            {usedCategories.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
                    <p className="text-slate-600 font-bold italic">目前尚無行李清單項目，快去新增吧！</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {usedCategories.map(c => {
                        const items = itinerary.packing_list.filter(i => i.category === c);
                        return (
                            <div key={c} className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> {c}</h3>
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <div key={item.id} onClick={() => {
                                            const updated = itinerary.packing_list.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i);
                                            onUpdate({ ...itinerary, packing_list: updated });
                                        }} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800/50 group transition-all">
                                            <div className="flex items-center gap-4">
                                                {item.checked ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-slate-700" />}
                                                <span className={`font-bold ${item.checked ? 'line-through text-slate-600' : 'text-slate-200'}`}>{item.name}</span>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); onUpdate({ ...itinerary, packing_list: itinerary.packing_list.filter(i => i.id !== item.id) }); }} className="text-slate-800 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={18} /></button>
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

export default PackingSection;
