import { EvaluationPipeline } from '../src/lib/evaluation-pipeline';

async function main() {
  const command = process.argv[2];

  if (command === 'run') {
    console.log('Running evaluation pipeline...');
    const report = await EvaluationPipeline.runFullEvaluation();
    const passes = EvaluationPipeline.passesQualityGates(report);

    if (!passes) {
      console.log('❌ Quality gates failed!');
      process.exit(1);
    } else {
      console.log('✅ All quality gates passed!');
    }
  } else if (command === 'latest') {
    const report = EvaluationPipeline.getLatestReport();
    if (report) {
      EvaluationPipeline.printSummary(report);
    } else {
      console.log('No evaluation reports found');
    }
  } else {
    console.log('Usage:');
    console.log('  tsx scripts/run-evaluation.ts run     # Run full evaluation pipeline');
    console.log('  tsx scripts/run-evaluation.ts latest  # Show latest evaluation report');
  }
}

main().catch(console.error);
