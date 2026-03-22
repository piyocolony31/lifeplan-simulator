import {
    X,
    Settings,
    Building2,
    Coins,
    Percent,
    Calendar,
    Home,
    ShieldCheck,
    TrendingUp,
    PlusCircle,
    Trash2
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import { PropertyCategory, HouseholdType, HousingPlanType, LifeEvent } from '@/lib/types';

interface Props {
    planId: string;
    onClose: () => void;
}

export default function PlanDetailEditor({ planId, onClose }: Props) {
    const { plans, updatePlanParams, addLifeEvent, removeLifeEvent } = usePlanStore();
    const plan = plans.find(p => p.id === planId);

    if (!plan) return null;

    const handleChange = (key: string, value: any) => {
        updatePlanParams(planId, { [key]: value });
    };

    const isRent = plan.params.planType === 'RENT';

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* モーダルヘッダー */}
                <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/80">
                    <div className="flex-1 mr-4">
                        <input
                            type="text"
                            value={plan.name}
                            onChange={e => usePlanStore.getState().renamePlan(planId, e.target.value)}
                            className="text-xl font-black text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none w-full"
                        />
                        <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{plan.params.planType}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* モーダルボディ */}
                <div className="px-8 py-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

                    {/* 物件価格とローン設定 */}
                    {!isRent && (
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                    <Coins size={16} /> 購入・ローンの基本
                                </h3>
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-blue-100 flex flex-col items-end">
                                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">実質月額コスト</span>
                                    <div className="text-lg font-black leading-tight">
                                        {Math.round(
                                            (plan.params.loanAmount > 0 ? (plan.results[0].mortgagePayment / 12) : 0) +
                                            ((plan.params.fixedAssetTax + plan.params.managementFee + plan.params.repairReserve + plan.params.insuranceFee) / 12)
                                        ).toLocaleString()} <span className="text-xs font-normal">万円</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">物件価格 (万円)</label>
                                    <input
                                        type="number" value={plan.params.propertyPrice}
                                        onChange={e => handleChange('propertyPrice', Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">頭金 (万円)</label>
                                    <input
                                        type="number" value={plan.params.downPayment}
                                        onChange={e => handleChange('downPayment', Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">借入金額 (万円)</label>
                                    <input
                                        type="number" value={plan.params.loanAmount}
                                        onChange={e => handleChange('loanAmount', Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">返済期間 (年)</label>
                                    <input
                                        type="number" value={plan.params.loanPeriod}
                                        onChange={e => handleChange('loanPeriod', Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-semibold text-slate-600">ローン金利 (%)</label>
                                        <span className="text-sm font-bold text-blue-600">{plan.params.loanInterestRate}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="5" step="0.01"
                                        value={plan.params.loanInterestRate}
                                        onChange={e => handleChange('loanInterestRate', Number(e.target.value))}
                                        className="w-full accent-blue-600"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 資産価値（出口戦略） */}
                    {!isRent && (
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                <TrendingUp size={16} /> 資産評価（出口戦略）
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">土地価値 (万)</label>
                                    <input
                                        type="number" value={plan.params.landValue}
                                        onChange={e => handleChange('landValue', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">建物価値 (万)</label>
                                    <input
                                        type="number" value={plan.params.buildingValue}
                                        onChange={e => handleChange('buildingValue', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">耐用年数 (年)</label>
                                    <input
                                        type="number" value={plan.params.buildingDepreciationYears}
                                        onChange={e => handleChange('buildingDepreciationYears', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ライフイベント設定 */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                <Calendar size={16} /> ライフイベント（一時支出）
                            </h3>
                            <button
                                onClick={() => addLifeEvent(planId, { label: '新しいイベント', year: 2030, cost: 100 })}
                                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 border border-blue-100"
                            >
                                <PlusCircle size={14} /> イベント追加
                            </button>
                        </div>

                        {plan.params.events.length > 0 && (
                            <div className="flex items-center gap-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex-1">イベント名称</span>
                                <span className="w-20 text-center">発生年</span>
                                <span className="w-20 text-center">金額(万)</span>
                                <span className="w-8"></span>
                            </div>
                        )}

                        <div className="space-y-2">
                            {plan.params.events.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed">イベントは登録されていません</p>
                            ) : (
                                plan.params.events.map(event => (
                                    <div key={event.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border hover:border-blue-200 transition-all group">
                                        <input
                                            type="text" value={event.label}
                                            onChange={e => {
                                                const newEvents = plan.params.events.map(ev => ev.id === event.id ? { ...ev, label: e.target.value } : ev);
                                                handleChange('events', newEvents);
                                            }}
                                            className="flex-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="例：車の購入"
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number" value={event.year}
                                                onChange={e => {
                                                    const newEvents = plan.params.events.map(ev => ev.id === event.id ? { ...ev, year: Number(e.target.value) } : ev);
                                                    handleChange('events', newEvents);
                                                }}
                                                className="w-20 bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1.5 text-center"
                                                placeholder="西暦"
                                            />
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number" value={event.cost}
                                                    onChange={e => {
                                                        const newEvents = plan.params.events.map(ev => ev.id === event.id ? { ...ev, cost: Number(e.target.value) } : ev);
                                                        handleChange('events', newEvents);
                                                    }}
                                                    className="w-16 bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1.5 text-center text-red-600"
                                                    placeholder="費用"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400">万</span>
                                            </div>
                                            <button onClick={() => removeLifeEvent(planId, event.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* 賃貸設定 */}
                    {isRent && (
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                    <Home size={16} /> 賃貸条件
                                </h3>
                                <div className="bg-rose-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-rose-100 flex flex-col items-end">
                                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">実質月額コスト</span>
                                    <div className="text-lg font-black leading-tight">
                                        {Math.round(
                                            plan.params.monthlyRent + (plan.params.monthlyRent * plan.params.renewalFeeRate / 24)
                                        ).toLocaleString()} <span className="text-xs font-normal">万円</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">月額家賃 (万円)</label>
                                    <input
                                        type="number" value={plan.params.monthlyRent}
                                        onChange={e => handleChange('monthlyRent', Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">更新料 (ヶ月分)</label>
                                    <input
                                        type="number" step="0.5" value={plan.params.renewalFeeRate}
                                        onChange={e => handleChange('renewalFeeRate', Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-50 border rounded-xl"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 住宅ローン控除向け属性 */}
                    {!isRent && (
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                <ShieldCheck size={16} /> 2025年 住宅ローン控除設定
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-600">物件種別・環境性能</label>
                                    <select
                                        value={plan.params.propertyCategory}
                                        onChange={e => handleChange('propertyCategory', e.target.value as PropertyCategory)}
                                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl appearance-none"
                                    >
                                        <option value="LONG_LIFE">長期優良住宅・低炭素住宅</option>
                                        <option value="ZEH">ZEH水準省エネ住宅</option>
                                        <option value="ENERGY_SAVE">省エネ基準適合住宅</option>
                                        <option value="STANDARD">その他の一般住宅</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <input
                                        type="checkbox" id="household" checked={plan.params.householdType === 'CHILD_REARING_OR_YOUNG'}
                                        onChange={e => handleChange('householdType', e.target.checked ? 'CHILD_REARING_OR_YOUNG' : 'STANDARD')}
                                        className="w-5 h-5 accent-blue-600"
                                    />
                                    <label htmlFor="household" className="text-sm text-slate-700 font-medium">
                                        子育て世帯 または 若者夫婦世帯 (控除上限額が上乗せされます)
                                    </label>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 維持費 */}
                    {!isRent && (
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                <Building2 size={16} /> 維持費用 (年間)
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-600">固定資産税 (万)</label>
                                    <input type="number" value={plan.params.fixedAssetTax} onChange={e => handleChange('fixedAssetTax', Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-600">管理費 (万)</label>
                                    <input type="number" value={plan.params.managementFee} onChange={e => handleChange('managementFee', Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="font-semibold text-slate-600">修繕積立 (万)</label>
                                        <span className="text-[9px] text-blue-600 font-bold">5年毎 +{plan.params.repairReserveStepUpRate}%</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" value={plan.params.repairReserve} onChange={e => handleChange('repairReserve', Number(e.target.value))} className="flex-1 px-4 py-2 border rounded-xl" />
                                        <input type="number" value={plan.params.repairReserveStepUpRate} onChange={e => handleChange('repairReserveStepUpRate', Number(e.target.value))} className="w-20 px-2 py-2 border rounded-xl text-center bg-slate-50" title="上昇率" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-600">火災/医療保険等 (万)</label>
                                    <input type="number" value={plan.params.insuranceFee} onChange={e => handleChange('insuranceFee', Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl" />
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* モーダルフッター */}
                <div className="px-8 py-6 border-t bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm"
                    >
                        設定を適用して閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
