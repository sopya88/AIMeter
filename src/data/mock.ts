export const PROVIDER_COLORS = {
  OpenAI: "#378ADD",
  Anthropic: "#1D9E75",
  Google: "#EF9F27",
  AWS: "#D4537E",
};

export const monthlySpend = [
  { month: "Jan", OpenAI: 82000, Anthropic: 41000, Google: 28000, AWS: 19000 },
  { month: "Feb", OpenAI: 91000, Anthropic: 47000, Google: 31000, AWS: 22000 },
  { month: "Mar", OpenAI: 108000, Anthropic: 53000, Google: 35000, AWS: 25000 },
  { month: "Apr", OpenAI: 124000, Anthropic: 62000, Google: 38000, AWS: 28000 },
  { month: "May", OpenAI: 139000, Anthropic: 71000, Google: 45000, AWS: 32000 },
  { month: "Jun", OpenAI: 157000, Anthropic: 82310, Google: 52000, AWS: 36000 },
];

export const providerBreakdown = [
  { name: "OpenAI", spend: 157000, tokens: 48200000, calls: 124300, pct: 48 },
  { name: "Anthropic", spend: 82310, tokens: 22100000, calls: 58200, pct: 25 },
  { name: "Google", spend: 52000, tokens: 18600000, calls: 43100, pct: 16 },
  { name: "AWS", spend: 36000, tokens: 12400000, calls: 28900, pct: 11 },
];

export const topTeams = [
  { name: "AI Platform", spend: 128400, budget: 200000, lead: "Rohan Mehta" },
  { name: "Data Science", spend: 89200, budget: 120000, lead: "Priya Sharma" },
  { name: "Product ML", spend: 67100, budget: 80000, lead: "Arjun Nair" },
  { name: "Backend Infra", spend: 41600, budget: 60000, lead: "Sneha Kulkarni" },
  { name: "Growth", spend: 28500, budget: 50000, lead: "Vikram Desai" },
];

export const activeAlerts = [
  { id: 1, type: "budget", team: "Data Science", message: "74% of monthly budget consumed", severity: "warning" },
  { id: 2, type: "cost_spike", team: "AI Platform", message: "Cost spike 42% above 7-day avg", severity: "critical" },
  { id: 3, type: "token_spike", team: "Product ML", message: "Token usage up 38% this week", severity: "warning" },
];

export const invoices = [
  { id: "INV-2024-006", date: "2024-06-30", provider: "OpenAI", amount: 157000, igst: 28260, total: 185260, status: "pending" },
  { id: "INV-2024-005", date: "2024-05-31", provider: "OpenAI", amount: 139000, igst: 25020, total: 164020, status: "paid" },
  { id: "INV-2024-006B", date: "2024-06-30", provider: "Anthropic", amount: 82310, igst: 14815, total: 97125, status: "pending" },
  { id: "INV-2024-006C", date: "2024-06-30", provider: "Google", amount: 52000, igst: 9360, total: 61360, status: "pending" },
  { id: "INV-2024-006D", date: "2024-06-30", provider: "AWS", amount: 36000, igst: 6480, total: 42480, status: "paid" },
  { id: "INV-2024-005B", date: "2024-05-31", provider: "Anthropic", amount: 71000, igst: 12780, total: 83780, status: "paid" },
];

export const chargebacks = [
  { cc: "CC-101", team: "AI Platform", openai: 62000, anthropic: 38000, google: 18000, aws: 10400, total: 128400 },
  { cc: "CC-102", team: "Data Science", openai: 41000, anthropic: 22000, google: 18000, aws: 8200, total: 89200 },
  { cc: "CC-103", team: "Product ML", openai: 28000, anthropic: 14310, google: 16000, aws: 8790, total: 67100 },
  { cc: "CC-104", team: "Backend Infra", openai: 19000, anthropic: 7000, google: 10000, aws: 5600, total: 41600 },
  { cc: "CC-105", team: "Growth", openai: 7000, anthropic: 1000, google: 14000, aws: 3000, total: 28500 },  // Fixed: was missing 3000, total was off
];

export const dailyTokens = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2024, 5, i + 1);
  return {
    date: `Jun ${i + 1}`,
    OpenAI: Math.round(1200000 + Math.random() * 800000),
    Anthropic: Math.round(600000 + Math.random() * 400000),
    Google: Math.round(400000 + Math.random() * 300000),
    AWS: Math.round(300000 + Math.random() * 200000),
  };
});

export const modelRequests = [
  { name: "GPT-4o", value: 68200, color: "#378ADD" },
  { name: "Claude 3.5 Sonnet", value: 41300, color: "#1D9E75" },
  { name: "Gemini 1.5 Pro", value: 28100, color: "#EF9F27" },
  { name: "Bedrock Titan", value: 18900, color: "#D4537E" },
  { name: "GPT-3.5 Turbo", value: 16100, color: "#6DB8F2" },
];

export const latencyData = [
  { model: "GPT-4o", p50: 820, p95: 2100, p99: 3800 },
  { model: "Claude 3.5 Sonnet", p50: 680, p95: 1750, p99: 3100 },
  { model: "Gemini 1.5 Pro", p50: 910, p95: 2300, p99: 4200 },
  { model: "Bedrock Titan", p50: 540, p95: 1420, p99: 2700 },
  { model: "GPT-3.5 Turbo", p50: 320, p95: 890, p99: 1600 },
];

export const teams = [
  {
    id: 1, name: "AI Platform", lead: "Rohan Mehta", email: "rohan.m@acme.in",
    budget: 200000, spend: 128400,
    providers: ["OpenAI", "Anthropic", "Google", "AWS"],
    members: 12,
  },
  {
    id: 2, name: "Data Science", lead: "Priya Sharma", email: "priya.s@acme.in",
    budget: 120000, spend: 89200,
    providers: ["OpenAI", "Anthropic", "Google"],
    members: 8,
  },
  {
    id: 3, name: "Product ML", lead: "Arjun Nair", email: "arjun.n@acme.in",
    budget: 80000, spend: 67100,
    providers: ["OpenAI", "Google", "AWS"],
    members: 6,
  },
  {
    id: 4, name: "Backend Infra", lead: "Sneha Kulkarni", email: "sneha.k@acme.in",
    budget: 60000, spend: 41600,
    providers: ["OpenAI", "AWS"],
    members: 5,
  },
  {
    id: 5, name: "Growth", lead: "Vikram Desai", email: "vikram.d@acme.in",
    budget: 50000, spend: 28500,
    providers: ["OpenAI", "Google"],
    members: 4,
  },
];

export const allAlerts = [
  { id: 1, type: "budget", team: "Data Science", message: "74% of monthly budget consumed", severity: "warning", created: "2024-06-14" },
  { id: 2, type: "cost_spike", team: "AI Platform", message: "Cost spike 42% above 7-day avg", severity: "critical", created: "2024-06-13" },
  { id: 3, type: "token_spike", team: "Product ML", message: "Token usage up 38% this week", severity: "warning", created: "2024-06-12" },
  { id: 4, type: "budget", team: "Product ML", message: "84% of monthly budget consumed", severity: "critical", created: "2024-06-11" },
  { id: 5, type: "cost_spike", team: "Backend Infra", message: "Unusual spike: AWS cost +120%", severity: "critical", created: "2024-06-10" },
];

export const settings = {
  company: "Acme Technologies Pvt. Ltd.",
  gstin: "27AABCU9603R1ZX",
  pan: "AABCU9603R",
  currency: "INR",
  apiKeys: [
    { provider: "OpenAI", key: "sk-...a4f2", status: "connected" },
    { provider: "Anthropic", key: "sk-ant-...8c3d", status: "connected" },
    { provider: "Google", key: "AIza...9k2p", status: "connected" },
    { provider: "AWS", key: "AKIA...7R2T", status: "warning" },
  ],
};
