// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  messages: Message[];
  web_access: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const body: RequestBody = req.body; // Debugging log

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
      // Debugging log
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
