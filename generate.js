// File: api/generate.js
// This is your helper program. You can deploy it for free on Vercel.

import OpenAI from 'openai';

// 1. Initialize the AI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Your secret key goes here
});

export default async function handler(req, res) {
  // 2. Only accept POST requests with notes
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { notes } = req.body;
  if (!notes) {
    return res.status(400).json({ error: 'No notes provided' });
  }

  try {
    // 3. Ask AI to create flashcards
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Convert the user\'s notes into flashcards. Return ONLY a valid JSON array. Each item must have "front" (question) and "back" (answer).'
        },
        {
          role: 'user',
          content: `Create 3-5 flashcards from these notes: ${notes}`
        }
      ],
      temperature: 0.7,
    });

    // 4. Get the AI's text response
    const content = completion.choices[0].message.content;
    
    // 5. Try to parse it as JSON (the AI should return JSON)
    let flashcards;
    try {
      flashcards = JSON.parse(content);
    } catch (e) {
      // If the AI didn't return valid JSON, create a fallback
      flashcards = [
        { front: 'What was in the notes?', back: 'The AI had trouble processing: ' + notes.substring(0, 50) + '...' }
      ];
    }

    // 6. Send the flashcards back to your frontend
    res.status(200).json({ success: true, flashcards });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
}