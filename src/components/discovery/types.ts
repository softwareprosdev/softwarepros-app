export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  pending?: boolean;
};

export type SessionAnalysis = {
  industry: string | null;
  scale: string | null;
  complexity: string | null;
  currentState: string | null;
  clarityScore: number;
  requirementsFound: number;
  requirementsTarget: number;
  recommendedPlatform: string | null;
  modules: string[];
  unclearModules: string[];
  clarifications: string[];
  suggestions: string[];
};

export type AttachmentSummary = {
  id: string;
  filename: string;
  kind: "DOCUMENT" | "IMAGE";
  mimeType: string;
  sizeBytes: number;
};

export type RecentSession = {
  publicId: string;
  title: string;
  industry: string | null;
  updatedAt: string;
};

export type InputMode = "chat" | "voice" | "upload" | "image";

export const DEFAULT_SUGGESTIONS = [
  "I need to replace spreadsheets",
  "I need a custom platform",
  "I need AI for my business",
  "I need cybersecurity help",
  "I need to automate operations",
];
