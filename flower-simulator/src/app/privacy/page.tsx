import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/LegalPage';
import { shopConfig } from '@/config/shop';

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${shopConfig.appName}`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="プライバシーポリシー"
      sections={shopConfig.privacyPolicy}
      note={`本文の変更は src/config/shop.ts の privacyPolicy から行えます。／${shopConfig.shopName}`}
    />
  );
}
