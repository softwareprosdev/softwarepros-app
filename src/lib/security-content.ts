/** Content for the Cybersecurity page. */

export type SecurityCapability = {
  icon: string;
  title: string;
  body: string;
  badge?: string;
  badgeClass?: string;
  iconWrap: string;
  iconColor: string;
  live?: string;
};

export const SECURITY_CAPABILITIES: SecurityCapability[] = [
  {
    icon: "radar",
    title: "Threat Detection",
    badge: "Active Defense",
    badgeClass: "badge-red",
    body: "Real-time threat monitoring using SIEM, behavioral analytics, and AI-powered anomaly detection across your entire environment — endpoints, network, cloud, and applications.",
    iconWrap: "bg-red-500/15 border-red-500/25",
    iconColor: "text-red-400",
    live: "Continuous Monitoring",
  },
  {
    icon: "eye",
    title: "SOC Operations",
    badge: "24/7 Monitoring",
    badgeClass: "badge-orange",
    body: "Round-the-clock security monitoring with log aggregation, alert triage, escalation procedures, and documented incident response playbooks — catching threats before they cause damage.",
    iconWrap: "bg-orange-500/15 border-orange-500/25",
    iconColor: "text-orange-300",
  },
  {
    icon: "bug",
    title: "Vulnerability Management",
    badge: "Continuous Scanning",
    badgeClass: "badge-yellow",
    body: "Continuous scanning, CVSS-based prioritization, and tracked remediation of vulnerabilities across applications, infrastructure, dependencies, and endpoints — with client-facing reporting.",
    iconWrap: "bg-yellow-500/15 border-yellow-500/25",
    iconColor: "text-yellow-300",
  },
  {
    icon: "user-secret",
    title: "Penetration Testing",
    badge: "Offensive",
    badgeClass: "badge-red",
    body: "Manual and automated penetration testing across web applications, APIs, mobile apps, networks, and cloud infrastructure — identifying and validating exploitable vulnerabilities before attackers do.",
    iconWrap: "bg-red-500/15 border-red-500/25",
    iconColor: "text-red-300",
  },
  {
    icon: "crosshairs",
    title: "Red Team Operations",
    badge: "Offensive",
    badgeClass: "badge-red",
    body: "Full adversarial simulations replicating real-world attack scenarios — testing your people, processes, and technology simultaneously. Measures true detection and response capability.",
    iconWrap: "bg-red-900/50 border-red-700/40",
    iconColor: "text-red-300",
  },
  {
    icon: "shield-heart",
    title: "Purple Team Operations",
    badge: "Collaborative",
    badgeClass: "badge-purple",
    body: "Collaborative attack-and-defend exercises combining red and blue team expertise to close detection gaps, validate security controls, and build your team's response muscle memory.",
    iconWrap: "bg-purple-500/15 border-purple-500/25",
    iconColor: "text-purple-300",
  },
  {
    icon: "tower-broadcast",
    title: "Incident Response",
    body: "Rapid response to active security incidents — containment, forensic investigation, root cause analysis, remediation, and detailed post-incident reporting to prevent recurrence.",
    iconWrap: "bg-red-500/15 border-red-500/25",
    iconColor: "text-red-400",
  },
  {
    icon: "network-wired",
    title: "Network Security",
    body: "Deep packet inspection, network traffic analysis, DNS filtering, firewall management, and zero-trust network architecture implementation — visibility into every packet crossing your environment.",
    iconWrap: "bg-blue-500/15 border-blue-500/25",
    iconColor: "text-blue-300",
  },
  {
    icon: "fingerprint",
    title: "Identity Security (IAM)",
    body: "IAM architecture, MFA enforcement, privileged access management (PAM), SSO integration, identity governance, and zero-trust access controls — because most breaches start with credentials.",
    iconWrap: "bg-emerald-500/15 border-emerald-500/25",
    iconColor: "text-emerald-300",
  },
  {
    icon: "cloud-bolt",
    title: "Cloud Security (CSPM)",
    body: "Cloud security posture management, misconfiguration detection, workload protection, secrets management, and secure cloud architecture design across AWS, GCP, and Azure.",
    iconWrap: "bg-sky-500/15 border-sky-500/25",
    iconColor: "text-sky-300",
  },
  {
    icon: "laptop",
    title: "Endpoint Security (EDR/XDR)",
    body: "EDR/XDR deployment, endpoint hardening, patch management, device encryption enforcement, and security policy management across workstations, servers, and mobile devices.",
    iconWrap: "bg-slate-500/15 border-slate-500/25",
    iconColor: "text-slate-200",
  },
  {
    icon: "clipboard-check",
    title: "Security Assessments",
    body: "Comprehensive security posture assessments — gap analysis, risk scoring, compliance reviews against NIST CSF / CIS Controls / SOC 2, and a prioritized remediation roadmap your team can act on.",
    iconWrap: "bg-amber-500/15 border-amber-500/25",
    iconColor: "text-amber-300",
  },
];

export const SECURITY_PRINCIPLES = [
  {
    icon: "magnifying-glass",
    title: "Threat Modeling in Architecture Phase",
    body: "We identify attack surfaces, trust boundaries, and data flows before writing a single line of code. STRIDE methodology applied to every system design.",
  },
  {
    icon: "code",
    title: "Secure Coding Standards & SAST in CI/CD",
    body: "Static analysis, dependency vulnerability scanning, and secret detection run on every commit — nothing reaches production with known flaws.",
  },
  {
    icon: "crosshairs",
    title: "Penetration Test Before Every Launch",
    body: "No system leaves our hands without a penetration test and security review. We test what we build — not the other way around.",
  },
  {
    icon: "file-contract",
    title: "Compliance Designed In (HIPAA, SOC 2, FedRAMP)",
    body: "Compliance requirements are defined before architecture, not retrofitted after launch. Audit trails, encryption, access controls — built in from day one.",
  },
];

export type CaseStudy = {
  client: string;
  sector: string;
  icon: string;
  iconWrap: string;
  iconColor: string;
  bar: string;
  challenge: string;
  actions: string[];
  stats: { value: string; label: string; accent?: string }[];
  aria: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    client: "Regional Trucking Co.",
    sector: "Transportation · 300 employees",
    icon: "truck",
    iconWrap: "bg-amber-500/15 border-amber-500/25",
    iconColor: "text-amber-300",
    bar: "from-red-700 to-red-500",
    challenge:
      "No security monitoring, flat network architecture, and unpatched Windows Server 2012 endpoints exposed to ransomware. A phishing campaign had already penetrated one workstation undetected.",
    actions: [
      "Full network segmentation and zero-trust access controls",
      "EDR deployment across 280 endpoints",
      "SIEM implementation with 24/7 alerting",
      "Incident response playbooks and tabletop exercises",
    ],
    stats: [
      { value: "0", label: "Incidents since" },
      { value: "94", label: "Security score", accent: "text-green-400" },
      { value: "6wk", label: "To harden" },
    ],
    aria: "Case study: Regional trucking company ransomware prevention",
  },
  {
    client: "Multi-Site Clinic Group",
    sector: "Healthcare · 12 locations",
    icon: "heart-pulse",
    iconWrap: "bg-emerald-500/15 border-emerald-500/25",
    iconColor: "text-emerald-300",
    bar: "from-emerald-700 to-emerald-500",
    challenge:
      "PHI accessible over unencrypted connections, shared login credentials across clinical staff, no audit trail for EHR access, and a looming HIPAA audit with significant gap exposure.",
    actions: [
      "End-to-end encryption for all PHI at rest and in transit",
      "Role-based access control and per-user audit logging",
      "MFA deployment across all clinical systems",
      "HIPAA Security Rule gap analysis and remediation",
    ],
    stats: [
      { value: "Pass", label: "HIPAA audit", accent: "text-green-400" },
      { value: "100%", label: "PHI encrypted" },
      { value: "8wk", label: "Timeline" },
    ],
    aria: "Case study: Healthcare provider HIPAA compliance and breach prevention",
  },
  {
    client: "Mid-Size Municipality",
    sector: "Government · 85k residents",
    icon: "landmark",
    iconWrap: "bg-blue-500/15 border-blue-500/25",
    iconColor: "text-blue-300",
    bar: "from-blue-700 to-blue-500",
    challenge:
      "Active ransomware infection had encrypted city financial systems and permitting databases. Operations were running on paper. Recovery time was unknown. Ransom demand: $420,000.",
    actions: [
      "Rapid incident response — isolated spread within 4 hours",
      "Clean restore from offline backups — no ransom paid",
      "Root cause: unpatched VPN appliance (CVE remediated)",
      "Full security overhaul post-recovery, SOC deployed",
    ],
    stats: [
      { value: "$0", label: "Ransom paid" },
      { value: "72hr", label: "Recovery time" },
      { value: "96", label: "Score now" },
    ],
    aria: "Case study: Municipal government ransomware recovery and hardening",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  aria: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "SoftwarePros didn't just find vulnerabilities — they explained what each one meant to our business in plain English. The security assessment was eye-opening. We had no idea we were this exposed. Six weeks later, our posture is unrecognizable.",
    name: "Mike T.",
    role: "VP of Operations · Regional Logistics Company",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
    aria: "Testimonial from VP of Operations at a logistics company",
  },
  {
    quote:
      "We were facing a HIPAA audit with real risk of fines. SoftwarePros came in, did a full gap analysis, and helped us remediate every finding in eight weeks. We passed the audit clean. Their documentation was so thorough our auditors were impressed.",
    name: "Sandra M.",
    role: "IT Director · Multi-Site Clinic Group",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
    aria: "Testimonial from IT Director at a healthcare network",
  },
  {
    quote:
      "We were hit by ransomware on a Tuesday. SoftwarePros had our systems back online by Friday — without paying a cent. Their incident response team was calm, methodical, and transparent with city leadership throughout. They then rebuilt our entire security posture.",
    name: "James R.",
    role: "City Manager · Mid-Size Municipality",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    aria: "Testimonial from City Manager after ransomware recovery",
  },
  {
    quote:
      "Our enterprise clients were starting to require SOC 2 Type II as a contract condition. SoftwarePros handled the entire security program build — from controls implementation to evidence collection. We achieved SOC 2 certification faster than any peer company I know.",
    name: "David K.",
    role: "CTO · B2B SaaS Platform",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
    aria: "Testimonial from CTO at a SaaS company",
  },
];

export const TRUST_STRIP = [
  { value: "200+", label: "Security assessments completed" },
  { value: "$0", label: "Ransom paid by clients in our care" },
  { value: "91/100", label: "Avg. security score post-hardening", accent: "text-green-400" },
  { value: "100%", label: "HIPAA / SOC 2 audit pass rate" },
];

export const COMPLIANCE_FRAMEWORKS = [
  { icon: "shield", name: "SOC 2 Type II", body: "Security · Availability · Confidentiality", color: "text-red-400" },
  { icon: "heart-pulse", name: "HIPAA", body: "Healthcare data protection & PHI security", color: "text-emerald-300" },
  { icon: "building-columns", name: "NIST CSF", body: "Identify · Protect · Detect · Respond · Recover", color: "text-blue-300" },
  { icon: "credit-card", name: "PCI DSS", body: "Payment card data security standards", color: "text-orange-300" },
  { icon: "landmark", name: "FedRAMP", body: "Federal cloud security authorization", color: "text-purple-300" },
  { icon: "list-check", name: "CIS Controls", body: "18 Critical Security Controls framework", color: "text-cyan-300" },
  { icon: "globe", name: "ISO 27001", body: "Information security management system", color: "text-yellow-300" },
  { icon: "certificate", name: "CMMC", body: "Cybersecurity Maturity Model Certification", color: "text-slate-300" },
];

export type SocEvent = {
  type: "ok" | "warning" | "blocked";
  glyph: string;
  color: string;
  msg: string;
  detail: string;
  meta: string;
};

/**
 * Illustrative SOC telemetry for the live dashboard. This is demo content that
 * models the shape of real alerts — it is not wired to a production SIEM.
 */
export const SOC_EVENT_POOL: SocEvent[] = [
  {
    type: "ok",
    glyph: "✓",
    color: "text-green-400",
    msg: "Auth success · admin@company.com",
    detail:
      "Successful authentication from admin@company.com via IP 73.42.18.1 (New York, US). MFA verified. Session token issued.",
    meta: "Source: Auth Service · Risk: None",
  },
  {
    type: "warning",
    glyph: "!",
    color: "text-yellow-300",
    msg: "Unusual login location detected · MFA enforced",
    detail:
      "Login attempt from Netherlands (185.4.22.1) for a user who normally authenticates from Texas. MFA challenge sent and verified.",
    meta: "Source: IAM · Risk: Low → Mitigated",
  },
  {
    type: "blocked",
    glyph: "×",
    color: "text-red-400",
    msg: "Brute force blocked · 185.220.101.5 (5 attempts)",
    detail:
      "5 consecutive failed authentication attempts from IP 185.220.101.5 (Tor exit node). Account temporarily locked. IP added to blocklist.",
    meta: "Source: WAF · Risk: High → Blocked",
  },
  {
    type: "ok",
    glyph: "✓",
    color: "text-green-400",
    msg: "SAST scan complete · 0 new vulnerabilities detected",
    detail:
      "Automated static analysis completed on commit a3f91bc. No new CWEs detected. Dependency check: 0 critical advisories.",
    meta: "Source: CI/CD · Risk: None",
  },
  {
    type: "ok",
    glyph: "✓",
    color: "text-green-400",
    msg: "Automated backup complete · 3.2GB encrypted",
    detail:
      "Nightly database backup completed successfully. Snapshot encrypted with AES-256. Offsite replication confirmed.",
    meta: "Source: Backup Service · Risk: None",
  },
  {
    type: "warning",
    glyph: "!",
    color: "text-yellow-300",
    msg: "API rate limit threshold reached · /auth/login",
    detail:
      "The /auth/login endpoint hit 90% of its rate limit threshold. No block issued yet. Monitoring for escalation.",
    meta: "Source: API Gateway · Risk: Medium",
  },
  {
    type: "ok",
    glyph: "✓",
    color: "text-green-400",
    msg: "TLS certificate renewed · api.softwarepros.org",
    detail:
      "SSL/TLS certificate auto-renewed via LetsEncrypt ACME protocol. Valid for 90 days. No downtime incurred.",
    meta: "Source: Cert Manager · Risk: None",
  },
  {
    type: "blocked",
    glyph: "×",
    color: "text-red-400",
    msg: "SQL injection attempt blocked · /api/search",
    detail:
      "Malformed query parameter detected by WAF rule SQL-001. Request rejected with 400. IP flagged for monitoring.",
    meta: "Source: WAF · Risk: High → Blocked",
  },
  {
    type: "ok",
    glyph: "✓",
    color: "text-green-400",
    msg: "Vulnerability patch deployed · CVE-2024-10978",
    detail:
      "PostgreSQL updated from 15.2 to 15.5. CVE-2024-10978 remediated. Zero downtime rolling update completed.",
    meta: "Source: Patch Manager · Risk: None",
  },
  {
    type: "warning",
    glyph: "!",
    color: "text-yellow-300",
    msg: "Privileged account accessed after hours · 01:14 AM",
    detail:
      "Admin account accessed at 01:14 AM. Activity is within expected maintenance window but flagged for audit trail.",
    meta: "Source: PAM · Risk: Low → Logged",
  },
];

export const SECURITY_SECTIONS = [
  { id: "services", label: "Services", icon: "shield-halved" },
  { id: "soc-dashboard", label: "Live SOC", icon: "gauge" },
  { id: "case-studies", label: "Case Studies", icon: "folder-open" },
  { id: "testimonials", label: "Testimonials", icon: "quote-left" },
  { id: "compliance", label: "Compliance", icon: "file-contract" },
  { id: "faq", label: "FAQ", icon: "circle-question" },
  { id: "cta", label: "Get Started", icon: "arrow-right" },
];
