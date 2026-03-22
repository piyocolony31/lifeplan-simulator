import { usePlanStore } from '@/store/usePlanStore';

/**
 * シミュレーション結果をAI分析用のロングフォーマットCSVとしてエクスポートします。
 */
export function exportSimulationToCSV() {
    const plans = usePlanStore.getState().plans;
    if (plans.length === 0) return;

    // AI（LLM）やPandasなどのデータ分析ツールが解釈しやすいように、
    // 1行＝「1つのプランの1年分のデータ」というロングフォーマット（Tidy Data）を採用します。
    const headers = [
        'プラン名',
        '西暦',
        '年齢',
        '総資産_万円',        // netWorth (金融資産 + 不動産価値 - ローン残債)
        '金融資産残高_万円',  // totalAssets
        '不動産価値_万円',    // propertyValue
        '手取り収入_万円',    // disposableIncome
        '基本生活費_万円',    // livingExpenses
        '住居費合計_万円',    // housingExpenses
        'ローン残債_万円',    // mortgageBalance
        '住宅ローン控除額_万円',// mortgageDeduction
        'ライフイベント支出_万円',// educationExpenses + otherExpenses
        '運用益_万円'         // investmentReturn
    ];

    const rows: string[] = [];
    rows.push(headers.join(','));

    plans.forEach(plan => {
        // AIでの比較分析を目的とするため、非表示にしているプランも含めてすべて出力します。
        plan.results.forEach(res => {
            const row = [
                `"${plan.name}"`, // カンマが含まれる可能性を考慮してダブルクオートで囲む
                res.year,
                res.age,
                Math.round(res.netWorth),
                Math.round(res.totalAssets),
                Math.round(res.propertyValue),
                Math.round(res.disposableIncome),
                Math.round(res.livingExpenses),
                Math.round(res.housingExpenses),
                Math.round(res.mortgageBalance),
                Math.round(res.mortgageDeduction),
                Math.round(res.educationExpenses + res.otherExpenses),
                Math.round(res.investmentReturn)
            ];
            rows.push(row.join(','));
        });
    });

    const csvContent = rows.join('\n');

    // インポート復元用のメタデータを末尾に追加（# で始まるコメント行として）
    const metadata = {
        version: '1.0',
        userParams: usePlanStore.getState().userParams,
        plans: plans.map(p => ({
            name: p.name,
            params: p.params
        }))
    };
    const finalContent = `${csvContent}\n\n# METADATA: ${JSON.stringify(metadata)}`;

    // Excelで開いた際の文字化けを防ぐため、BOM (Byte Order Mark) を追加
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), finalContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const today = new Date();
    const formattedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    link.setAttribute('href', url);
    link.setAttribute('download', `lifeplan_simulation_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
