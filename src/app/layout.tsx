import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'LifePlan Sim - ライフプランシミュレーター',
  description: '住宅ローン控除2025年ルールに対応した、複数住宅プラン比較シミュレーターです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex h-screen overflow-hidden bg-white text-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          {children}
        </main>
      </body>
    </html>
  );
}
