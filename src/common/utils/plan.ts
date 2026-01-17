import { SUBSCRIPTION_PLANS_MASTER } from "../constance";

export function getPlan(planId: number): { id: number, price: number, maxLinks: number } {
    return SUBSCRIPTION_PLANS_MASTER[`VIP_${planId}`]
}