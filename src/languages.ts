/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', popular: true },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', popular: true },
  { code: 'fr', name: 'French', flag: '🇫🇷', popular: true },
  { code: 'de', name: 'German', flag: '🇩🇪', popular: true },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', popular: true },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳', popular: true },
  { code: 'or', name: 'Odia', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'sa', name: 'Sanskrit', flag: '🇮🇳' },
  { code: 'zh-CN', name: 'Chinese Simplified', flag: '🇨🇳', popular: true },
  { code: 'zh-TW', name: 'Chinese Traditional', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', popular: true },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', popular: true },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', popular: true },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', popular: true },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', popular: true },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'ku', name: 'Kurdish', flag: '🇮🇶' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
];

export const getLanguageName = (code: string): string => {
  if (code.toLowerCase() === 'auto') return 'Auto Detect';
  const match = LANGUAGES.find(l => l.code.toLowerCase() === code.toLowerCase());
  return match ? `${match.flag} ${match.name}` : code.toUpperCase();
};
