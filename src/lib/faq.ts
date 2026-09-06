import type { FaqEntry } from "@/lib/schema";
import { ORG_EMAIL } from "@/lib/org";

/**
 * Answer content for AEO / generative search.
 *
 * Two rules govern everything in this file:
 *
 * 1. **Every answer must stand alone.** An AI answer engine quotes one
 *    paragraph out of context, so each answer opens with a direct sentence
 *    that names the subject rather than starting with "We do" or "It depends".
 *
 * 2. **Nothing here may be a claim the company cannot back.** No prices, no
 *    turnaround guarantees, no client names, no certifications we have not
 *    listed elsewhere on the site. The system prompt in `ai/prompts.ts`
 *    holds the AI Architect to the same line; this file is the static half of
 *    that same rule.
 */

export const HOME_FAQS: FaqEntry[] = [
  {
    question: "What does SoftwarePros do?",
    answer:
      "SoftwarePros is a software engineering firm that designs and builds custom technology systems across four practice areas: artificial intelligence, software engineering, cybersecurity, and cloud infrastructure. Work spans 20 engineering disciplines and 15 industries, and every engagement begins by defining the system before any code is written.",
  },
  {
    question: "How does the AI Discovery Center work?",
    answer:
      "The AI Discovery Center is a conversation with an AI Architect that turns a business problem described in plain language into an engineer-ready system definition. You describe the problem by voice, text, or uploaded documents; the AI asks clarifying questions, tracks requirements as it finds them, and produces a shareable project summary covering scope, components, technology stack, and phasing. Every summary is an estimate that a Senior Software Architect reviews before it becomes a commitment.",
  },
  {
    question: "Why start with discovery instead of a quote?",
    answer:
      "A quote given before the system is defined prices a guess. Discovery establishes what the software actually has to do — the integrations, the compliance regime, the edge cases the current process hides — so the estimate that follows describes real work. It also costs nothing and takes minutes rather than weeks of meetings.",
  },
  {
    question: "What industries does SoftwarePros build software for?",
    answer:
      "SoftwarePros builds for 15 industries: healthcare, hospice, logistics, transportation, hotshot trucking, manufacturing, government, municipalities, construction, real estate, finance, insurance, professional services, retail, and technology. Domain fluency matters because the regulatory regime and operational vocabulary of a sector decide whether software gets used or worked around.",
  },
  {
    question: "How do I start a project with SoftwarePros?",
    answer:
      "There are four ways to start: speak to the AI Architect by voice, type a description in the discovery chat, upload existing documents and designs for review, or book a discovery call with the team. All four lead to the same place — a defined system and a conversation with an engineer.",
  },
];

export const SOLUTIONS_FAQS: FaqEntry[] = [
  {
    question: "What engineering disciplines does SoftwarePros cover?",
    answer:
      "SoftwarePros covers 20 engineering disciplines grouped into five categories: AI and intelligence, software engineering, security and infrastructure, business systems, and industry-specific systems. They are offered as one practice rather than separate service lines because the disciplines are interdependent — an AI feature is only as sound as the data platform and the security model underneath it.",
  },
  {
    question: "What is custom software development?",
    answer:
      "Custom software is software engineered around a specific organization's business logic instead of adapted from a template or configured out of an off-the-shelf product. It is the right choice when the process being automated is the thing that differentiates the business, or when the workarounds surrounding a packaged product have themselves become the system.",
  },
  {
    question: "How does SoftwarePros approach AI development?",
    answer:
      "AI development at SoftwarePros means production systems, not demos: large language model applications, retrieval-augmented generation over an organization's own documents, autonomous agents that execute multi-step processes, document intelligence, voice interfaces, and predictive analytics. Each is built with the evaluation, guardrails, and observability that separate a model that works in a notebook from one that works on a Tuesday afternoon in production.",
  },
  {
    question: "Do you work with existing systems or only new builds?",
    answer:
      "Both. A significant share of the work is integration, modernization, and hardening of systems that already exist — legacy migration, API platforms placed in front of older software, and security assessments of applications already in production. Replacing a working system is rarely the cheapest way to fix it.",
  },
  {
    question: "What technologies does SoftwarePros build with?",
    answer:
      "The stack is chosen per system rather than by default, and spans more than 50 technologies including Next.js, React, Node.js, Python, FastAPI, PostgreSQL, and the Anthropic and OpenAI model APIs, deployed to AWS, Azure, or Google Cloud with infrastructure defined as code.",
  },
];

export const CYBERSECURITY_FAQS: FaqEntry[] = [
  {
    question: "What cybersecurity services does SoftwarePros provide?",
    answer:
      "SoftwarePros provides offensive security, defensive architecture, and security operations: penetration testing and red teaming, application and cloud security assessments, secure-by-design system architecture, compliance program implementation, threat detection and monitoring, and incident response. Security is also built into every system the firm engineers rather than added afterward.",
  },
  {
    question: "What is a security assessment and what does it produce?",
    answer:
      "A security assessment is a structured examination of an application, cloud environment, or organization to find the weaknesses an attacker would use. It produces a prioritized findings report that states each issue, the realistic impact if it were exploited, and the specific remediation — written so an engineering team can act on it directly rather than a summary that only satisfies an auditor.",
  },
  {
    question: "How is security built into software development?",
    answer:
      "Security is built in by making it a stage of the pipeline rather than a gate at the end: threat modelling during architecture, secure coding standards and dependency scanning during the build, penetration testing and compliance verification before release, and continuous monitoring after deployment. Vulnerabilities found during design cost a conversation; the same vulnerability found in production costs an incident.",
  },
  {
    question: "Why does secure-by-design matter more than a security audit?",
    answer:
      "An audit describes a system that already exists, so its findings are constrained by decisions that are expensive to reverse. Secure-by-design moves the decisions — authentication model, data boundaries, blast radius, audit trail — to the point where they are still cheap to change. Audits remain necessary; they are a verification step, not a security strategy.",
  },
  {
    question: "Which compliance frameworks does SoftwarePros work with?",
    answer:
      "Work regularly involves HIPAA in healthcare and hospice, SOC 2 for technology and finance, PCI DSS for payment flows, and Section 508 and WCAG accessibility requirements for public-sector systems. The engineering work is implementing the controls those frameworks require and producing the evidence an assessor asks for, not issuing the certification itself.",
  },
];

export const INDUSTRIES_FAQS: FaqEntry[] = [
  {
    question: "Which industries does SoftwarePros serve?",
    answer:
      "SoftwarePros serves 15 industries: healthcare, hospice, logistics, transportation, hotshot trucking, manufacturing, government, municipalities, construction, real estate, finance, insurance, professional services, retail, and technology.",
  },
  {
    question: "Why does industry experience matter in software development?",
    answer:
      "Industry experience decides where a project starts. A team that already knows what HL7 means in healthcare, what an EDI 214 carries in logistics, or what a prevailing-wage payroll run has to produce in construction begins discovery at the actual problem instead of at a glossary. Software that misunderstands the domain does not get used — it gets worked around.",
  },
  {
    question: "What does SoftwarePros build for regulated industries?",
    answer:
      "For regulated industries the work includes the control layer the regulation demands alongside the feature itself: consent tracking and audit logging for HIPAA systems, records retention and FOIA tracking for government, KYC and AML screening plus reconcilable ledgers for finance, and accessibility conformance for public-sector procurement. The compliance requirement is treated as a system requirement, not documentation added at the end.",
  },
  {
    question: "Can SoftwarePros integrate with legacy or industry systems?",
    answer:
      "Yes — integration is a core part of most engagements. Typical examples are EHR and HL7/FHIR exchange in healthcare, EDI with carriers and 3PLs in logistics, ERP and MES on the manufacturing floor, MLS/IDX feeds in real estate, and the county or state systems a municipality is not replacing this budget cycle.",
  },
];

export const ABOUT_FAQS: FaqEntry[] = [
  {
    question: "How does SoftwarePros approach a new project?",
    answer:
      "SoftwarePros starts every project with discovery rather than a quote. The AI Discovery Center turns a problem described in plain language into a system definition — scope, components, technology stack, and phasing — which a Senior Software Architect reviews before it becomes a commitment. From there the work moves through the same eight stages every time: discover, design, build, secure, deploy, monitor, scale, optimize.",
  },
  {
    question: "Why won't SoftwarePros quote a price before scope is defined?",
    answer:
      "A price quoted before the system is defined is a price on a guess. SoftwarePros establishes the integrations, the compliance regime, and the edge cases the current manual process hides first, so the estimate that follows describes real work rather than an optimistic sketch. Discovery costs nothing and takes minutes, which is why it comes before the number rather than after it.",
  },
  {
    question: "How does SoftwarePros treat security?",
    answer:
      "Security at SoftwarePros is a design constraint, not an audit step at the end. Threat modelling happens during architecture, secure coding standards and dependency scanning during the build, penetration testing and compliance verification before release, and monitoring after deployment. The decisions that matter most — authentication model, data boundaries, blast radius, audit trail — are made while they are still cheap to change.",
  },
  {
    question:
      "What does it mean that SoftwarePros engineers own systems end to end?",
    answer:
      "End-to-end ownership means the engineer who designs a system also builds it, secures it, deploys it, and watches it run. There is no handoff from an architect to a delivery team to an operations group, so the person making an architectural decision is the person who lives with it in production. Clients talk to that engineer rather than to an account manager.",
  },
  {
    question:
      "What makes SoftwarePros different from a generalist development shop?",
    answer:
      "SoftwarePros differs from a generalist development shop in two ways: domain fluency and range. The team arrives at a healthcare, logistics, construction, or public-sector engagement already knowing the regulatory regime and the operational vocabulary, and it covers 20 engineering disciplines — AI, software, security, cloud, and business systems — as a single practice, because an AI feature is only as sound as the data platform and security model beneath it.",
  },
];

export const CAREERS_FAQS: FaqEntry[] = [
  {
    question: "Is SoftwarePros hiring?",
    answer:
      `SoftwarePros does not list open roles on this site. Speculative applications are still welcome: email ${ORG_EMAIL} with what you have built, and an engineer reads it. There is no application portal and no requisition list to check — the inbox is the process, and a strong message describing real systems is worth more than a posting to reply to.`,
  },
  {
    question: "How do I apply to SoftwarePros?",
    answer:
      `Applications to SoftwarePros go to ${ORG_EMAIL}. Lead with what you have built — systems you designed, code you can show, problems you owned from architecture through production — rather than a list of technologies. Because no roles are posted, say plainly what kind of work you want and which of the disciplines and industries the firm works in you want to do it in.`,
  },
  {
    question: "What does SoftwarePros look for in engineers?",
    answer:
      "SoftwarePros looks for engineers who own systems end to end: people who design an architecture and then build, secure, deploy, and operate it. That means treating security as a design constraint rather than a later audit, learning a client's domain well enough to argue with the requirements, and refusing to estimate work that has not been scoped. Breadth across disciplines counts for more than depth in a single framework.",
  },
  {
    question: "What kind of work would I do at SoftwarePros?",
    answer:
      "Work at SoftwarePros spans 20 engineering disciplines across 15 industries: AI systems including LLM applications, retrieval-augmented generation, and autonomous agents; custom software, SaaS, and enterprise platforms; cybersecurity from penetration testing through security operations; and cloud infrastructure, DevOps, and data platforms. Every project runs the same eight-stage pipeline, so an engineer sees a system from definition through production.",
  },
];

export const CONTACT_FAQS: FaqEntry[] = [
  {
    // Phrased as a "where / what number" question because that is the shape
    // of a local search query, and the answer repeats the NAP verbatim so a
    // voice or AI answer quotes the same address the LocalBusiness node
    // declares. Keep this in sync with ORG_ADDRESS in `lib/org.ts`.
    question: "Where is SoftwarePros located, and what is the phone number?",
    answer:
      "SoftwarePros is at 222 E. Van Buren St., Harlingen, TX 78550-9106, and the phone number is 956.392.1440. The team works with clients across the United States, so an engagement does not require being in the Rio Grande Valley — but the office is a real address and the phone reaches a person.",
  },
  {
    question: "How do I request a security assessment?",
    answer:
      `Submit the contact form with the assessment intent, or email ${ORG_EMAIL} describing the application or environment you want examined and any deadline you are working against. The reply comes from an engineer, and the first conversation is about scope rather than a sales pitch.`,
  },
  {
    question: "What happens after I get in touch?",
    answer:
      "A Senior Software Architect reads the request and responds directly. If a discovery session has already been run, that system definition is the starting point for the conversation; if not, the first call establishes the problem, the constraints, and whether the work is something SoftwarePros should take on.",
  },
  {
    question: "Do I have to talk to the AI first?",
    answer:
      `No. The AI Discovery Center is the fastest way to arrive with a defined scope, but the contact form and ${ORG_EMAIL} reach a person directly. Email is the right channel for NDAs, RFPs, and anything that does not fit in a form.`,
  },
];
