import { NextApiRequest, NextApiResponse } from 'next';
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../../lib/upstash';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not found in environment variables' });
    }

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        const { success } = await rateLimit.limit(ip as string);
        if (!success) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        const { message } = req.body;

        // Precise prompt for JSON output
        const modifiedPrompt = `Respond with a valid JSON object with keys "1.", "2.", and "3." containing unique Twitter bios. Context: ${message}. Each bio must be:
- Less than 300 characters
- Professional tone
- Reflect the provided context
- Use short, punchy sentences
Example: {"1.": "Tech innovator building the future. Passionate about AI and solving complex problems.", "2.": "Digital creator turning ideas into reality. Lover of code and creativity.", "3.": "Transforming challenges into opportunities. Always learning, always growing."}`;

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-pro',
        });

        const result = await model.generateContent(modifiedPrompt);
        const responseText = result.response.text().trim();

        // Clean and parse JSON
        const cleanedResponseText = responseText
            .replace(/^```json\n/, '')
            .replace(/```$/, '')
            .trim();

        const parsedResponse = JSON.parse(cleanedResponseText);

        return res.status(200).json({
            response: {
                response: {
                    candidates: [{
                        content: {
                            parts: [{ text: cleanedResponseText }],
                            role: 'model'
                        },
                        finishReason: 'STOP',
                        index: 0,
                        safetyRatings: []
                    }],
                    usageMetadata: {
                        promptTokenCount: 0,
                        candidatesTokenCount: 0,
                        totalTokenCount: 0
                    }
                }
            }
        });
    } catch (error: any) {
        console.error('Detailed Error:', error);
        return res.status(500).json({
            error: error.message,
            fullError: error
        });
    }
}