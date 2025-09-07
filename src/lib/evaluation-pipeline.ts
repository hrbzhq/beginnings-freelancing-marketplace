import { runPromptPlaybackTest } from './prompt-playback';
import { prisma } from './db';
import fs from 'fs';
import path from 'path';

interface EvaluationReport {
  timestamp: string;
  promptTemplate: {
    name: string;
    version: number;
  };
  results: {
    totalSamples: number;
    averageAccuracy: number;
    averageConsistency: number;
    passThreshold: boolean;
  };
  recommendations: string[];
}

export class EvaluationPipeline {
  private static readonly ACCURACY_THRESHOLD = 0.8;
  private static readonly CONSISTENCY_THRESHOLD = 0.85;

  /**
   * Run complete evaluation pipeline
   */
  static async runFullEvaluation(): Promise<EvaluationReport> {
    console.log('🚀 Starting automated evaluation pipeline...');

    const timestamp = new Date().toISOString();

    // Get active prompt templates
    const activeTemplates = await this.getActiveTemplates();

    let bestResults = {
      totalSamples: 0,
      averageAccuracy: 0,
      averageConsistency: 0,
      passThreshold: false
    };

    const recommendations: string[] = [];

    for (const template of activeTemplates) {
      console.log(`📋 Evaluating template: ${template.name} v${template.version}`);

      try {
        const result = await runPromptPlaybackTest(template.id);

        if (result.summary.averageAccuracy > bestResults.averageAccuracy) {
          bestResults = {
            totalSamples: result.summary.totalSamples,
            averageAccuracy: result.summary.averageAccuracy,
            averageConsistency: result.summary.averageConsistency,
            passThreshold: result.summary.averageAccuracy >= this.ACCURACY_THRESHOLD &&
                          result.summary.averageConsistency >= this.CONSISTENCY_THRESHOLD
          };
        }

        // Generate recommendations
        if (result.summary.averageAccuracy < this.ACCURACY_THRESHOLD) {
          recommendations.push(`Improve accuracy for ${template.name} (current: ${(result.summary.averageAccuracy * 100).toFixed(1)}%)`);
        }

        if (result.summary.averageConsistency < this.CONSISTENCY_THRESHOLD) {
          recommendations.push(`Improve consistency for ${template.name} (current: ${(result.summary.averageConsistency * 100).toFixed(1)}%)`);
        }

      } catch (error) {
        console.error(`❌ Evaluation failed for ${template.name}:`, error);
        recommendations.push(`Fix evaluation errors for ${template.name}`);
      }
    }

    const report: EvaluationReport = {
      timestamp,
      promptTemplate: activeTemplates[0] ? {
        name: activeTemplates[0].name,
        version: activeTemplates[0].version
      } : { name: 'unknown', version: 0 },
      results: bestResults,
      recommendations
    };

    // Save report
    await this.saveReport(report);

    // Generate summary
    this.printSummary(report);

    return report;
  }

  /**
   * Get all active prompt templates
   */
  private static async getActiveTemplates() {
    const templates = await prisma.promptTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return templates;
  }

  /**
   * Save evaluation report to file
   */
  private static async saveReport(report: EvaluationReport) {
    const reportsDir = path.join(process.cwd(), 'evaluation-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const filename = `evaluation-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${filepath}`);
  }

  /**
   * Print evaluation summary
   */
  static printSummary(report: EvaluationReport) {
    console.log('\n📊 Evaluation Summary');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Template: ${report.promptTemplate.name} v${report.promptTemplate.version}`);
    console.log(`Samples: ${report.results.totalSamples}`);
    console.log(`Accuracy: ${(report.results.averageAccuracy * 100).toFixed(1)}%`);
    console.log(`Consistency: ${(report.results.averageConsistency * 100).toFixed(1)}%`);
    console.log(`Status: ${report.results.passThreshold ? '✅ PASS' : '❌ FAIL'}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    console.log('='.repeat(50));
  }

  /**
   * Check if evaluation passes quality gates
   */
  static passesQualityGates(report: EvaluationReport): boolean {
    return report.results.passThreshold;
  }

  /**
   * Get latest evaluation report
   */
  static getLatestReport(): EvaluationReport | null {
    const reportsDir = path.join(process.cwd(), 'evaluation-reports');

    if (!fs.existsSync(reportsDir)) {
      return null;
    }

    const files = fs.readdirSync(reportsDir)
      .filter(f => f.startsWith('evaluation-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return null;
    }

    const latestFile = path.join(reportsDir, files[0]);
    const data = fs.readFileSync(latestFile, 'utf8');
    return JSON.parse(data);
  }
}

// CLI interface for CI/CD
async function main() {
  const command = process.argv[2];

  if (command === 'run') {
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
    console.log('  npm run eval:run     # Run full evaluation pipeline');
    console.log('  npm run eval:latest  # Show latest evaluation report');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
