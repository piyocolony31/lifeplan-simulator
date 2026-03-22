'use client';

import SimChart from '@/components/charts/SimChart';
import { usePlanStore } from '@/store/usePlanStore';
import { Wallet, Landmark, AlertCircle } from 'lucide-react';

export default function Home() {
  const { plans, _hasHydrated } = usePlanStore();

  if (!_hasHydrated) return null;

  const visiblePlans = plans.filter(p => p.isVisible);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ライフプラン・ダッシュボード</h1>
          <p className="text-slate-500 mt-1">住宅購入と賃貸の将来的な資産推移を比較・検証</p>
        </div>
        <div className="flex gap-4">
          {/* 追加ボタンなどをここに配置可能 */}
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visiblePlans.slice(0, 3).map((plan, idx) => {
          const finalAssets = plan.results.length > 0 ? plan.results[plan.results.length - 1].totalAssets : 0;
          const isPositive = finalAssets > 0;

          return (
            <div key={plan.id} className="bg-white p-5 rounded-2xl border shadow-sm border-l-4" style={{ borderLeftColor: idx === 0 ? '#2563eb' : idx === 1 ? '#dc2626' : '#16a34a' }}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{plan.name}</span>
                {isPositive ? <Wallet size={18} className="text-slate-300" /> : <AlertCircle size={18} className="text-red-400" />}
              </div>
              <div className="text-2xl font-black text-slate-800">
                {Math.round(finalAssets).toLocaleString()} <span className="text-sm font-normal text-slate-500">万円</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">90歳時点の推定残高</p>
            </div>
          );
        })}
      </div>

      {/* メインチャート */}
      <SimChart />

      {/* 詳細比較テーブル */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-slate-50/50">
          <h3 className="font-bold text-slate-800">各プランの数値詳細 (90歳時)</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b">
              <th className="px-6 py-3 font-semibold">プラン名称</th>
              <th className="px-6 py-3 font-semibold text-right">最終資産</th>
              <th className="px-6 py-3 font-semibold text-right">累計住居費</th>
              <th className="px-6 py-3 font-semibold text-right">累計控除額</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visiblePlans.map((plan) => {
              const totalHousingCost = plan.results.reduce((sum, r) => sum + r.housingExpenses, 0);
              const totalDeduction = plan.results.reduce((sum, r) => sum + r.mortgageDeduction, 0);
              const finalAssets = plan.results.length > 0 ? plan.results[plan.results.length - 1].totalAssets : 0;

              return (
                <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{plan.name}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">{Math.round(finalAssets).toLocaleString()} 万</td>
                  <td className="px-6 py-4 text-right text-slate-600">{Math.round(totalHousingCost).toLocaleString()} 万</td>
                  <td className="px-6 py-4 text-right text-green-600">{Math.round(totalDeduction).toLocaleString()} 万</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
