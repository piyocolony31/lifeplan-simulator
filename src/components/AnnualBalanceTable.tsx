'use client';

import { useState } from 'react';
import { usePlanStore } from '@/store/usePlanStore';

export default function AnnualBalanceTable() {
    const { plans, _hasHydrated } = usePlanStore();
    const [activeTab, setActiveTab] = useState<string | null>(null);

    if (!_hasHydrated) return null;

    const visiblePlans = plans.filter((p) => p.isVisible);
    if (visiblePlans.length === 0) return null;

    const activePlan = visiblePlans.find((p) => p.id === activeTab) || visiblePlans[0];

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-slate-50/50">
                <h3 className="font-bold text-slate-800">年ごとの収支詳細 (エクスポートデータ)</h3>
            </div>

            {/* タブ UI */}
            <div className="flex border-b overflow-x-auto scrollbar-hide">
                {visiblePlans.map((plan) => (
                    <button
                        key={plan.id}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap outline-none transition-colors border-b-2 ${activeTab === plan.id || (!activeTab && activePlan.id === plan.id)
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        onClick={() => setActiveTab(plan.id)}
                    >
                        {plan.name}
                    </button>
                ))}
            </div>

            {/* スクロール可能なデータテーブル */}
            <div className="max-h-96 overflow-y-auto w-full">
                <table className="w-full text-right text-xs md:text-sm whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-50 text-slate-600 shadow-sm z-10 border-b">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-center">西暦</th>
                            <th className="px-4 py-3 font-semibold text-center">年齢</th>
                            <th className="px-4 py-3 font-semibold">総資産_万円</th>
                            <th className="px-4 py-3 font-semibold">金融資産残高_万円</th>
                            <th className="px-4 py-3 font-semibold">不動産価値_万円</th>
                            <th className="px-4 py-3 font-semibold">手取り収入_万円</th>
                            <th className="px-4 py-3 font-semibold">基本生活費_万円</th>
                            <th className="px-4 py-3 font-semibold">住居費合計_万円</th>
                            <th className="px-4 py-3 font-semibold">ローン残債_万円</th>
                            <th className="px-4 py-3 font-semibold">住宅ローン控除額_万円</th>
                            <th className="px-4 py-3 font-semibold text-wrap min-w-[120px]">ライフイベント支出_万円</th>
                            <th className="px-4 py-3 font-semibold">運用益_万円</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-slate-600">
                        {activePlan.results.map((res) => (
                            <tr key={res.year} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 text-center text-slate-800">{res.year}</td>
                                <td className="px-4 py-3 text-center text-slate-800">{res.age}</td>
                                <td className="px-4 py-3 font-bold text-blue-600">{Math.round(res.netWorth).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span></td>
                                <td className="px-4 py-3">{Math.round(res.totalAssets).toLocaleString()} <span className="text-[10px] text-slate-400">万</span></td>
                                <td className="px-4 py-3">{Math.round(res.propertyValue).toLocaleString()} <span className="text-[10px] text-slate-400">万</span></td>
                                <td className="px-4 py-3 font-semibold text-green-600">{Math.round(res.disposableIncome).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span></td>
                                <td className="px-4 py-3 text-red-500">{Math.round(res.livingExpenses).toLocaleString()} <span className="text-[10px] text-slate-400">万</span></td>
                                <td className="px-4 py-3 text-red-500">{Math.round(res.housingExpenses).toLocaleString()} <span className="text-[10px] text-slate-400">万</span></td>
                                <td className="px-4 py-3">{Math.round(res.mortgageBalance).toLocaleString()} <span className="text-[10px] text-slate-400">万</span></td>
                                <td className="px-4 py-3 text-green-600">{Math.round(res.mortgageDeduction).toLocaleString()} <span className="text-[10px] text-slate-400">万</span></td>
                                <td className={`px-4 py-3 ${res.educationExpenses + res.otherExpenses > 0 ? 'text-red-500 font-bold' : ''}`}>
                                    {Math.round(res.educationExpenses + res.otherExpenses).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span>
                                </td>
                                <td className="px-4 py-3 text-green-600">{Math.round(res.investmentReturn).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
