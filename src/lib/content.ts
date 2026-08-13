/**
 * Static site content lifted from the approved design.
 * Keeping it here means the nav, homepage grid, solutions page and the AI
 * system prompt all describe the same 20 disciplines / 15 industries.
 */

export type Service = {
  slug: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  color: string;
  accent: string;
  accentRgb: string;
  category: ServiceCategory;
};

export type ServiceCategory =
  | "ai"
  | "engineering"
  | "security"
  | "business"
  | "industry";

export const SERVICE_CATEGORIES: {
  key: ServiceCategory;
  label: string;
  color: string;
}[] = [
  { key: "ai", label: "AI & Intelligence", color: "purple" },
  { key: "engineering", label: "Software Engineering", color: "blue" },
  { key: "security", label: "Security & Infrastructure", color: "red" },
  { key: "business", label: "Business Systems", color: "emerald" },
  { key: "industry", label: "Industry-Specific", color: "amber" },
];

export const SERVICES: Service[] = [
  {
    slug: "ai-development",
    icon: "brain",
    title: "AI Development",
    tagline: "LLMs · Agents · RAG",
    description:
      "Custom AI systems — LLMs, RAG, enterprise AI, document intelligence, voice AI, predictive analytics, and AI-powered SaaS platforms.",
    tags: ["LLMs", "RAG", "Voice AI", "Computer Vision", "Predictive Analytics"],
    color: "text-purple-400",
    accent: "#a855f7",
    accentRgb: "168,85,247",
    category: "ai",
  },
  {
    slug: "ai-agents",
    icon: "robot",
    title: "AI Agents",
    tagline: "Autonomous · Workflow",
    description:
      "Autonomous AI agents that execute multi-step business processes — research, analysis, communication, decision-making, and workflow orchestration.",
    tags: ["Autonomous Agents", "Workflow AI", "OpenAI · Anthropic"],
    color: "text-cyan-400",
    accent: "#06b6d4",
    accentRgb: "6,182,212",
    category: "ai",
  },
  {
    slug: "custom-software",
    icon: "code",
    title: "Custom Software",
    tagline: "Bespoke · Scalable",
    description:
      "Bespoke software engineered around your business logic — not adapted from templates.",
    tags: ["React", "Node.js", "Python"],
    color: "text-green-400",
    accent: "#22c55e",
    accentRgb: "34,197,94",
    category: "engineering",
  },
  {
    slug: "saas-development",
    icon: "layer-group",
    title: "SaaS Development",
    tagline: "Multi-tenant · API-first",
    description:
      "Multi-tenant SaaS platforms from MVP to enterprise scale — billing, user management, and API-first architecture.",
    tags: ["Multi-tenant", "Stripe", "API-first"],
    color: "text-blue-400",
    accent: "#3b82f6",
    accentRgb: "59,130,246",
    category: "engineering",
  },
  {
    slug: "enterprise-software",
    icon: "building-columns",
    title: "Enterprise Software",
    tagline: "Mission-critical · Secure",
    description:
      "Mission-critical enterprise systems with enterprise security, SSO, audit trails, and compliance requirements built in.",
    tags: ["SSO / SAML", "RBAC", "Audit Logs"],
    color: "text-indigo-400",
    accent: "#6366f1",
    accentRgb: "99,102,241",
    category: "engineering",
  },
  {
    slug: "cybersecurity",
    icon: "shield-halved",
    title: "Cybersecurity",
    tagline: "Red Team · SIEM · SOC",
    description:
      "Threat detection, penetration testing, red team operations, vulnerability management, SIEM, and security operations.",
    tags: ["Red Team", "SIEM", "Pen Testing"],
    color: "text-red-400",
    accent: "#ef4444",
    accentRgb: "239,68,68",
    category: "security",
  },
  {
    slug: "cloud-infrastructure",
    icon: "cloud",
    title: "Cloud Infrastructure",
    tagline: "AWS · GCP · Azure",
    description:
      "AWS, GCP, Azure. Containers, Kubernetes, Terraform IaC, CI/CD, monitoring, backups, and disaster recovery.",
    tags: ["Kubernetes", "Terraform", "AWS / GCP"],
    color: "text-sky-400",
    accent: "#0ea5e9",
    accentRgb: "14,165,233",
    category: "security",
  },
  {
    slug: "devops",
    icon: "infinity",
    title: "DevOps",
    tagline: "CI/CD · IaC · K8s",
    description:
      "CI/CD pipelines, automated testing, infrastructure as code, container orchestration, and release automation.",
    tags: ["CI/CD", "Docker", "GitHub Actions"],
    color: "text-orange-400",
    accent: "#f97316",
    accentRgb: "249,115,22",
    category: "security",
  },
  {
    slug: "mobile-applications",
    icon: "mobile-screen",
    title: "Mobile Applications",
    tagline: "iOS · Android · PWA",
    description:
      "iOS, Android, React Native, and cross-platform PWAs built for offline-first field operations.",
    tags: ["iOS", "Android", "React Native"],
    color: "text-pink-400",
    accent: "#ec4899",
    accentRgb: "236,72,153",
    category: "business",
  },
  {
    slug: "crm-development",
    icon: "users",
    title: "CRM Development",
    tagline: "Custom · Integrated",
    description:
      "Custom CRM built around your sales process — pipelines, automation, and the integrations your team already lives in.",
    tags: ["Pipelines", "Automation", "Integrations"],
    color: "text-yellow-400",
    accent: "#eab308",
    accentRgb: "234,179,8",
    category: "business",
  },
  {
    slug: "erp-development",
    icon: "boxes-stacked",
    title: "ERP Development",
    tagline: "Finance · Ops · HR",
    description:
      "Finance, operations, HR, and reporting in one system engineered around how your business actually runs.",
    tags: ["Finance", "Operations", "HR"],
    color: "text-teal-400",
    accent: "#14b8a6",
    accentRgb: "20,184,166",
    category: "business",
  },
  {
    slug: "automation",
    icon: "gears",
    title: "Automation",
    tagline: "RPA · Workflow · AI",
    description:
      "RPA, workflow automation, and AI-driven processes that remove the manual steps between your systems.",
    tags: ["RPA", "Workflow", "AI"],
    color: "text-violet-400",
    accent: "#8b5cf6",
    accentRgb: "139,92,246",
    category: "business",
  },
  {
    slug: "api-development",
    icon: "plug",
    title: "API Development",
    tagline: "REST · GraphQL · gRPC",
    description:
      "REST, GraphQL, gRPC APIs and integration platforms with versioning, rate limiting, and real documentation.",
    tags: ["REST", "GraphQL", "gRPC"],
    color: "text-sky-300",
    accent: "#38bdf8",
    accentRgb: "56,189,248",
    category: "business",
  },
  {
    slug: "data-platforms",
    icon: "database",
    title: "Data Platforms",
    tagline: "Pipelines · BI · ML",
    description:
      "Data pipelines, warehousing, BI, and ML infrastructure — from ingestion through to the dashboard leadership actually opens.",
    tags: ["Pipelines", "Warehousing", "BI"],
    color: "text-emerald-400",
    accent: "#10b981",
    accentRgb: "16,185,129",
    category: "business",
  },
  {
    slug: "managed-it",
    icon: "server",
    title: "Managed IT",
    tagline: "MSP · Monitoring · Support",
    description:
      "MSP services, monitoring, helpdesk, and IT management for teams without an internal platform group.",
    tags: ["MSP", "Monitoring", "Helpdesk"],
    color: "text-slate-300",
    accent: "#94a3b8",
    accentRgb: "148,163,184",
    category: "business",
  },
  {
    slug: "security-operations",
    icon: "radar",
    title: "Security Operations",
    tagline: "SOC · Threat Intel",
    description:
      "SOC, threat intelligence, incident response, and monitoring — 24/7 coverage with documented playbooks.",
    tags: ["SOC", "Threat Intel", "Incident Response"],
    color: "text-red-300",
    accent: "#f87171",
    accentRgb: "248,113,113",
    category: "business",
  },
  {
    slug: "healthcare-technology",
    icon: "heart-pulse",
    title: "Healthcare Technology",
    tagline: "HIPAA · EHR · HL7",
    description:
      "HIPAA-compliant platforms, EHR integration, patient portals, and telehealth.",
    tags: ["HIPAA", "EHR", "Telehealth"],
    color: "text-green-300",
    accent: "#4ade80",
    accentRgb: "74,222,128",
    category: "industry",
  },
  {
    slug: "logistics-technology",
    icon: "truck",
    title: "Logistics Technology",
    tagline: "Dispatch · TMS · GPS",
    description:
      "WMS, TMS, 3PL platforms, GPS tracking, and dispatch built for real yard and dock workflows.",
    tags: ["WMS", "TMS", "3PL"],
    color: "text-amber-400",
    accent: "#fbbf24",
    accentRgb: "251,191,36",
    category: "industry",
  },
  {
    slug: "transportation-software",
    icon: "route",
    title: "Transportation Software",
    tagline: "Fleet · Routing · ELD",
    description:
      "Fleet management, ELD, driver apps, and route optimization for carriers of every size.",
    tags: ["Fleet", "ELD", "Route Optimization"],
    color: "text-cyan-300",
    accent: "#22d3ee",
    accentRgb: "34,211,238",
    category: "industry",
  },
  {
    slug: "government-technology",
    icon: "landmark",
    title: "Government Technology",
    tagline: "Municipal · Federal",
    description:
      "Municipal systems, public portals, and compliance platforms engineered for procurement and audit reality.",
    tags: ["Municipal", "Public Portals", "Compliance"],
    color: "text-slate-300",
    accent: "#94a3b8",
    accentRgb: "148,163,184",
    category: "industry",
  },
];

export type Industry = {
  slug: string;
  icon: string;
  name: string;
  tagline: string;
  color: string;
  hover: string;
};

export const INDUSTRIES: Industry[] = [
  { slug: "healthcare", icon: "heart-pulse", name: "Healthcare", tagline: "HIPAA · EHR", color: "text-emerald-400", hover: "hover:border-emerald-500/40" },
  { slug: "hospice", icon: "hand-holding-heart", name: "Hospice", tagline: "Care · Compliance", color: "text-emerald-300", hover: "hover:border-emerald-500/30" },
  { slug: "logistics", icon: "truck", name: "Logistics", tagline: "WMS · TMS · 3PL", color: "text-amber-400", hover: "hover:border-amber-500/30" },
  { slug: "transportation", icon: "route", name: "Transportation", tagline: "Fleet · Dispatch", color: "text-cyan-400", hover: "hover:border-cyan-500/30" },
  { slug: "hotshot-trucking", icon: "truck-fast", name: "Hotshot Trucking", tagline: "Load · ELD · GPS", color: "text-yellow-400", hover: "hover:border-yellow-500/30" },
  { slug: "manufacturing", icon: "industry", name: "Manufacturing", tagline: "MES · IoT · ERP", color: "text-orange-400", hover: "hover:border-orange-500/30" },
  { slug: "government", icon: "landmark", name: "Government", tagline: "Compliance · Secure", color: "text-slate-300", hover: "hover:border-slate-400/30" },
  { slug: "municipalities", icon: "city", name: "Municipalities", tagline: "Public Sector", color: "text-blue-300", hover: "hover:border-blue-500/30" },
  { slug: "construction", icon: "helmet-safety", name: "Construction", tagline: "PM · Field · BI", color: "text-stone-300", hover: "hover:border-stone-400/30" },
  { slug: "real-estate", icon: "building", name: "Real Estate", tagline: "CRM · Listings", color: "text-purple-300", hover: "hover:border-purple-500/30" },
  { slug: "finance", icon: "coins", name: "Finance", tagline: "FinTech · Compliance", color: "text-green-400", hover: "hover:border-green-500/30" },
  { slug: "insurance", icon: "umbrella", name: "Insurance", tagline: "Claims · Underwriting", color: "text-teal-400", hover: "hover:border-teal-500/30" },
  { slug: "professional-services", icon: "briefcase", name: "Professional Services", tagline: "Automation · CRM", color: "text-indigo-300", hover: "hover:border-indigo-500/30" },
  { slug: "retail", icon: "store", name: "Retail", tagline: "POS · Inventory · eComm", color: "text-pink-300", hover: "hover:border-pink-500/30" },
  { slug: "technology", icon: "microchip", name: "Technology", tagline: "SaaS · Platforms", color: "text-violet-300", hover: "hover:border-violet-500/30" },
];

export const PIPELINE = [
  { step: "01", phase: "Discover", title: "AI-Powered Discovery", body: "Define scope and architecture with our virtual architect before writing a line of code." },
  { step: "02", phase: "Design", title: "System Architecture", body: "Secure-by-design blueprints engineered for scale and resilience." },
  { step: "03", phase: "Build", title: "Agile Engineering", body: "Iterative development with continuous integration and automated testing." },
  { step: "04", phase: "Secure", title: "Security Integration", body: "Penetration testing and compliance baked into every release cycle." },
  { step: "05", phase: "Deploy", title: "Cloud Deployment", body: "Infrastructure-as-code launches to AWS, Azure, or GCP." },
  { step: "06", phase: "Monitor", title: "Observability", body: "Real-time telemetry and alerting across your entire stack." },
  { step: "07", phase: "Scale", title: "Auto Scaling", body: "Systems that grow elastically with demand." },
  { step: "08", phase: "Optimize", title: "Continuous Improvement", body: "AI-driven recommendations to reduce cost and latency." },
];

export const TRUST_STATS = [
  { value: "15+", label: "Years* engineering experience" },
  { value: "200+", label: "Systems built" },
  { value: "20+", label: "Industries served" },
  { value: "50+", label: "Technologies supported" },
];

export const TECHNOLOGIES = [
  "Next.js",
  "FastAPI",
  "Anthropic",
  "Kubernetes",
  "Terraform",
  "PostgreSQL",
];

export const NAV_LINKS = [
  { href: "/solutions", label: "Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/discovery", label: "Resources" },
  { href: "/contact", label: "Company" },
];
