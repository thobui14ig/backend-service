export const SUBSCRIPTION_PLANS_MASTER = {
  VIP_1: { id: 1, price: 600_000, maxLinks: 400, maxPage: 30, maxTiktok: 30 },
  VIP_2: { id: 2, price: 1_100_000, maxLinks: 850, maxPage: 65, maxTiktok: 65 },
  VIP_3: { id: 3, price: null, maxLinks: null, maxPage: null, maxTiktok: null  },
} as const;
