import { prisma } from './db';
import { analyzeJobWithLLM } from './ollama';
import fs from 'fs';
import path from 'path';

interface GoldenSample {
  id: string;
  input: {
    title: string;
    description: string;
    skills: string[];
  };
  expectedOutput: {
    difficulty: number;
    prospects: number;
    fun: number;
  };
}

interface EvaluationResult {
  sampleId: string;
  actualOutput: {
    difficulty: number;
    prospects: number;
    fun: number;
  };
  expectedOutput: {
    difficulty: number;
    prospects: number;
    fun: number;
  };
  accuracy: number; // 0-1, how close the predictions are
  consistency: number; // 0-1, internal consistency of predictions
}

export async function runPromptPlaybackTest(promptTemplateId?: string): Promise<{
  results: EvaluationResult[];
  summary: {
    averageAccuracy: number;
    averageConsistency: number;
    totalSamples: number;
  };
}> {
  console.log('Starting prompt playback test...');

  // Load golden dataset from database
  const jobs = await prisma.job.findMany({
    take: 10 // Use first 10 jobs for testing
  });

  const goldenDataset: GoldenSample[] = jobs.map(job => ({
    id: job.id,
    input: {
      title: job.title,
      description: job.description,
      skills: job.skills as string[]
    },
    expectedOutput: job.ratings as { difficulty: number; prospects: number; fun: number }
  }));

  const results: EvaluationResult[] = [];

  for (const sample of goldenDataset) {
    try {
      // Run analysis with current prompt
      const actualOutput = await analyzeJobWithLLM(sample.input);

      // Calculate metrics
      const accuracy = calculateAccuracy(actualOutput, sample.expectedOutput);
      const consistency = calculateConsistency(actualOutput);

      results.push({
        sampleId: sample.id,
        actualOutput,
        expectedOutput: sample.expectedOutput,
        accuracy,
        consistency
      });

      console.log(`Sample ${sample.id}: Accuracy=${accuracy.toFixed(3)}, Consistency=${consistency.toFixed(3)}`);
    } catch (error) {
      console.error(`Error processing sample ${sample.id}:`, error);
    }
  }

  // Calculate summary
  const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
  const averageConsistency = results.reduce((sum, r) => sum + r.consistency, 0) / results.length;

  const summary = {
    averageAccuracy,
    averageConsistency,
    totalSamples: results.length
  };

  // Save evaluation to database
  if (promptTemplateId) {
    await prisma.evaluation.create({
      data: {
        promptTemplateId,
        accuracy: averageAccuracy,
        consistency: averageConsistency,
        notes: `Playback test completed with ${results.length} samples`
      }
    });
  }

  console.log('Prompt playback test completed:', summary);

  return { results, summary };
}

function loadGoldenDataset(): GoldenSample[] {
  const filePath = path.join(process.cwd(), 'golden-dataset.json');

  if (!fs.existsSync(filePath)) {
    console.warn('Golden dataset not found, creating sample dataset...');
    return createSampleGoldenDataset();
  }

  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function createSampleGoldenDataset(): GoldenSample[] {
  // Create a small sample dataset for testing
  return [
    {
      id: 'sample-1',
      input: {
        title: 'Senior React Developer',
        description: 'Build complex React applications with TypeScript',
        skills: ['React', 'TypeScript', 'JavaScript']
      },
      expectedOutput: {
        difficulty: 7,
        prospects: 8,
        fun: 8
      }
    },
    {
      id: 'sample-2',
      input: {
        title: 'Junior Web Designer',
        description: 'Create simple website layouts',
        skills: ['HTML', 'CSS', 'Photoshop']
      },
      expectedOutput: {
        difficulty: 4,
        prospects: 6,
        fun: 7
      }
    }
  ];
}

function calculateAccuracy(actual: { difficulty: number; prospects: number; fun: number }, expected: { difficulty: number; prospects: number; fun: number }): number {
  const difficultyDiff = Math.abs(actual.difficulty - expected.difficulty) / 10;
  const prospectsDiff = Math.abs(actual.prospects - expected.prospects) / 10;
  const funDiff = Math.abs(actual.fun - expected.fun) / 10;

  const averageDiff = (difficultyDiff + prospectsDiff + funDiff) / 3;
  return Math.max(0, 1 - averageDiff);
}

function calculateConsistency(ratings: { difficulty: number; prospects: number; fun: number }): number {
  // Check if ratings are internally consistent
  // Higher difficulty should correlate with lower fun (generally)
  const difficulty = ratings.difficulty / 10;
  const fun = ratings.fun / 10;

  // If difficulty is high (>0.7), fun should not be too high
  if (difficulty > 0.7 && fun > 0.8) {
    return 0.5; // Inconsistent
  }

  // If difficulty is low (<0.3), fun can be high
  if (difficulty < 0.3 && fun < 0.5) {
    return 0.7; // Somewhat inconsistent
  }

  return 0.9; // Generally consistent
}

export async function createGoldenDatasetFromExistingData() {
  console.log('Creating golden dataset from existing job data...');

  try {
    // Get existing jobs from database
    const jobs = await prisma.job.findMany({
      take: 50 // Sample first 50 jobs
    });

    const goldenSamples: GoldenSample[] = jobs.map(job => ({
      id: `golden-${job.id}`,
      input: {
        title: job.title,
        description: job.description,
        skills: job.skills as string[]
      },
      expectedOutput: job.ratings as { difficulty: number; prospects: number; fun: number }
    }));

    // Save to file
    const filePath = path.join(process.cwd(), 'golden-dataset.json');
    fs.writeFileSync(filePath, JSON.stringify(goldenSamples, null, 2));

    console.log(`Created golden dataset with ${goldenSamples.length} samples`);
  } catch (error) {
    console.error('Error creating golden dataset:', error);
  }
}
