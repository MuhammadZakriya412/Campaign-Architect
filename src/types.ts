export interface SubjectVariant {
  subject: string;
  preview: string;
  type: 'urgent' | 'benefit' | 'curiosity';
}

export interface CampaignVariant {
  subject: string;
  preview: string;
  bodyMarkdown: string;
  bodyHtml: string;
  spamScore: number;
  spamTriggers: string[];
  readabilityGrade: string;
  readTime: string;
  optimizationTips: string[];
  suggestedVisualPrompt?: string;
  bannerImage?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  campaignType: string;
  audience: string;
  description: string;
  tone: string;
  extraOffer?: string;
  brandingColor: string;
  subjectLines: string[]; // [Urgent, Benefit, Curiosity]
  previewTexts: string[]; // [Urgent, Benefit, Curiosity]
  headline: string;
  bodyMarkdown: string;
  bodyHtml: string;
  ctaText: string;
  ctaLink?: string;
  spamScore: number;
  spamTriggers: string[];
  readabilityGrade: string;
  readTime: string;
  optimizationTips: string[];
  suggestedVisualPrompt: string;
  bannerImage?: string; // Base64 or placeholder
  createdAt: string;
  predictedCTR?: string[]; // [Urgent, Benefit, Curiosity]
  predictedOpenRate?: string[]; // [Urgent, Benefit, Curiosity]
  predictedSentiment?: string[]; // [Urgent, Benefit, Curiosity]
  spamSafeRating?: string[]; // [Urgent, Benefit, Curiosity]
  copyLengthOption?: string;
  selectedElements?: string[];
  variants?: CampaignVariant[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  role: 'strategist' | 'copywriter' | 'editor';
  messages: ChatMessage[];
}

export type CampaignTypePreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type TonePreset = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};
