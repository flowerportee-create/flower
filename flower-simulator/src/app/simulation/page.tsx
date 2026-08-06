import type { Metadata } from 'next';

import { SimulationForm } from '@/components/simulation/SimulationForm';
import { shopConfig } from '@/config/shop';

export const metadata: Metadata = {
  title: `装花プランを作成する | ${shopConfig.appName}`,
};

export default function SimulationPage() {
  return <SimulationForm />;
}
