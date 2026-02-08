
import React, { useState } from 'react';
import { Plane, Music, ShoppingBag, Wallet, ChevronUp, ChevronDown } from 'lucide-react';
import { Itinerary, Currency } from '../../types';

interface ExpensesSectionProps {
    itinerary: Itinerary;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = ({ itinerary }) => {
    const [expandedCat, setExpandedCat] = useState<string | null>(null);

    const totalsByCurrency: Record<Currency, number> = { TWD: 0, JPY: 0, USD: 0 };

    itinerary.transports.forEach(t => totalsByCurrency[t.currency] += t.cost);
    itinerary.concerts.forEach(c => totalsByCurrency[c.currency] += (c.ticketCost + c.merchCost));
    // ONLY include checked shopping items in calculation
    itinerary.shopping_list.filter(s => s.checked).forEach(s => totalsByCurrency[s.currency] += (s.price * s.quantity));

    const categories = [
        { id: 'transport', label: '交通運輸', icon: Plane, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { id: 'concert', label: '追星資訊', icon: Music, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { id: 'shopping', label: '購物筆記', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-500/10' }
    ];

    const getItemsForCategory = (id: string) => {
        if (id === 'transport') return itinerary.transports.map(t => ({
            name: `(${t.type}) ${t.detail}`,
            amount: t.cost,
            currency: t.currency,
            date: t.pickupDate || t.date || 'TBD'
        }));
        if (id === 'concert') return itinerary.concerts.map(c => ({
            name: c.artist,
            amount: c.ticketCost + c.merchCost,
            currency: c.currency,
            date: c.date
        }));
        if (id === 'shopping') return itinerary.shopping_list
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
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20"><Wallet size={24} /></div>
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
                                        <cat.icon size={28} />
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
                                    <div className="p-2 text-slate-700">{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
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

export default ExpensesSection;
