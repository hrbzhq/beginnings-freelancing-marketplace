import { prisma } from '../src/lib/db';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test creating a sample job
    const testJob = await prisma.job.create({
      data: {
        title: 'Test Job',
        description: 'This is a test job for database validation',
        employerId: 'test-employer',
        budget: 1000,
        skills: ['JavaScript', 'React'],
        ratings: { difficulty: 5, prospects: 7, fun: 6 }
      }
    });
    console.log('✅ Test job created:', testJob.id);

    // Clean up
    await prisma.job.delete({ where: { id: testJob.id } });
    console.log('✅ Test job cleaned up');

    console.log('🎉 Database setup is working correctly!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
