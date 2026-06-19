// ── Meters ────────────────────────────────────────────────────────────────────
export type MeterStatus = "active" | "draft" | "deprecated";
export type MeterType = "COUNT_SUM" | "UNIQUE_COUNT" | "MAX";

export interface Meter {
  id: string;
  label: string;
  apiName: string;
  meterType: MeterType;
  status: MeterStatus;
  modified: string;
}

export const meters: Meter[] = [
  { id: "m1", label: "Input Tokens",       apiName: "input_tokens",       meterType: "COUNT_SUM",    status: "active",     modified: "2024-06-10" },
  { id: "m2", label: "Output Tokens",      apiName: "output_tokens",      meterType: "COUNT_SUM",    status: "active",     modified: "2024-06-10" },
  { id: "m3", label: "API Requests",       apiName: "api_requests",       meterType: "COUNT_SUM",    status: "active",     modified: "2024-06-08" },
  { id: "m4", label: "Unique Models",      apiName: "unique_models",      meterType: "UNIQUE_COUNT", status: "active",     modified: "2024-06-01" },
  { id: "m5", label: "Fine-tune Tokens",   apiName: "finetune_tokens",    meterType: "COUNT_SUM",    status: "draft",      modified: "2024-06-14" },
  { id: "m6", label: "Embedding Tokens",   apiName: "embedding_tokens",   meterType: "COUNT_SUM",    status: "draft",      modified: "2024-06-12" },
  { id: "m7", label: "Legacy Completions", apiName: "legacy_completions", meterType: "COUNT_SUM",    status: "deprecated", modified: "2024-04-01" },
];

export const ingestEvents = [
  { id: "e1", customerId: "cust_acme",  model: "gpt-4o",             provider: "openai",    fine_tuned: false, created: 1718700000, usage: { prompt_tokens: 512,  completion_tokens: 128, total_tokens: 640  } },
  { id: "e2", customerId: "cust_zeta",  model: "claude-3-5-sonnet",  provider: "anthropic", fine_tuned: false, created: 1718700600, usage: { prompt_tokens: 800,  completion_tokens: 200, total_tokens: 1000 } },
  { id: "e3", customerId: "cust_nova",  model: "gpt-3.5-turbo-0125", provider: "openai",    fine_tuned: false, created: 1718701200, usage: { prompt_tokens: 200,  completion_tokens: 80,  total_tokens: 280  } },
  { id: "e4", customerId: "cust_acme",  model: "gemini-1.5-pro",     provider: "google",    fine_tuned: false, created: 1718702000, usage: { prompt_tokens: 1200, completion_tokens: 300, total_tokens: 1500 } },
  { id: "e5", customerId: "cust_ridge", model: "command-r-plus",      provider: "cohere",    fine_tuned: false, created: 1718702800, usage: { prompt_tokens: 400,  completion_tokens: 100, total_tokens: 500  } },
  { id: "e6", customerId: "cust_zeta",  model: "gpt-4o-mini",        provider: "openai",    fine_tuned: true,  created: 1718703600, usage: { prompt_tokens: 350,  completion_tokens: 90,  total_tokens: 440  } },
];

// ── Customers ─────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  externalId: string;
  plan: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  status: "active" | "inactive";
  since: string;
}

export const customers: Customer[] = [
  { id: "c1", name: "Acme Corp",       externalId: "cust_acme",  plan: "Growth",  inputTokens: 48200000, outputTokens: 12100000, totalCost: 1842.50, status: "active",   since: "2024-01-15" },
  { id: "c2", name: "Zeta AI",         externalId: "cust_zeta",  plan: "Scale",   inputTokens: 32100000, outputTokens: 8200000,  totalCost: 1204.80, status: "active",   since: "2024-02-03" },
  { id: "c3", name: "Nova Systems",    externalId: "cust_nova",  plan: "Starter", inputTokens: 18400000, outputTokens: 4600000,  totalCost: 621.30,  status: "active",   since: "2024-03-20" },
  { id: "c4", name: "Ridge Analytics", externalId: "cust_ridge", plan: "Growth",  inputTokens: 9800000,  outputTokens: 2400000,  totalCost: 338.10,  status: "active",   since: "2024-04-01" },
  { id: "c5", name: "Helix Labs",      externalId: "cust_helix", plan: "Starter", inputTokens: 3200000,  outputTokens: 800000,   totalCost: 98.60,   status: "inactive", since: "2024-05-10" },
];

// ── Cost Items ────────────────────────────────────────────────────────────────
export type RateModel = "per_unit" | "per_block" | "tiered" | "dimensions";

export interface DimensionRow {
  model_type: string;
  fine_tuned: string;
  rate_per_block: number;
  block_size: number;
  free_units: number;
}

export interface CostItem {
  id: string;
  meterId: string;
  meterLabel: string;
  rateModel: RateModel;
  unitRate?: number;
  blockRate?: number;
  blockSize?: number;
  tieredRates?: { upTo: number | null; rate: number }[];
  dimensions?: DimensionRow[];
}

export const costItems: CostItem[] = [
  {
    id: "ci1", meterId: "m1", meterLabel: "Input Tokens", rateModel: "dimensions",
    dimensions: [
      { model_type: "standard",  fine_tuned: "false", rate_per_block: 0.0030, block_size: 1000, free_units: 0 },
      { model_type: "standard",  fine_tuned: "true",  rate_per_block: 0.0090, block_size: 1000, free_units: 0 },
      { model_type: "reasoning", fine_tuned: "false", rate_per_block: 0.0150, block_size: 1000, free_units: 0 },
    ],
  },
  {
    id: "ci2", meterId: "m2", meterLabel: "Output Tokens", rateModel: "dimensions",
    dimensions: [
      { model_type: "standard",  fine_tuned: "false", rate_per_block: 0.0060, block_size: 1000, free_units: 0 },
      { model_type: "standard",  fine_tuned: "true",  rate_per_block: 0.0180, block_size: 1000, free_units: 0 },
      { model_type: "reasoning", fine_tuned: "false", rate_per_block: 0.0600, block_size: 1000, free_units: 0 },
    ],
  },
  {
    id: "ci3", meterId: "m3", meterLabel: "API Requests", rateModel: "tiered",
    tieredRates: [
      { upTo: 100000, rate: 0 },
      { upTo: 500000, rate: 0.000010 },
      { upTo: null,   rate: 0.000006 },
    ],
  },
  {
    id: "ci4", meterId: "m4", meterLabel: "Unique Models", rateModel: "per_unit",
    unitRate: 0.50,
  },
];

// ── Pricing Plans ─────────────────────────────────────────────────────────────
export interface PriceTier { upTo: number | null; unitRate: number; flatFee?: number }
export interface ProductItem { id: string; meter: string; description: string; tiers: PriceTier[] }
export interface FixedFee    { id: string; description: string; amount: number; period: string }

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  billingPeriod: string;
  model: string;
  status: "active" | "draft" | "archived";
  productItems: ProductItem[];
  fixedFees: FixedFee[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "pp1", name: "Starter Plan", description: "For early-stage teams exploring AI integration",
    billingPeriod: "Calendar Monthly", model: "Standard", status: "active",
    productItems: [
      { id: "pi1", meter: "Input Tokens",  description: "Usage-based, tiered",
        tiers: [{ upTo: 500000, unitRate: 0 }, { upTo: null, unitRate: 0.000020 }] },
      { id: "pi2", meter: "Output Tokens", description: "Usage-based, tiered",
        tiers: [{ upTo: 200000, unitRate: 0 }, { upTo: null, unitRate: 0.000060 }] },
    ],
    fixedFees: [{ id: "ff1", description: "Platform base fee", amount: 19.99, period: "Monthly" }],
  },
  {
    id: "pp2", name: "Growth Plan", description: "For teams scaling AI usage in production",
    billingPeriod: "Calendar Monthly", model: "Standard", status: "active",
    productItems: [
      { id: "pi3", meter: "Input Tokens",  description: "Usage-based, tiered",
        tiers: [{ upTo: 2000000, unitRate: 0 }, { upTo: 10000000, unitRate: 0.000015 }, { upTo: null, unitRate: 0.000010 }] },
      { id: "pi4", meter: "Output Tokens", description: "Usage-based, tiered",
        tiers: [{ upTo: 500000, unitRate: 0 }, { upTo: null, unitRate: 0.000045 }] },
    ],
    fixedFees: [
      { id: "ff2", description: "Platform base fee", amount: 49.99, period: "Monthly" },
      { id: "ff3", description: "Priority support",  amount: 29.99, period: "Monthly" },
    ],
  },
  {
    id: "pp3", name: "Scale Plan - V2", description: "High-volume enterprise-grade metering",
    billingPeriod: "Calendar Monthly", model: "Custom", status: "draft",
    productItems: [
      { id: "pi5", meter: "Input Tokens", description: "Usage-based, flat",
        tiers: [{ upTo: null, unitRate: 0.000008 }] },
    ],
    fixedFees: [{ id: "ff4", description: "Enterprise platform fee", amount: 199.00, period: "Monthly" }],
  },
];

// ── Alerts ────────────────────────────────────────────────────────────────────
export type AlertScope   = "each_customer" | "all_customers" | "specific_customer";
export type AlertStatus  = "enabled" | "disabled";
export type AlertChannel = "slack" | "email" | "webhook";

export interface Alert {
  id: string; name: string; alertOn: string; meter: string;
  rule: string; scope: AlertScope; sendTo: AlertChannel[];
  status: AlertStatus; modified: string;
}

export const alerts: Alert[] = [
  { id: "a1", name: "High token usage",     alertOn: "usage", meter: "Input Tokens",     rule: "> 1,000,000", scope: "each_customer", sendTo: ["slack","email"], status: "enabled",  modified: "2024-06-10" },
  { id: "a2", name: "Cost spike",           alertOn: "cost",  meter: "Input Tokens",     rule: "> $500",      scope: "each_customer", sendTo: ["email"],        status: "enabled",  modified: "2024-06-08" },
  { id: "a3", name: "Output token anomaly", alertOn: "usage", meter: "Output Tokens",    rule: "> 500,000",   scope: "each_customer", sendTo: ["webhook"],      status: "enabled",  modified: "2024-06-05" },
  { id: "a4", name: "Total spend guard",    alertOn: "cost",  meter: "API Requests",     rule: "> $1,000",    scope: "all_customers", sendTo: ["email"],        status: "disabled", modified: "2024-05-28" },
  { id: "a5", name: "Fine-tune budget",     alertOn: "cost",  meter: "Fine-tune Tokens", rule: "> $200",      scope: "each_customer", sendTo: ["slack"],        status: "disabled", modified: "2024-05-20" },
];

// ── Dashboard time-series ─────────────────────────────────────────────────────
export const dailyUsage = Array.from({ length: 30 }, (_, i) => ({
  date: `Jun ${i + 1}`,
  openai:    Math.round(1800000 + Math.random() * 900000),
  anthropic: Math.round(700000  + Math.random() * 400000),
  google:    Math.round(400000  + Math.random() * 300000),
  cohere:    Math.round(150000  + Math.random() * 150000),
}));

export const providerColors = {
  openai: "#378ADD", anthropic: "#1D9E75", google: "#EF9F27", cohere: "#D4537E",
} as const;

export const providerBreakdown = [
  { provider: "OpenAI",    inputTokens: 48200000, outputTokens: 12100000, requests: 124300, cost: 2841.50 },
  { provider: "Anthropic", inputTokens: 22100000, outputTokens: 5500000,  requests:  58200, cost: 1482.30 },
  { provider: "Google",    inputTokens: 18600000, outputTokens: 4600000,  requests:  43100, cost:  980.10 },
  { provider: "Cohere",    inputTokens:  8200000, outputTokens: 2000000,  requests:  21400, cost:  398.60 },
];

export const summaryMetrics = {
  totalInputTokens:  97100000,
  totalOutputTokens: 24200000,
  totalCost:         5702.50,
  totalRequests:     246000,
  activeCustomers:   4,
};
