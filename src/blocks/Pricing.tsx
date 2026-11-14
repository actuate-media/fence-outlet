/**
 * Presentational pricing grid. Props are deliberately explicit and typed so
 * `npm run blocks:extract` can derive a component-blocks manifest from them.
 * The section renderer in ../sections/register.tsx adapts a section's stored
 * content to these props.
 */
export interface PricingPlan {
  /** Plan name, e.g. "Starter". */
  name: string;
  /** Display price, e.g. "$29/mo". */
  price: string;
  /** Optional short description shown under the price. */
  description?: string;
}

export interface PricingProps {
  /** Section heading. */
  heading: string;
  /** Plans to display, left to right. */
  plans: PricingPlan[];
}

export function Pricing({ heading, plans }: PricingProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-8 text-center text-3xl font-semibold text-zinc-900">{heading}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-6">
            <h3 className="text-lg font-medium text-zinc-900">{plan.name}</h3>
            <p className="mt-2 text-2xl font-semibold text-violet-600">{plan.price}</p>
            {plan.description ? (
              <p className="mt-2 text-sm text-zinc-600">{plan.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
