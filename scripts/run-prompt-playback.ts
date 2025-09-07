import { runPromptPlaybackTest, createGoldenDatasetFromExistingData } from '../src/lib/prompt-playback';

async function main() {
  const command = process.argv[2];

  if (command === 'create-golden') {
    console.log('Creating golden dataset...');
    await createGoldenDatasetFromExistingData();
  } else if (command === 'test') {
    console.log('Running prompt playback test...');
    const result = await runPromptPlaybackTest();
    console.log('Results:', result.summary);
  } else {
    console.log('Usage:');
    console.log('  npm run prompt:create-golden  # Create golden dataset');
    console.log('  npm run prompt:playback      # Run playback test');
  }
}

main().catch(console.error);
