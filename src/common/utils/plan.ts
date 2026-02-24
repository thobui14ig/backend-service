import { SUBSCRIPTION_PLANS_MASTER } from "../constance";

export function getPlan(planId: number, userId: number | null = null): { id: number, price: number, maxLinks: number } {
    const res =  SUBSCRIPTION_PLANS_MASTER[`VIP_${planId}`]
    if (userId === 4) {
        res.maxLinks = 450
    }

    return res
}