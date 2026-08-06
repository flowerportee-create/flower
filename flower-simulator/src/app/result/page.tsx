import type { Metadata } from 'next';

import { ResultView } from '@/components/result/ResultView';
import { shopConfig } from '@/config/shop';

export const metadata: Metadata = {
  title: `あなたの装花プラン | ${shopConfig.appName}`,
};

export default function ResultPage() {
  return <ResultView />;
}
