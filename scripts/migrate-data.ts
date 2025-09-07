import { prisma } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd());

interface LegacyJob {
  id: string;
  title: string;
  skills: string[];
  rate: number;
  remote: boolean;
}

interface LegacyInsight {
  id: string;
  category: 'demand' | 'supply' | 'pricing' | 'trends';
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  description: string;
  timestamp: string;
}

interface LegacyReport {
  id: string;
  title: string;
  description: string;
  content: string;
  summary: string;
  category: string;
  price: number;
  createdAt: string;
}

interface LegacyPurchase {
  id: string;
  userId: string;
  reportId: string;
  amount: number;
  status: string;
  createdAt: string;
}

async function migrateJobs() {
  console.log('Migrating jobs...');

  try {
    const jobsData = fs.readFileSync(path.join(DATA_DIR, 'metrics.json'), 'utf8');
    const legacyData: { jobs: LegacyJob[] } = JSON.parse(jobsData);
    const legacyJobs = legacyData.jobs;

    for (const job of legacyJobs) {
      // Create or find employer (use a default employer)
      let employer = await prisma.employer.findFirst({
        where: { name: 'Default Employer' }
      });

      if (!employer) {
        employer = await prisma.employer.create({
          data: {
            name: 'Default Employer',
            description: 'Default employer for migrated jobs',
            ratings: { credit: 3, salary: 3, attitude: 3, prospects: 3 }
          }
        });
      }

      // Create job with mock data for missing fields
      const newJob = await prisma.job.create({
        data: {
          id: job.id,
          title: job.title,
          description: `Job requiring skills: ${job.skills.join(', ')}`,
          employerId: employer.id,
          budget: job.rate * 10, // Convert rate to budget
          skills: job.skills,
          ratings: { difficulty: 3, prospects: 3, fun: 3 }, // Default ratings
          employerRatings: { credit: 3, salary: 3, attitude: 3, prospects: 3 },
          remote: job.remote
        }
      });

      // Create job skills
      for (const skillName of job.skills) {
        let skill = await prisma.skill.findFirst({
          where: { name: skillName }
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: { name: skillName }
          });
        }

        await prisma.jobSkill.create({
          data: {
            jobId: newJob.id,
            skillId: skill.id
          }
        });
      }
    }

    console.log(`Migrated ${legacyJobs.length} jobs`);
  } catch (error) {
    console.error('Error migrating jobs:', error);
  }
}

async function migrateInsights() {
  console.log('Migrating insights...');

  try {
    const insightsData = fs.readFileSync(path.join(DATA_DIR, 'insights.json'), 'utf8');
    const legacyInsights: LegacyInsight[] = JSON.parse(insightsData);

    for (const insight of legacyInsights) {
      await prisma.insight.create({
        data: {
          id: insight.id,
          category: insight.category,
          title: insight.title,
          value: insight.value,
          change: insight.change,
          changeType: insight.changeType,
          description: insight.description,
          timestamp: new Date(insight.timestamp)
        }
      });
    }

    console.log(`Migrated ${legacyInsights.length} insights`);
  } catch (error) {
    console.log('No insights.json file found, skipping insights migration');
  }
}

async function migrateReports() {
  console.log('Migrating reports...');

  try {
    const reportsData = fs.readFileSync(path.join(DATA_DIR, 'reports.json'), 'utf8');
    const legacyReports: LegacyReport[] = JSON.parse(reportsData);

    for (const report of legacyReports) {
      await prisma.report.create({
        data: {
          id: report.id,
          title: report.title,
          description: report.description,
          content: report.content,
          summary: report.summary,
          category: report.category,
          price: report.price,
          createdAt: new Date(report.createdAt)
        }
      });
    }

    console.log(`Migrated ${legacyReports.length} reports`);
  } catch (error) {
    console.error('Error migrating reports:', error);
  }
}

async function migratePurchases() {
  console.log('Migrating purchases...');

  try {
    const purchasesData = fs.readFileSync(path.join(DATA_DIR, 'purchases.json'), 'utf8');
    const legacyPurchases: LegacyPurchase[] = JSON.parse(purchasesData);

    for (const purchase of legacyPurchases) {
      // Create user if doesn't exist
      let user = await prisma.user.findUnique({
        where: { id: purchase.userId }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: purchase.userId,
            email: `user${purchase.userId}@example.com`,
            name: `User ${purchase.userId}`,
            skills: []
          }
        });
      }

      await prisma.purchase.create({
        data: {
          id: purchase.id,
          userId: user.id,
          reportId: purchase.reportId,
          amount: purchase.amount,
          status: purchase.status,
          createdAt: new Date(purchase.createdAt)
        }
      });
    }

    console.log(`Migrated ${legacyPurchases.length} purchases`);
  } catch (error) {
    console.log('No purchases.json file found, skipping purchases migration');
  }
}

async function main() {
  console.log('Starting data migration...');

  try {
    await migrateJobs();
    await migrateInsights();
    await migrateReports();
    await migratePurchases();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
