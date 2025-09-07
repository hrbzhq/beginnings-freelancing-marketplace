import ollama from 'ollama';

export async function analyzeJobWithLLM(job: {
  title: string;
  description: string;
  skills: string[];
}): Promise<{
  difficulty: number;
  prospects: number;
  fun: number;
  skills: string[];
}> {
  const prompt = `
Analyze this freelance job posting and provide detailed ratings. Consider the current market context for freelance work.

Job Title: ${job.title}
Job Description: ${job.description}
Current Skills Listed: ${job.skills.join(', ') || 'None specified'}

Please analyze and rate on a scale of 1-10:

1. **Difficulty**: Technical complexity, experience required, learning curve
   - 1-3: Beginner friendly, basic skills
   - 4-6: Intermediate, some experience needed
   - 7-10: Advanced, expert level required

2. **Career Prospects**: Long-term value, industry growth, skill transferability
   - 1-3: Niche or declining field
   - 4-6: Stable but limited growth
   - 7-10: High-growth, transferable skills

3. **Fun/Enjoyment**: Creativity, problem-solving, work-life balance potential
   - 1-3: Repetitive, mundane tasks
   - 4-6: Moderate engagement
   - 7-10: Creative, challenging, enjoyable work

Also extract and suggest relevant skills that would be valuable for this job.

Respond in JSON format:
{
  "difficulty": number,
  "prospects": number,
  "fun": number,
  "skills": ["skill1", "skill2", "skill3"],
  "analysis": "brief explanation of ratings"
}
`;

  try {
    const response = await ollama.chat({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: prompt }],
      format: 'json',
      options: { temperature: 0.3 }
    });

    const result = JSON.parse(response.message.content);
    return {
      difficulty: Math.max(1, Math.min(10, result.difficulty || 5)),
      prospects: Math.max(1, Math.min(10, result.prospects || 5)),
      fun: Math.max(1, Math.min(10, result.fun || 5)),
      skills: result.skills || job.skills || []
    };
  } catch (error) {
    console.error('Error analyzing job with LLM:', error);
    return {
      difficulty: 5,
      prospects: 5,
      fun: 5,
      skills: job.skills || []
    };
  }
}

export async function analyzeEmployerWithLLM(employerData: {
  name: string;
  description?: string;
  reviews?: string[];
}): Promise<{
  credit: number;
  salary: number;
  attitude: number;
  prospects: number;
}> {
  const prompt = `
Analyze this employer and provide ratings on a scale of 1-10 for:
- Credit: How reliable are they in payments?
- Salary: How competitive are their budgets?
- Attitude: How professional/fair are they?
- Prospects: How good are their projects for career growth?

Employer: ${employerData.name}
Description: ${employerData.description || 'No description'}
Reviews: ${employerData.reviews?.join('; ') || 'No reviews'}

Respond in JSON format:
{
  "credit": number,
  "salary": number,
  "attitude": number,
  "prospects": number
}
`;

  try {
    const response = await ollama.chat({
      model: 'deepseek-r1:latest',
      messages: [{ role: 'user', content: prompt }],
      format: 'json'
    });

    const result = JSON.parse(response.message.content);
    return {
      credit: Math.max(1, Math.min(10, result.credit || 5)),
      salary: Math.max(1, Math.min(10, result.salary || 5)),
      attitude: Math.max(1, Math.min(10, result.attitude || 5)),
      prospects: Math.max(1, Math.min(10, result.prospects || 5))
    };
  } catch (error) {
    console.error('Error analyzing employer with LLM:', error);
    return {
      credit: 5,
      salary: 5,
      attitude: 5,
      prospects: 5
    };
  }
}
