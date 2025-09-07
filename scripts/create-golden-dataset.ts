import { createGoldenDatasetFromExistingData } from '../src/lib/prompt-playback';

async function main() {
  console.log('Creating golden dataset from existing data...');
  await createGoldenDatasetFromExistingData();
  console.log('Golden dataset created successfully!');
}

main().catch(console.error);
