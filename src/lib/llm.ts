import { spawn } from 'child_process';

export interface LLMSuggestions {
  promptSuggestions: Array<{
    name: string;
    currentTemplate: string;
    newTemplate: string;
    reason: string;
  }>;
  reportIdeas: Array<{
    title: string;
    description: string;
    category: string;
    estimatedDemand: number;
    reason: string;
  }>;
  weightAdjustments: {
    skillWeight: number;
    experienceWeight: number;
    locationWeight: number;
    salaryWeight: number;
  };
  riskAlerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
}

export async function callLLM(prompt: string, model: string = 'qwen2.5-coder:7b'): Promise<LLMSuggestions> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ollama', ['run', model], {
      stdio: ['pipe', 'pipe', 'inherit'],
      timeout: 300000 // 5 minutes timeout
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    proc.stdin.write(prompt);
    proc.stdin.end();

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`LLM process exited with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        // Try to extract JSON from the output
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          reject(new Error('No JSON found in LLM output'));
          return;
        }

        const json = JSON.parse(jsonMatch[0]);
        resolve(json);
      } catch (e) {
        console.error('LLM output:', output);
        reject(new Error(`LLM output not valid JSON: ${e}`));
      }
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to start LLM process: ${error.message}`));
    });
  });
}

export async function callLLMWithFallback(prompt: string): Promise<LLMSuggestions> {
  const models = ['qwen2.5-coder:7b', 'deepseek-r1:latest'];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const result = await callLLM(prompt, model);
      return result;
    } catch (error) {
      console.warn(`Model ${model} failed:`, error);
      continue;
    }
  }

  throw new Error('All LLM models failed');
}
