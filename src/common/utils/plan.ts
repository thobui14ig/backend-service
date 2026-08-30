import { SUBSCRIPTION_PLANS_MASTER } from "../constance";

export function getPlan(planId: number, userId: number | null = null): { id: number, price: number, maxLinks: number, maxTiktok: number } {
  const base = SUBSCRIPTION_PLANS_MASTER[`VIP_${planId}`];

  const res = structuredClone(base);

  return res
}