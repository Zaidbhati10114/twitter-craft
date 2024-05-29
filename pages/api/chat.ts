import { NextApiRequest, NextApiResponse } from 'next';
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../../lib/upstash';
// Adjust path if necessary

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    //console.log('POST request received');

    if (!apiKey) {
        //console.error('API Key not found in environment variables');
        return res.status(500).json({ error: 'API Key not found in environment variables' });
    }

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        //console.log('IP Address:', ip);

        const { success, remaining, limit, reset } = await rateLimit.limit(ip as string);
        console.log('Rate Limit Check:', { success, remaining, limit, reset });

        if (!success) {
            //console.log('Rate limit exceeded for IP:', ip);
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        const { message, chatHistory } = req.body;
        //console.log('Request Payload:', { message, chatHistory });

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-latest',
        });

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        const chatSession = await model.startChat({
            generationConfig,
            safetySettings,
            history: chatHistory,
        });

        const response = await chatSession.sendMessage(message);
        //console.log('API Response:', response);

        return res.status(200).json({ response });
    } catch (error: any) {
        //console.error('Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
