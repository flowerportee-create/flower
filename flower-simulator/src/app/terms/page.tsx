import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/LegalPage';
import { shopConfig } from '@/config/shop';

export const metadata: Metadata = {
  title: `利用規約 | ${shopConfig.appName}`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="利用規約"
      sections={shopConfig.termsOfService}
      note={`本文の変更は src/config/shop.ts の termsOfService から行えます。／${shopConfig.shopName}`}
    />
  );
}
