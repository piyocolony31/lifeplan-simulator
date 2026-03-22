import { usePlanStore } from '@/store/usePlanStore';

/**
 * エクスポートされたCSVファイルからシミュレーション設定を復元します。
 */
export async function importSimulationFromCSV(file: File): Promise<{ success: boolean; message: string }> {
    try {
        const text = await file.text();
        const lines = text.split('\n');

        // CSV末尾のメタデータ行を探す
        const metadataLine = lines.find(l => l.trim().startsWith('# METADATA: '));

        if (!metadataLine) {
            return {
                success: false,
                message: '有効な復元データが見つかりませんでした。最新の「CSV出力」ボタンで出力されたファイルを選択してください。'
            };
        }

        const jsonStr = metadataLine.trim().replace('# METADATA: ', '');
        const data = JSON.parse(jsonStr);

        if (!data.userParams || !data.plans) {
            return {
                success: false,
                message: 'ファイルのデータ形式が正しくありません。'
            };
        }

        // ストアに反映
        usePlanStore.getState().importData(data);

        return {
            success: true,
            message: `${data.plans.length} 件のプランを復元しました。`
        };
    } catch (error) {
        console.error('Import error:', error);
        return {
            success: false,
            message: 'ファイルの読み込み中にエラーが発生しました。'
        };
    }
}
