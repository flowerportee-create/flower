'use client';

import { BudgetInput } from '@/components/ui/BudgetInput';
import { ChoiceGroup, Field } from '@/components/ui/FormControls';
import { flexibilityLabels, taxTypeLabels, toOptions, triStateLabels } from '@/lib/labels';
import { useField } from '@/lib/useField';
import type { BudgetFlexibility, TaxType, TriState } from '@/types';

/** STEP 3: 予算 */
export function Step3Budget() {
  const [inputMode, setInputMode] = useField('budget.inputMode');
  const [amount, setAmount] = useField('budget.amount');
  const [rangeId, setRangeId] = useField('budget.rangeId');
  const [taxType, setTaxType] = useField('budget.taxType');
  const [includesSetupFee, setIncludesSetupFee] = useField('budget.includesSetupFee');
  const [includesRemovalFee, setIncludesRemovalFee] = useField('budget.includesRemovalFee');
  const [flexibility, setFlexibility] = useField('budget.flexibility');

  return (
    <section className="space-y-6">
      <BudgetInput
        value={{ inputMode, amount, rangeId }}
        onModeChange={setInputMode}
        onAmountChange={setAmount}
        onRangeChange={setRangeId}
      />

      <Field label="税込／税別">
        <ChoiceGroup<TaxType>
          ariaLabel="税込／税別"
          options={toOptions(taxTypeLabels)}
          value={taxType}
          onChange={setTaxType}
          columns={3}
        />
      </Field>

      <Field
        label="搬入設営費を予算に含みますか"
        hint="「含む」を選ぶと、予算配分に搬入・設営関連費が計上されます。"
      >
        <ChoiceGroup<TriState>
          ariaLabel="搬入設営費を予算に含むか"
          options={toOptions(triStateLabels)}
          value={includesSetupFee}
          onChange={setIncludesSetupFee}
          columns={3}
        />
      </Field>

      <Field
        label="撤去費を予算に含みますか"
        hint="「含む」を選ぶと、予算配分に撤去関連費が計上されます。"
      >
        <ChoiceGroup<TriState>
          ariaLabel="撤去費を予算に含むか"
          options={toOptions(triStateLabels)}
          value={includesRemovalFee}
          onChange={setIncludesRemovalFee}
          columns={3}
        />
      </Field>

      <Field label="予算の柔軟性">
        <ChoiceGroup<Exclude<BudgetFlexibility, ''>>
          ariaLabel="予算の柔軟性"
          options={toOptions(flexibilityLabels)}
          value={flexibility}
          onChange={setFlexibility}
          columns={1}
        />
      </Field>
    </section>
  );
}
