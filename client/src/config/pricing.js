export const PLANS = {
  Basic: {
    name: 'Basic',
    tagline: 'All the core features, minus the fluff.',
    monthlyPrice: 0,
    quarterlyPrice: 0,
    downloads: '2 documents',
    uploadSize: '10MB',
    prioritySupport: false,
    adFree: false
  },
  Pro: {
    name: 'Pro',
    tagline: 'Level up with more downloads.',
    monthlyPrice: 300,
    quarterlyPrice: 765,
    downloads: '5 documents',
    uploadSize: '20MB',
    prioritySupport: true,
    adFree: false,
    popular: true
  },
  Ultra: {
    name: 'Ultra',
    tagline: 'Support the mission — unlock everything.',
    monthlyPrice: 500,
    quarterlyPrice: 1275,
    downloads: 'Unlimited',
    uploadSize: '50MB',
    prioritySupport: true,
    adFree: true
  }
};

export const getPlanPrice = (plan, billingCycle) => {
  const config = PLANS[plan];
  if (!config) return { price: '0', period: '/ month', note: 'Always free' };

  if (plan === 'Basic') {
    return { price: '0', period: '/ month', note: 'Always free' };
  }

  if (billingCycle === 'Monthly') {
    return {
      price: String(config.monthlyPrice),
      period: '/ month',
      note: 'Billed monthly'
    };
  }

  const quarterlyMonthly = Math.round(config.quarterlyPrice / 3);
  const savings = config.monthlyPrice * 3 - config.quarterlyPrice;

  return {
    price: String(quarterlyMonthly),
    period: '/ month',
    note: `Billed Rs. ${config.quarterlyPrice.toLocaleString()} quarterly (Save Rs. ${savings})`
  };
};
