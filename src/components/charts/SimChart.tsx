'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from 'recharts';
import { usePlanStore } from '@/store/usePlanStore';
import { LayoutPanelLeft, LineChart as LineChartIcon, PieChart, Activity } from 'lucide-react';

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#7c3aed'];
const BREAKDOWN_COLORS: Record<string, string> = {
    mortgagePayment: '#3b82f6',
    maintenanceFee: '#60a5fa',
    repairReserve: '#93c5fd',
    fixedAssetTax: '#facc15',
    insuranceFee: '#f87171',
    rent: '#ef4444',
    renewalFee: '#b91c1c',
    livingExpenses: '#10b981',
    otherExpenses: '#64748b'
};

const BREAKDOWN_LABELS: Record<string, string> = {
    mortgagePayment: '住宅ローン',
    maintenanceFee: '管理費',
    repairReserve: '修繕積立',
    fixedAssetTax: '固定資産税',
    insuranceFee: '保険料',
    rent: '家賃',
    renewalFee: '更新料',
    livingExpenses: '基本生活費',
    otherExpenses: 'その他(イベント等)'
};

export default function SimChart() {
    const { plans } = usePlanStore();
    const [chartMode, setChartMode] = useState<'assets' | 'networth' | 'breakdown'>('assets');
    const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
    const [strokeWidth, setStrokeWidth] = useState<number>(2);

    const visiblePlans = plans.filter(p => p.isVisible);
    const selectedPlan = plans.find(p => p.id === selectedPlanId) || visiblePlans[0];

    // 1. 金融資産推移用データの整形
    const assetData = visiblePlans.length > 0
        ? visiblePlans[0].results.map((r, idx) => {
            const dataPoint: any = { age: r.age, year: r.year };
            visiblePlans.forEach((p) => {
                dataPoint[p.name] = Math.round(p.results[idx].totalAssets);
            });
            return dataPoint;
        })
        : [];

    // 2. 純資産推移用データの整形
    const netWorthData = visiblePlans.length > 0
        ? visiblePlans[0].results.map((r, idx) => {
            const dataPoint: any = { age: r.age, year: r.year };
            visiblePlans.forEach((p) => {
                dataPoint[p.name] = Math.round(p.results[idx].netWorth);
            });
            return dataPoint;
        })
        : [];

    // 3. 支出内訳用データの整形
    const breakdownData = selectedPlan
        ? selectedPlan.results.map((r) => ({
            age: r.age,
            year: r.year,
            mortgagePayment: Math.round(r.mortgagePayment),
            maintenanceFee: Math.round(r.maintenanceFee),
            repairReserve: Math.round(r.repairReserve),
            fixedAssetTax: Math.round(r.fixedAssetTax),
            insuranceFee: Math.round(r.insuranceFee),
            rent: Math.round(r.rent),
            renewalFee: Math.round(r.renewalFee),
            livingExpenses: Math.round(r.livingExpenses),
            otherExpenses: Math.round(r.otherExpenses),
        }))
        : [];

    const getChartTitle = () => {
        switch (chartMode) {
            case 'assets': return '金融資産推移の比較';
            case 'networth': return '純資産推移の比較（資産-負債）';
            case 'breakdown': return `支出の内訳: ${selectedPlan?.name}`;
        }
    };

    return (
        <div className="w-full h-[600px] bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        {getChartTitle()}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">単位: 万円</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setChartMode('assets')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'assets' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LineChartIcon size={14} />
                            金融資産
                        </button>
                        <button
                            onClick={() => setChartMode('networth')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'networth' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <PieChart size={14} />
                            純資産
                        </button>
                        <button
                            onClick={() => setChartMode('breakdown')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartMode === 'breakdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutPanelLeft size={14} />
                            支出内訳
                        </button>
                    </div>

                    {/* 線の太さ調整 */}
                    {(chartMode === 'assets' || chartMode === 'networth') && (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <Activity size={12} className="text-slate-400" />
                            <input
                                type="range"
                                min="1"
                                max="6"
                                step="0.5"
                                value={strokeWidth}
                                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                                className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                title="線の太さ"
                            />
                        </div>
                    )}
                </div>
            </div>

            {chartMode === 'breakdown' && (
                <div className="flex gap-2 px-2 overflow-x-auto pb-2 scrollbar-none">
                    {plans.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${selectedPlanId === p.id ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    {(chartMode === 'assets' || chartMode === 'networth') ? (
                        <LineChart data={chartMode === 'assets' ? assetData : netWorthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="age" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label) => `${label}歳の${chartMode === 'assets' ? '金融資産' : '純資産'}`}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                            {visiblePlans.map((p, idx) => (
                                <Line
                                    key={p.id}
                                    type="monotone"
                                    dataKey={p.name}
                                    stroke={COLORS[idx % COLORS.length]}
                                    strokeWidth={strokeWidth}
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                    connectNulls
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    ) : (
                        <AreaChart data={breakdownData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="age" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label) => `${label}歳の年間支出内訳`}
                                formatter={(value: any, name: any) => [value.toLocaleString() + '万', BREAKDOWN_LABELS[name as string] || name]}
                            />
                            <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ paddingBottom: 20 }} />
                            {Object.keys(BREAKDOWN_COLORS).map((key) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={BREAKDOWN_LABELS[key]}
                                    stackId="1"
                                    stroke={BREAKDOWN_COLORS[key]}
                                    fill={BREAKDOWN_COLORS[key]}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
