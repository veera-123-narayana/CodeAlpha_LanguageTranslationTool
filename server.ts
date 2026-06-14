/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';

import pdfParse from 'pdf-parse';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Set up JSON parsing with a high limit (50mb) for base64 images and documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let aiClient: GoogleGenAI | null = null;

// Lazy initialization of GoogleGenAI SDK with key validation
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please add your Gemini key in Settings > Secrets in the AI Studio UI.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Text Translation Endpoint
app.post('/api/translate/text', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, tone, grammarCorrection, enhanceWriting } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and targetLanguage are required.' });
    }

    const ai = getAiClient();

    const systemInstruction = `You are a professional enterprise-level translation engine configured for maximum accuracy, linguistic fluency, and context awareness.
Translate the requested text accurately. Adjust language registers based on tone requested.
You MUST output your response ONLY as a JSON object matching this exact schema:
{
  "translatedText": "string - Content translated accurately, keeping semantic structure and local nuances intact.",
  "sourceLanguageDetected": "string - ISO code (e.g. 'en', 'es', 'hi') of the source text language.",
  "confidenceScore": 0.95,
  "alternativeSuggestions": ["string", "string"],
  "sentimentScore": "string - Emotional sentiment of text (e.g. 'Positive', 'Neutral', 'Negative', 'Professional', 'Joyful')",
  "grammarCorrectedText": "string - Optional. If requested, provide original text with corrected grammar. Otherwise leave blank."
}
Do NOT include any markdown block markers like \`\`\`json or trailing commentary. Just return raw JSON.`;

    const userPrompt = `Source text: "${text}"
Source Language: "${sourceLanguage || 'Auto Detect'}"
Target Language: "${targetLanguage}"
Tone requirement: "${tone || 'plain'}"
Grammar Correction required before translation: ${!!grammarCorrection}
Writing Enhancement required: ${!!enhanceWriting}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            sourceLanguageDetected: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            alternativeSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sentimentScore: { type: Type.STRING },
            grammarCorrectedText: { type: Type.STRING }
          },
          required: ['translatedText', 'sourceLanguageDetected', 'confidenceScore', 'alternativeSuggestions', 'sentimentScore']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during translation.'
    });
  }
});

// 2. Image OCR Translation Endpoint
app.post('/api/translate/image', async (req, res) => {
  try {
    const { imageBase64, targetLanguage } = req.body;

    if (!imageBase64 || !targetLanguage) {
      return res.status(400).json({ error: 'imageBase64 and targetLanguage are required.' });
    }

    // Capture MIME type and clean base64 string
    const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid Image format. Must be a valid base64 Data URI.' });
    }

    const mimeType = match[1];
    const cleanBase64 = match[2];

    const ai = getAiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const systemInstruction = `You are an expert multimodal translation assistant. Your task is to perform high-fidelity OCR to extract original text from the provided image and translate that text into the specified language.
Translate and organize the response into a clean structural format.
You MUST output your response ONLY as a JSON object matching this exact schema:
{
  "originalText": "string - Extracted text exactly as seen in the image",
  "translatedText": "string - The extracted text translated into the target language",
  "sourceLanguageDetected": "string - ISO code",
  "confidenceScore": 0.95
}
Do NOT include any markdown code blocks. Just return raw JSON.`;

    const userPrompt = `Translate detected text into: "${targetLanguage}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [imagePart, userPrompt],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            translatedText: { type: Type.STRING },
            sourceLanguageDetected: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ['originalText', 'translatedText', 'sourceLanguageDetected', 'confidenceScore']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (error: any) {
    console.error('OCR Translation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during OCR translation.'
    });
  }
});

// 3. Document Parser and Translator Endpoint
app.post('/api/translate/document', async (req, res) => {
  try {
    const { documentBase64, fileName, fileType, targetLanguage } = req.body;

    if (!documentBase64 || !targetLanguage || !fileType) {
      return res.status(400).json({ error: 'documentBase64, fileType and targetLanguage are required.' });
    }

    // Decode file buffer from base64
    const buffer = Buffer.from(documentBase64, 'base64');
    let extractedText = '';

    if (fileType === 'application/pdf') {
      try {
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } catch (pdfErr: any) {
        throw new Error('Failed to parse PDF document structure: ' + pdfErr.message);
      }
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName?.endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (docxErr: any) {
        throw new Error('Failed to parse DOCX document structure: ' + docxErr.message);
      }
    } else {
      // Assume simple text format
      extractedText = buffer.toString('utf8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Document appears to be empty or unreadable.' });
    }

    // Limit translation scope to prevent token overload on large files (e.g. limit to first 12,000 chars)
    const MAX_DOC_CHARS = 12000;
    let textToTranslate = extractedText;
    let isTruncated = false;
    if (extractedText.length > MAX_DOC_CHARS) {
      textToTranslate = extractedText.substring(0, MAX_DOC_CHARS);
      isTruncated = true;
    }

    const ai = getAiClient();

    const systemInstruction = `You are a high-end secure document translator. Parse the provided document text, translate it entirely into the target language, and preserve paragraph structures and lists.
Output your response ONLY as a JSON object matching this exact schema:
{
  "originalText": "string - Clean original extracted text",
  "translatedText": "string - Translated document text preserving spacing and paragraphs",
  "sourceLanguageDetected": "string - ISO code",
  "confidenceScore": 0.98
}
Do NOT include markdown block markers inside your output. Just return raw JSON.`;

    const userPrompt = `Translate this document content into "${targetLanguage}".
Document Content:
"${textToTranslate}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            translatedText: { type: Type.STRING },
            sourceLanguageDetected: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ['originalText', 'translatedText', 'sourceLanguageDetected', 'confidenceScore']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    if (isTruncated) {
      parsedData.translatedText += '\n\n[Document warning: Content truncated due to character limits]';
      parsedData.originalText += '\n\n[Document warning: Content truncated due to character limits]';
    }
    
    return res.json(parsedData);

  } catch (error: any) {
    console.error('Document Translation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during document translation.'
    });
  }
});

// 4. Premium AI Text-To-Speech Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    const ai = getAiClient();
    const voiceName = voice || 'Kore'; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say clearly and naturally with proper pronunciation: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data returned from the speech synthesis engine.');
    }

    return res.json({ audioBase64: base64Audio });

  } catch (error: any) {
    console.error('TTS Synthesis error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during speech synthesis.'
    });
  }
});

// Setup Vite Dev Server / Static Ingress
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Language Translation Assistant server launched on http://localhost:${PORT}`);
  });
}

initServer();
