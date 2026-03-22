import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '儿童识字小报生成器',
  description: 'AI 驱动的儿童识字小报生成工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
