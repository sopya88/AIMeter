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
export type AlertScope   = "each_employee" | "department" | "all";
export type AlertStatus  = "enabled" | "disabled";
export type AlertChannel = "slack" | "email" | "webhook";

export interface Alert {
  id: string; name: string; alertOn: string; meter: string;
  rule: string; scope: AlertScope; sendTo: AlertChannel[];
  status: AlertStatus; modified: string;
}

export const alerts: Alert[] = [
  { id: "a1", name: "High token usage",     alertOn: "usage", meter: "Input Tokens",     rule: "> 1,000,000", scope: "each_employee", sendTo: ["slack","email"], status: "enabled",  modified: "2024-06-10" },
  { id: "a2", name: "Cost spike",           alertOn: "cost",  meter: "Input Tokens",     rule: "> 5,000",     scope: "each_employee", sendTo: ["email"],        status: "enabled",  modified: "2024-06-08" },
  { id: "a3", name: "Output token anomaly", alertOn: "usage", meter: "Output Tokens",    rule: "> 500,000",   scope: "each_employee", sendTo: ["webhook"],      status: "enabled",  modified: "2024-06-05" },
  { id: "a4", name: "Dept spend guard",     alertOn: "cost",  meter: "API Requests",     rule: "> 50,000",    scope: "department",    sendTo: ["email"],        status: "disabled", modified: "2024-05-28" },
  { id: "a5", name: "Global budget cap",    alertOn: "cost",  meter: "Fine-tune Tokens", rule: "> 2,00,000",  scope: "all",           sendTo: ["slack"],        status: "disabled", modified: "2024-05-20" },
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

// ── Enterprise Governance ─────────────────────────────────────────────────────
// All monetary values in INR (Indian Rupees). USD cost × 83.5 conversion rate.

export interface Department {
  id: string;
  name: string;
  manager: string;
  costCenter: string;
  budgetINR: number;
  spentINR: number;
  employees: number;
  activeAgents: number;
  topModel: string;
}

export const departments: Department[] = [
  { id: "d1", name: "Engineering",       manager: "Arjun Sharma",   costCenter: "CC-ENG-001", budgetINR: 500000, spentINR: 382400, employees: 42, activeAgents: 8,  topModel: "GPT-4o" },
  { id: "d2", name: "Product & Design",  manager: "Priya Mehta",    costCenter: "CC-PRD-002", budgetINR: 200000, spentINR: 178200, employees: 18, activeAgents: 3,  topModel: "Claude 3.5" },
  { id: "d3", name: "Data Science",      manager: "Rahul Gupta",    costCenter: "CC-DS-003",  budgetINR: 350000, spentINR: 341000, employees: 24, activeAgents: 12, topModel: "Gemini 1.5 Pro" },
  { id: "d4", name: "Sales & Marketing", manager: "Anjali Singh",   costCenter: "CC-SAL-004", budgetINR: 150000, spentINR: 62300,  employees: 31, activeAgents: 2,  topModel: "GPT-4o-mini" },
  { id: "d5", name: "Finance & Legal",   manager: "Vikram Nair",    costCenter: "CC-FIN-005", budgetINR: 100000, spentINR: 38900,  employees: 15, activeAgents: 1,  topModel: "Claude 3.5" },
  { id: "d6", name: "Customer Success",  manager: "Sneha Patil",    costCenter: "CC-CS-006",  budgetINR: 80000,  spentINR: 44800,  employees: 22, activeAgents: 5,  topModel: "GPT-4o-mini" },
];

export type LicenseStatus = "active" | "inactive" | "pending" | "unused";
export type LicenseType   = "Microsoft 365 Copilot" | "GitHub Copilot" | "Claude for Work" | "Gemini Advanced" | "OpenAI ChatGPT Enterprise";

export interface License {
  id: string;
  employee: string;
  email: string;
  department: string;
  role: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  lastUsed: string | null;
  monthlySpendINR: number;
  allocatedDate: string;
  unusedDays: number;
}

export const licenses: License[] = [
  { id: "l1",  employee: "Arjun Sharma",    email: "arjun.sharma@corp.in",    department: "Engineering",       role: "Engineering Manager",   licenseType: "GitHub Copilot",             status: "active",   lastUsed: "2024-06-14", monthlySpendINR: 1758,  allocatedDate: "2024-01-01", unusedDays: 0  },
  { id: "l2",  employee: "Riya Desai",      email: "riya.desai@corp.in",      department: "Engineering",       role: "Senior SDE",            licenseType: "GitHub Copilot",             status: "active",   lastUsed: "2024-06-14", monthlySpendINR: 1758,  allocatedDate: "2024-01-01", unusedDays: 0  },
  { id: "l3",  employee: "Karan Joshi",     email: "karan.joshi@corp.in",     department: "Engineering",       role: "SDE",                   licenseType: "GitHub Copilot",             status: "unused",   lastUsed: "2024-04-22", monthlySpendINR: 1758,  allocatedDate: "2024-02-01", unusedDays: 53 },
  { id: "l4",  employee: "Priya Mehta",     email: "priya.mehta@corp.in",     department: "Product & Design",  role: "Product Manager",       licenseType: "Microsoft 365 Copilot",     status: "active",   lastUsed: "2024-06-13", monthlySpendINR: 2508,  allocatedDate: "2024-01-15", unusedDays: 0  },
  { id: "l5",  employee: "Neha Kulkarni",   email: "neha.kulkarni@corp.in",   department: "Product & Design",  role: "UX Designer",           licenseType: "Claude for Work",           status: "active",   lastUsed: "2024-06-12", monthlySpendINR: 1675,  allocatedDate: "2024-03-01", unusedDays: 0  },
  { id: "l6",  employee: "Rahul Gupta",     email: "rahul.gupta@corp.in",     department: "Data Science",      role: "Head of Data Science",  licenseType: "Gemini Advanced",           status: "active",   lastUsed: "2024-06-14", monthlySpendINR: 1758,  allocatedDate: "2024-01-01", unusedDays: 0  },
  { id: "l7",  employee: "Suresh Kumar",    email: "suresh.kumar@corp.in",    department: "Data Science",      role: "Data Scientist",        licenseType: "OpenAI ChatGPT Enterprise", status: "active",   lastUsed: "2024-06-11", monthlySpendINR: 2090,  allocatedDate: "2024-02-15", unusedDays: 0  },
  { id: "l8",  employee: "Meena Iyer",      email: "meena.iyer@corp.in",      department: "Data Science",      role: "ML Engineer",           licenseType: "GitHub Copilot",             status: "unused",   lastUsed: "2024-05-01", monthlySpendINR: 1758,  allocatedDate: "2024-02-01", unusedDays: 44 },
  { id: "l9",  employee: "Anjali Singh",    email: "anjali.singh@corp.in",    department: "Sales & Marketing", role: "VP Sales",              licenseType: "Microsoft 365 Copilot",     status: "active",   lastUsed: "2024-06-14", monthlySpendINR: 2508,  allocatedDate: "2024-01-01", unusedDays: 0  },
  { id: "l10", employee: "Rohit Verma",     email: "rohit.verma@corp.in",     department: "Sales & Marketing", role: "Sales Executive",       licenseType: "Microsoft 365 Copilot",     status: "inactive", lastUsed: "2024-03-10", monthlySpendINR: 2508,  allocatedDate: "2024-01-15", unusedDays: 96 },
  { id: "l11", employee: "Vikram Nair",     email: "vikram.nair@corp.in",     department: "Finance & Legal",   role: "CFO",                   licenseType: "Claude for Work",           status: "active",   lastUsed: "2024-06-13", monthlySpendINR: 1675,  allocatedDate: "2024-03-01", unusedDays: 0  },
  { id: "l12", employee: "Sneha Patil",     email: "sneha.patil@corp.in",     department: "Customer Success",  role: "CS Manager",            licenseType: "OpenAI ChatGPT Enterprise", status: "active",   lastUsed: "2024-06-14", monthlySpendINR: 2090,  allocatedDate: "2024-01-01", unusedDays: 0  },
  { id: "l13", employee: "Aditya Rao",      email: "aditya.rao@corp.in",      department: "Engineering",       role: "DevOps Engineer",       licenseType: "GitHub Copilot",             status: "pending",  lastUsed: null,          monthlySpendINR: 1758,  allocatedDate: "2024-06-10", unusedDays: 0  },
  { id: "l14", employee: "Divya Krishnan",  email: "divya.krishnan@corp.in",  department: "Data Science",      role: "Data Analyst",          licenseType: "Gemini Advanced",           status: "unused",   lastUsed: "2024-04-30", monthlySpendINR: 1758,  allocatedDate: "2024-02-01", unusedDays: 45 },
];

export type AgentStatus = "running" | "paused" | "error" | "scheduled";
export type AgentType   = "Code Assistant" | "Data Pipeline" | "Customer Support" | "Document AI" | "Analytics" | "Internal Tool";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  owner: string;
  department: string;
  model: string;
  provider: string;
  apiCallsMonth: number;
  tokensUsed: number;
  costINR: number;
  status: AgentStatus;
  createdDate: string;
  lastRun: string;
  description: string;
}

export const agents: Agent[] = [
  { id: "ag1",  name: "Code Review Bot",        type: "Code Assistant",    owner: "Arjun Sharma",   department: "Engineering",       model: "GPT-4o",           provider: "OpenAI",    apiCallsMonth: 8420,  tokensUsed: 18200000, costINR: 124800, status: "running",   createdDate: "2024-01-15", lastRun: "2024-06-14", description: "Automated PR review and code quality checks on GitHub" },
  { id: "ag2",  name: "SQL Generator",           type: "Data Pipeline",     owner: "Rahul Gupta",    department: "Data Science",      model: "GPT-4o",           provider: "OpenAI",    apiCallsMonth: 5200,  tokensUsed: 9800000,  costINR: 68200,  status: "running",   createdDate: "2024-02-01", lastRun: "2024-06-14", description: "Generates and validates SQL queries from natural language" },
  { id: "ag3",  name: "Customer Reply Agent",    type: "Customer Support",  owner: "Sneha Patil",    department: "Customer Success",  model: "claude-3-5-sonnet",provider: "Anthropic", apiCallsMonth: 12800, tokensUsed: 14200000, costINR: 86400,  status: "running",   createdDate: "2024-02-15", lastRun: "2024-06-14", description: "Drafts and triages customer support tickets automatically" },
  { id: "ag4",  name: "Document Summariser",     type: "Document AI",       owner: "Vikram Nair",    department: "Finance & Legal",   model: "claude-3-5-sonnet",provider: "Anthropic", apiCallsMonth: 3100,  tokensUsed: 8800000,  costINR: 52600,  status: "running",   createdDate: "2024-03-01", lastRun: "2024-06-13", description: "Summarises contracts, legal docs and financial reports" },
  { id: "ag5",  name: "Sales Email Writer",      type: "Internal Tool",     owner: "Anjali Singh",   department: "Sales & Marketing", model: "gpt-4o-mini",      provider: "OpenAI",    apiCallsMonth: 6800,  tokensUsed: 3200000,  costINR: 18400,  status: "running",   createdDate: "2024-03-15", lastRun: "2024-06-14", description: "Personalised sales outreach email generation" },
  { id: "ag6",  name: "Dataset Validator",       type: "Data Pipeline",     owner: "Suresh Kumar",   department: "Data Science",      model: "gemini-1.5-pro",   provider: "Google",    apiCallsMonth: 2800,  tokensUsed: 22400000, costINR: 92000,  status: "paused",    createdDate: "2024-03-20", lastRun: "2024-06-10", description: "Validates and profiles ML training datasets" },
  { id: "ag7",  name: "Design Critique Bot",     type: "Code Assistant",    owner: "Neha Kulkarni",  department: "Product & Design",  model: "claude-3-5-sonnet",provider: "Anthropic", apiCallsMonth: 1900,  tokensUsed: 2800000,  costINR: 16800,  status: "paused",    createdDate: "2024-04-01", lastRun: "2024-06-08", description: "Reviews Figma designs and provides accessibility feedback" },
  { id: "ag8",  name: "Meeting Notes AI",        type: "Document AI",       owner: "Priya Mehta",    department: "Product & Design",  model: "gemini-1.5-pro",   provider: "Google",    apiCallsMonth: 4200,  tokensUsed: 6200000,  costINR: 38400,  status: "running",   createdDate: "2024-04-10", lastRun: "2024-06-14", description: "Transcribes and summarises Microsoft Teams meeting recordings" },
  { id: "ag9",  name: "Anomaly Detector",        type: "Analytics",         owner: "Rahul Gupta",    department: "Data Science",      model: "gemini-1.5-pro",   provider: "Google",    apiCallsMonth: 1200,  tokensUsed: 18900000, costINR: 96200,  status: "error",     createdDate: "2024-04-15", lastRun: "2024-06-12", description: "Real-time anomaly detection on production metrics" },
  { id: "ag10", name: "HR Policy Assistant",     type: "Internal Tool",     owner: "Arjun Sharma",   department: "Engineering",       model: "gpt-4o-mini",      provider: "OpenAI",    apiCallsMonth: 980,   tokensUsed: 1100000,  costINR: 5800,   status: "scheduled", createdDate: "2024-05-01", lastRun: "2024-06-14", description: "Answers HR policy queries for employees" },
  { id: "ag11", name: "Report Generator",        type: "Analytics",         owner: "Riya Desai",     department: "Engineering",       model: "GPT-4o",           provider: "OpenAI",    apiCallsMonth: 2400,  tokensUsed: 4800000,  costINR: 28200,  status: "running",   createdDate: "2024-05-10", lastRun: "2024-06-14", description: "Auto-generates weekly engineering sprint reports" },
  { id: "ag12", name: "Copilot Studio Bot",      type: "Customer Support",  owner: "Anjali Singh",   department: "Sales & Marketing", model: "GPT-4o",           provider: "OpenAI",    apiCallsMonth: 3600,  tokensUsed: 5400000,  costINR: 32800,  status: "running",   createdDate: "2024-05-15", lastRun: "2024-06-14", description: "Microsoft Copilot Studio bot for product demos" },
];

export type InvoiceStatus = "paid" | "pending" | "overdue";
export type InvoiceVendor = "Microsoft Azure" | "OpenAI" | "Anthropic" | "Google Cloud" | "GitHub" | "AWS Bedrock";

export interface GSTInvoice {
  id: string;
  invoiceNo: string;
  vendor: InvoiceVendor;
  month: string;
  amountINR: number;       // pre-tax
  igstINR: number;         // 18% IGST
  totalINR: number;        // amount + IGST
  vendorGSTIN: string;
  ourGSTIN: string;
  pan: string;
  tdsINR: number;          // 2% TDS on software services
  netPayableINR: number;   // total - tds
  status: InvoiceStatus;
  dueDate: string;
  costCenter: string;
  department: string;
}

export const gstInvoices: GSTInvoice[] = [
  {
    id: "inv1", invoiceNo: "MSFT-2024-06-IN-4821", vendor: "Microsoft Azure",
    month: "Jun 2024", amountINR: 248000, igstINR: 44640, totalINR: 292640,
    vendorGSTIN: "06AAACM8747H1ZW", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 4960, netPayableINR: 287680, status: "pending",
    dueDate: "2024-07-15", costCenter: "CC-ENG-001", department: "Engineering",
  },
  {
    id: "inv2", invoiceNo: "OAI-2024-06-IN-3312", vendor: "OpenAI",
    month: "Jun 2024", amountINR: 82400, igstINR: 14832, totalINR: 97232,
    vendorGSTIN: "Foreign Vendor - OIDAR", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 1648, netPayableINR: 95584, status: "paid",
    dueDate: "2024-06-30", costCenter: "CC-DS-003", department: "Data Science",
  },
  {
    id: "inv3", invoiceNo: "ANT-2024-06-IN-0891", vendor: "Anthropic",
    month: "Jun 2024", amountINR: 44200, igstINR: 7956, totalINR: 52156,
    vendorGSTIN: "Foreign Vendor - OIDAR", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 884, netPayableINR: 51272, status: "paid",
    dueDate: "2024-06-30", costCenter: "CC-CS-006", department: "Customer Success",
  },
  {
    id: "inv4", invoiceNo: "GCP-2024-06-IN-7741", vendor: "Google Cloud",
    month: "Jun 2024", amountINR: 38600, igstINR: 6948, totalINR: 45548,
    vendorGSTIN: "Foreign Vendor - OIDAR", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 772, netPayableINR: 44776, status: "paid",
    dueDate: "2024-06-30", costCenter: "CC-DS-003", department: "Data Science",
  },
  {
    id: "inv5", invoiceNo: "GH-2024-06-IN-0042", vendor: "GitHub",
    month: "Jun 2024", amountINR: 36400, igstINR: 6552, totalINR: 42952,
    vendorGSTIN: "Foreign Vendor - OIDAR", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 728, netPayableINR: 42224, status: "pending",
    dueDate: "2024-07-10", costCenter: "CC-ENG-001", department: "Engineering",
  },
  {
    id: "inv6", invoiceNo: "AWS-2024-05-IN-8823", vendor: "AWS Bedrock",
    month: "May 2024", amountINR: 18200, igstINR: 3276, totalINR: 21476,
    vendorGSTIN: "Foreign Vendor - OIDAR", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 364, netPayableINR: 21112, status: "overdue",
    dueDate: "2024-06-15", costCenter: "CC-PRD-002", department: "Product & Design",
  },
  {
    id: "inv7", invoiceNo: "MSFT-2024-05-IN-4102", vendor: "Microsoft Azure",
    month: "May 2024", amountINR: 224000, igstINR: 40320, totalINR: 264320,
    vendorGSTIN: "06AAACM8747H1ZW", ourGSTIN: "27AABCU9603R1ZN", pan: "AABCU9603R",
    tdsINR: 4480, netPayableINR: 259840, status: "paid",
    dueDate: "2024-06-15", costCenter: "CC-ENG-001", department: "Engineering",
  },
];
