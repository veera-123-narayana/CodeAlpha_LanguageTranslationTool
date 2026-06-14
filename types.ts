/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Language {
  code: string;
  name: string;
  flag: string; // Emoji character
  popular?: boolean;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string; // e.g. "auto" or "en"
  targetLanguage: string; // e.g. "es"
  tone?: 'professional' | 'academic' | 'casual' | 'business' | 'creative' | 'plain';
  grammarCorrection?: boolean;
  enhanceWriting?: boolean;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguageDetected: string;
  confidenceScore: number; // e.g. 0.95
  alternativeSuggestions: string[];
  sentimentScore?: string; // e.g. "Positive", "Neutral", "Negative"
  grammarCorrectedText?: string;
  originalText?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string; // ISO String
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceLanguageName: string;
  targetLanguageName: string;
  tone: string;
  confidence: number;
  isFavorite: boolean;
  sentiment: string;
}

export interface AnalyticsStats {
  totalTranslations: number;
  successRate: number; // percentage
  charactersTranslated: number;
  wordsTranslated: number;
  languagePairs: { pair: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
}
