import { scrapeUpworkJobs, scrapeFiverrJobs } from './src/lib/scraping.js';
import { analyzeJobWithLLM } from './src/lib/ollama.js';

async function testScraping() {
  console.log('Testing Upwork scraping...');
  try {
    const upworkJobs = await scrapeUpworkJobs();
    console.log(`Found ${upworkJobs.length} jobs from Upwork`);
    console.log('Sample job:', upworkJobs[0]);
  } catch (error) {
    console.error('Upwork scraping failed:', error);
  }

  console.log('\nTesting Fiverr scraping...');
  try {
    const fiverrJobs = await scrapeFiverrJobs();
    console.log(`Found ${fiverrJobs.length} jobs from Fiverr`);
    console.log('Sample job:', fiverrJobs[0]);
  } catch (error) {
    console.error('Fiverr scraping failed:', error);
  }
}

async function testLLM() {
  console.log('\nTesting LLM analysis...');
  try {
    const testJob = {
      title: 'Senior React Developer',
      description: 'Build a complex web application with React, TypeScript, and Node.js. Experience with state management and testing required.',
      skills: ['React', 'TypeScript']
    };

    const analysis = await analyzeJobWithLLM(testJob);
    console.log('LLM Analysis result:', analysis);
  } catch (error) {
    console.error('LLM analysis failed:', error);
  }
}

async function main() {
  console.log('Starting tests...\n');
  await testScraping();
  await testLLM();
  console.log('\nTests completed.');
}

main().catch(console.error);
