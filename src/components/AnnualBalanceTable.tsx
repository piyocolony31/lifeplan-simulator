'use client';

import { useState } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { Info, X } from 'lucide-react';

const CALC_DOCS: Record<string, { title: string, formula: string, note: string }> = {
    'netWorth': {
        title: '総資産 (純資産)',
        formula: '金融資産残高 + 不動産価値 - ローン残債',
        note: 'あなたの純粋な資産価値の合計です。賃貸の場合は金融資産残高と一致します。'
    },
    'totalAssets': {
        title: '金融資産残高',
        formula: '前年残高 + 今年の収支 + 運用益',
        note: '預貯金や投資信託などの流動資産の合計です。'
    },
    'propertyValue': {
        title: '不動産価値',
        formula: '土地評価額 + (建物評価額 × 残存耐用年数比率)',
        note: '建物の減価償却を考慮した現在の物件価値（時価）の目安です。'
    },
    'disposableIncome': {
        title: '手取り収入',
        formula: '額面年収 - (社会保険料 + 所得税 + 住民税) + 住宅ローン控除',
        note: '実際に自由に使えるお金です。住宅ローン控除は還付金として収入に加算されます。'
    },
    'livingExpenses': {
        title: '基本生活費',
        formula: '設定した月額生活費 × 12ヶ月 × インフレ率累計',
        note: '住居費以外の日常の生活コストです。物価上昇を考慮しています。'
    },
    'housingExpenses': {
        title: '住居費合計',
        formula: 'ローン返済額 + 維持費(管理・修繕・税・保険) or 家賃 + 更新料',
        note: '住居にかかるすべてのコストの年間合計です。'
    },
    'mortgageBalance': {
        title: 'ローン残債',
        formula: '前年残高 - 今年の元金返済額',
        note: '金融機関に対する借入金の未返済残高です。'
    },
    'mortgageDeduction': {
        title: '住宅ローン控除額',
        formula: 'Min(ローン残高×0.7%, 所得税 + 住民税上限)',
        note: '2025年税制に基づき、所得税と住民税（上限9.75万円）から控除されます。'
    },
    'otherExpenses': {
        title: '個別イベント支出',
        formula: '各プランで設定したライフイベント費用の合計',
        note: '車の買い替えやリフォームなど、そのプラン特有の支出です。'
    },
    'commonEventExpenses': {
        title: '共通イベント支出',
        formula: '全プラン共通で設定したライフイベント費用の合計',
        note: '教育費や結婚式など、住居に関わらず発生する支出です。'
    },
    'investmentReturn': {
        title: '運用益',
        formula: '(年初資産 + 今年収支/2) × 運用利回り',
        note: '資産運用による利益です。毎月の積み立て効果を考慮して計算されます。'
    }
};

export default function AnnualBalanceTable() {
    const { plans, _hasHydrated } = usePlanStore();
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [infoKey, setInfoKey] = useState<string | null>(null);

    if (!_hasHydrated) return null;

    const visiblePlans = plans.filter((p) => p.isVisible);
    if (visiblePlans.length === 0) return null;

    const activePlan = visiblePlans.find((p) => p.id === activeTab) || visiblePlans[0];

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col relative">
            <div className="p-5 border-b bg-slate-50/50">
                <h3 className="font-bold text-slate-800">年ごとの収支詳細 (エクスポートデータ)</h3>
            </div>

            {/* ヘルプポップオーバー */}
            {infoKey && CALC_DOCS[infoKey] && (
                <div className="absolute top-20 right-5 left-5 md:left-auto md:w-80 bg-slate-800 text-white p-6 rounded-2xl shadow-2xl z-50 border border-slate-700 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-blue-400 text-sm uppercase tracking-wider">{CALC_DOCS[infoKey].title}</h4>
                        <button onClick={() => setInfoKey(null)} className="text-slate-400 hover:text-white transition-colors p-1 -mr-2">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">計算式</div>
                            <div className="text-sm font-mono bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 text-blue-100">
                                {CALC_DOCS[infoKey].formula}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">説明</div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {CALC_DOCS[infoKey].note}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    総資産_万円
                                    <button onClick={() => setInfoKey('netWorth')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    金融資産残高_万円
                                    <button onClick={() => setInfoKey('totalAssets')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    不動産価値_万円
                                    <button onClick={() => setInfoKey('propertyValue')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    手取り収入_万円
                                    <button onClick={() => setInfoKey('disposableIncome')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    基本生活費_万円
                                    <button onClick={() => setInfoKey('livingExpenses')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    住居費合計_万円
                                    <button onClick={() => setInfoKey('housingExpenses')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    ローン残債_万円
                                    <button onClick={() => setInfoKey('mortgageBalance')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    住宅ローン控除額_万円
                                    <button onClick={() => setInfoKey('mortgageDeduction')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold text-wrap min-w-[120px]">
                                <div className="flex items-center justify-end gap-1">
                                    個別イベント支出_万円
                                    <button onClick={() => setInfoKey('otherExpenses')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold text-wrap min-w-[120px]">
                                <div className="flex items-center justify-end gap-1">
                                    共通イベント支出_万円
                                    <button onClick={() => setInfoKey('commonEventExpenses')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                    運用益_万円
                                    <button onClick={() => setInfoKey('investmentReturn')} className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </th>
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
                                <td className={`px-4 py-3 ${res.otherExpenses > 0 ? 'text-red-500 font-bold' : ''}`}>
                                    {Math.round(res.otherExpenses).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span>
                                </td>
                                <td className={`px-4 py-3 ${res.commonEventExpenses > 0 ? 'text-red-500 font-bold' : ''}`}>
                                    {Math.round(res.commonEventExpenses).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span>
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
