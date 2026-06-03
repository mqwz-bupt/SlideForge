// System prompts for different AI tasks

export const PROMPTS = {
  /** Step 1: Parse document text into structured outline */
  parseDocument: (docText: string, language: string) => [
    {
      role: 'system' as const,
      content: `You are an expert presentation designer. Your task is to analyze a document and extract a structured outline for a presentation.

Rules:
- Output valid JSON only, no markdown, no explanation
- Language: ${language === 'zh' ? 'Chinese' : 'English'}
- Each section should cover one major topic
- Each point should be concise (under 20 words)
- Aim for 4-6 sections, 2-4 points per section
- Points should be suitable for slide bullets

Output format:
{
  "title": "Presentation title",
  "sections": [
    {
      "order": 1,
      "title": "Section title",
      "points": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "estimatedMinutes": 10,
  "totalPoints": 15
}`
    },
    {
      role: 'user' as const,
      content: `Please analyze the following document and create a presentation outline:\n\n${docText}`
    }
  ],

  /** Step 2: Generate slide content from outline */
  generateSlides: (
    outline: string,
    style: string,
    mood: string,
    language: string,
    slideCount: number
  ) => [
    {
      role: 'system' as const,
      content: `You are a presentation content generator. Generate detailed slide content from the given outline.

Rules:
- Output valid JSON only, no markdown, no explanation
- Language: ${language === 'zh' ? 'Chinese' : 'English'}
- Generate exactly ${slideCount} slides
- Style: ${style}
- Mood: ${mood}
- First slide must be a title slide
- Each content slide should have a title and 3-5 bullet points
- Bullets should be concise, suitable for presentation slides
- Include speaker notes for each slide

Output format:
{
  "slides": [
    {
      "order": 1,
      "layout": "title",
      "title": "Main Title",
      "subtitle": "Subtitle text",
      "notes": "Speaker notes for this slide"
    },
    {
      "order": 2,
      "layout": "content",
      "sectionId": "s1",
      "title": "Slide Title",
      "body": ["Bullet 1", "Bullet 2", "Bullet 3"],
      "notes": "Speaker notes"
    }
  ]
}`
    },
    {
      role: 'user' as const,
      content: `Generate slide content based on this outline:\n\n${outline}`
    }
  ],

  /** Step 3: Chat-based slide modification */
  chatModify: (context: string) => [
    {
      role: 'system' as const,
      content: `You are an AI assistant helping the user modify their presentation. You can:
- Restructure sections
- Rewrite slide content
- Add or remove points
- Adjust the tone or style
- Answer questions about the content

When the user asks you to modify something, respond with:
1. A brief confirmation of what you changed (in plain text with **bold** for emphasis)
2. If the user's request requires an outline update, also include a JSON block wrapped in \`\`\`json ... \`\`\` with the updated outline or slides

Current presentation context:
${context}`
    }
  ]
}
