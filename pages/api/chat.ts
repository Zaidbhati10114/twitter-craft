// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  messages: Message[];
  web_access: boolean;
}

interface RateLimitInfo {
  count: number;
  expiry: number;
}

const rateLimitWindow = 24 * 60 * 60 * 1000; // 24 hours
const rateLimitMaxRequests = 3; // max requests per day
const rateLimitStore: { [key: string]: RateLimitInfo } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get user IP and user ID from cookies
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      let userId = req.cookies['user-id'];

      if (!userId) {
        userId = uuidv4();
        res.setHeader('Set-Cookie', `user-id=${userId}; Path=/; HttpOnly; Max-Age=${rateLimitWindow / 1000}`);
      }

      const identifier = `${ip}-${userId}`;
      const currentTime = Date.now();

      if (!rateLimitStore[identifier]) {
        rateLimitStore[identifier] = { count: 1, expiry: currentTime + rateLimitWindow };
      } else {
        if (currentTime > rateLimitStore[identifier].expiry) {
          rateLimitStore[identifier].count = 1;
          rateLimitStore[identifier].expiry = currentTime + rateLimitWindow;
        } else {
          rateLimitStore[identifier].count++;
        }
      }

      if (rateLimitStore[identifier].count > rateLimitMaxRequests) {
        return res.status(429).json({ error: 'Too Many Requests' });
      }

      const body: RequestBody = req.body;

      const url = process.env.RAPID_API_URL!;
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPID_API_KEY!,
          'X-RapidAPI-Host': process.env.RAPID_API_HOST!,
        },
        body: JSON.stringify(body)
      };

      const response = await fetch(url, options);
      const result = await response.json();

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
