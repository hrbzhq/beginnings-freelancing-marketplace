#!/usr/bin/env tsx

import { runSecurityAudit, exportSecurityReport } from '../src/lib/compliance/audit';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🔒 Running security audit...');

  try {
    const audit = await runSecurityAudit();

    // Export report to file
    const reportsDir = path.join(process.cwd(), 'security-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const filename = `security-audit-${new Date().toISOString().split('T')[0]}.md`;
    const filepath = path.join(reportsDir, filename);

    const report = exportSecurityReport(audit);
    fs.writeFileSync(filepath, report);

    console.log(`📄 Security report saved to: ${filepath}`);
    console.log(`📊 Security Score: ${audit.score}/100`);
    console.log(`🚨 Vulnerabilities: ${audit.vulnerabilities.length}`);

  } catch (error) {
    console.error('❌ Security audit failed:', error);
    process.exit(1);
  }
}

main();
