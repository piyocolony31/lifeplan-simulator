'use client';

import { useState } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import {
    Users,
    TrendingUp,
    Settings2,
    Home,
    PlusCircle,
    Eye,
    EyeOff,
    Trash2,
    Settings,
    ChevronRight,
    ShoppingBag,
    Download
} from 'lucide-react';
import PlanDetailEditor from './PlanDetailEditor';

export default function Sidebar() {
    const { userParams, updateUserParams, plans, togglePlanVisibility, removePlan, addPlan, _hasHydrated } = usePlanStore();
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

    if (!_hasHydrated) return null;

    return (
        <aside className="w-80 border-r bg-slate-50 h-screen flex flex-col shadow-xl z-20">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-blue-600 w-7 h-7" />
                    <h1 className="font-black text-xl tracking-tighter text-slate-800">LifePlan Sim</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-6 custom-scrollbar">
                {/* 住宅プラン */}
                <section className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <Home size={14} />
                            Housing Scenarios
                        </div>
                        <button
                            onClick={() => addPlan('NEW_HOUSE', '新しいプラン')}
                            className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-full transition-all active:scale-90"
                        >
                            <PlusCircle size={20} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`group p-4 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md cursor-default ${plan.isVisible ? 'border-blue-100 ring-4 ring-blue-50/50' : 'opacity-50 grayscale'}`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${plan.isVisible ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                        <span className="font-bold text-sm text-slate-700 truncate">{plan.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setEditingPlanId(plan.id)}
                                            className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="設定"
                                        >
                                            <Settings size={14} />
                                        </button>
                                        <button
                                            onClick={() => togglePlanVisibility(plan.id)}
                                            className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title={plan.isVisible ? "非表示" : "表示"}
                                        >
                                            {plan.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={() => removePlan(plan.id)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="削除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    {(() => {
                                        const typeLabels: Record<string, string> = {
                                            'NEW_HOUSE': '新築戸建',
                                            'USED_HOUSE': '中古戸建',
                                            'NEW_CONDO': '新築マンション',
                                            'USED_CONDO': '中古マンション',
                                            'RENT': '賃貸'
                                        };
                                        const label = typeLabels[plan.params.planType] || '不明';

                                        return (
                                            <>
                                                {plan.params.planType === 'RENT' ? (
                                                    <div className="bg-slate-50 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-500">
                                                        <span className="block text-[8px] opacity-70 uppercase tracking-tighter">Rent</span>
                                                        {plan.params.monthlyRent}万
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-500">
                                                        <span className="block text-[8px] opacity-70 uppercase tracking-tighter">Price</span>
                                                        {plan.params.propertyPrice}万
                                                    </div>
                                                )}
                                                <div className="bg-blue-50/50 px-2 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 border border-blue-100/50">
                                                    <span className="block text-[8px] opacity-70 uppercase tracking-tighter text-blue-400">Type</span>
                                                    {label}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 基本情報 */}
                <section className="bg-white p-4 rounded-3xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest px-1">
                        <Users size={14} />
                        Your Profile
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block px-1">現在の年齢</label>
                            <input
                                type="number"
                                value={userParams.currentAge}
                                onChange={(e) => updateUserParams({ currentAge: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-1 px-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">世帯年収 (万円)</label>
                                <button
                                    onClick={() => updateUserParams({ hasSpouse: !userParams.hasSpouse })}
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${userParams.hasSpouse ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    {userParams.hasSpouse ? '配偶者あり' : '単身'}
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <input
                                        type="number"
                                        value={userParams.personalIncome}
                                        onChange={(e) => updateUserParams({ personalIncome: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="本人"
                                    />
                                    <span className="text-[9px] text-slate-400 block px-1">本人</span>
                                </div>
                                {userParams.hasSpouse && (
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="number"
                                            value={userParams.spouseIncome}
                                            onChange={(e) => updateUserParams({ spouseIncome: Number(e.target.value) })}
                                            className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="配偶者"
                                        />
                                        <span className="text-[9px] text-slate-400 block px-1">配偶者</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block px-1">初期資産 (万円)</label>
                            <input
                                type="number"
                                value={userParams.initialAssets}
                                onChange={(e) => updateUserParams({ initialAssets: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* 共通ライフプラン（全プラン共通） */}
                <section className="bg-white p-4 rounded-3xl border shadow-sm space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <PlusCircle size={14} />
                            Common Life Plans
                        </div>
                        <button
                            onClick={() => {
                                const currentYear = new Date().getFullYear();
                                usePlanStore.getState().addCommonEvent({ label: '新しいイベント', year: currentYear, cost: 100 });
                            }}
                            className="p-1 hover:bg-slate-100 rounded-full text-blue-600 transition-colors"
                            title="イベントを追加"
                        >
                            <PlusCircle size={16} />
                        </button>
                    </div>

                    {/* クイック追加ボタン群 */}
                    <div className="grid grid-cols-2 gap-2 px-1">
                        <button
                            onClick={() => {
                                const currentYear = new Date().getFullYear();
                                const { addCommonEvent } = usePlanStore.getState();
                                const presets = [
                                    { label: '出産・育児', offset: 0, cost: 50 },
                                    { label: '幼稚園 (3年)', offset: 3, cost: 50 },
                                    { label: '小学校 (6年)', offset: 6, cost: 30 },
                                    { label: '中学校 (3年)', offset: 12, cost: 50 },
                                    { label: '高校 (3年)', offset: 15, cost: 70 },
                                    { label: '大学 (4年)', offset: 18, cost: 150 },
                                ];
                                presets.forEach(p => addCommonEvent({ label: p.label, year: currentYear + p.offset, cost: p.cost }));
                            }}
                            className="text-[10px] font-bold py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 flex items-center justify-center gap-1"
                        >
                            🎓 子育てセット
                        </button>
                        <button
                            onClick={() => {
                                const currentYear = new Date().getFullYear();
                                usePlanStore.getState().addCommonEvent({ label: '車購入', year: currentYear + 2, cost: 300 });
                            }}
                            className="text-[10px] font-bold py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-1"
                        >
                            🚗 車の購入
                        </button>
                    </div>

                    {/* 共通イベント一覧 (編集可能) */}
                    <div className="space-y-2">
                        {(userParams.commonEvents || []).map((event) => (
                            <div key={event.id} className="flex flex-col gap-1 bg-slate-50 p-2 rounded-xl group relative border border-transparent hover:border-blue-100 transition-all">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={event.label}
                                        onChange={e => usePlanStore.getState().updateCommonEvent(event.id, { label: e.target.value })}
                                        className="flex-1 bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 p-0"
                                    />
                                    <button
                                        onClick={() => usePlanStore.getState().removeCommonEvent(event.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-white rounded-md px-1.5 py-0.5 border">
                                        <input
                                            type="number"
                                            value={event.year}
                                            onChange={e => usePlanStore.getState().updateCommonEvent(event.id, { year: Number(e.target.value) })}
                                            className="w-12 bg-transparent border-none text-[10px] font-mono text-slate-500 p-0 text-center focus:ring-0"
                                        />
                                        <span className="text-[9px] text-slate-300 ml-0.5">年</span>
                                    </div>
                                    <div className="flex items-center bg-white rounded-md px-1.5 py-0.5 border">
                                        <input
                                            type="number"
                                            value={event.cost}
                                            onChange={e => usePlanStore.getState().updateCommonEvent(event.id, { cost: Number(e.target.value) })}
                                            className="w-10 bg-transparent border-none text-[10px] font-bold text-red-500 p-0 text-center focus:ring-0"
                                        />
                                        <span className="text-[9px] text-slate-300 ml-0.5">万</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(userParams.commonEvents || []).length === 0 && (
                            <p className="text-[9px] text-slate-400 italic text-center py-2">共通イベントはありません</p>
                        )}
                    </div>
                </section>

                {/* 基本生活費 */}
                <section className="bg-white p-4 rounded-2xl border shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <ShoppingBag size={14} className="text-blue-500" /> 生活コスト
                    </h3>
                    <div className="space-y-4 px-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 flex justify-between uppercase">
                                <span>基本生活費 (月額)</span>
                                <span className="text-blue-600">{userParams.baseLivingExpenses}万円</span>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="1"
                                value={userParams.baseLivingExpenses}
                                onChange={(e) => updateUserParams({ baseLivingExpenses: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>
                </section>

                {/* 市場予測 */}
                <section className="bg-white p-4 rounded-2xl border shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <TrendingUp size={14} className="text-blue-500" /> 市場予測
                    </h3>
                    <div className="space-y-4 px-1">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">インフレ率</label>
                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{userParams.inflationRate}%</span>
                            </div>
                            <input
                                type="range" min="0" max="5" step="0.1"
                                value={userParams.inflationRate}
                                onChange={(e) => updateUserParams({ inflationRate: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">運用利回り</label>
                                <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{userParams.investmentReturnRate}%</span>
                            </div>
                            <input
                                type="range" min="0" max="10" step="0.1"
                                value={userParams.investmentReturnRate}
                                onChange={(e) => updateUserParams({ investmentReturnRate: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* フッターアクション */}
            <div className="p-4 border-t bg-slate-50 mt-auto shrink-0 z-10">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={async () => {
                            const { exportSimulationToCSV } = await import('@/lib/export');
                            exportSimulationToCSV();
                        }}
                        className="py-3 bg-slate-800 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <Download size={14} className="opacity-70" />
                        CSV出力
                    </button>
                    <label className="py-3 bg-white border border-slate-300 text-slate-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
                        <PlusCircle size={14} className="opacity-70 text-slate-400" />
                        インポート
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const { importSimulationFromCSV } = await import('@/lib/import');
                                const result = await importSimulationFromCSV(file);
                                if (result.success) {
                                    alert(result.message);
                                } else {
                                    alert(result.message);
                                }
                                e.target.value = ''; // リセット
                            }}
                        />
                    </label>
                </div>
            </div>

            {/* モーダル表示 */}
            {editingPlanId && (
                <PlanDetailEditor
                    planId={editingPlanId!}
                    onClose={() => setEditingPlanId(null)}
                />
            )}
        </aside>
    );
}
