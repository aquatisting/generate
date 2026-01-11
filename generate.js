// File: api/generate.js
// Your one-file backend with DeepSeek

// 1. Import the same OpenAI SDK
import OpenAI from 'openai';

export default async function handler(req, res) {
  // 2. Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { notes } = req.body;
  if (!notes) {
    return res.status(400).json({ error: 'Please provide some notes' });
  }

  try {
    // 3. INITIALIZE DEEPSEEK CLIENT (THE ONLY MAJOR CHANGE)
    // Use your DeepSeek API key from the platform
    const deepseek = new OpenAI({
      apiKey: process.env.sk-35b3477fc8de42a89e97a91af64642e6, // ✅ Set this in Vercel
      baseURL: 'https://api.deepseek.com', // ✅ DeepSeek's endpoint
    });

    // 4. Call the DeepSeek API
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat', // ✅ Use DeepSeek's model
      messages: [
        {
          role: 'system',
          content: `You are a study assistant. Convert notes into flashcards.
                    Return ONLY a valid JSON array.
                    Each flashcard must be an object with: "front" (question) and "back" (answer).
                    Example: [{"front": "What is photosynthesis?", "back": "The process plants use to make food from sunlight."}]`
        },
        {
          role: 'user',
          content: `Create 3-5 clear flashcards from these notes: ${notes}`
        }
      ],
      temperature: 0.7,
    });

    // 5. Get and parse the AI's response
    const aiResponse = completion.choices[0]?.message?.content;
    
    let flashcards;
    try {
      flashcards = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', aiResponse);
      // Fallback if the AI doesn't return perfect JSON
      flashcards = [{
        front: 'Could not parse complex notes.',
        back: 'Try simplifying your notes or rephrasing.'
      }];
    }

    // 6. Send success response
    res.status(200).json({
      success: true,
      flashcards: flashcards
    });

  } catch (error) {
    // 7. Handle any errors
    console.error('DeepSeek API Error:', error);
    res.status(500).json({
      error: 'Failed to generate flashcards',
      details: error.message
    });
  }
}
