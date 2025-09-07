import { prisma } from './db';

export interface PromptTemplateData {
  name: string;
  task: string;
  template: string;
  parameters?: Record<string, unknown>;
}

export class PromptManager {
  /**
   * Create a new prompt template version
   */
  static async createTemplate(data: PromptTemplateData) {
    // Get the latest version for this template name
    const latestVersion = await prisma.promptTemplate.findFirst({
      where: { name: data.name },
      orderBy: { version: 'desc' }
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // Deactivate previous version
    if (latestVersion) {
      await prisma.promptTemplate.update({
        where: { id: latestVersion.id },
        data: { isActive: false }
      });
    }

    // Create new version
    const template = await prisma.promptTemplate.create({
      data: {
        name: data.name,
        version: newVersion,
        task: data.task,
        template: data.template,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters: (data.parameters || {}) as any,
        isActive: true
      }
    });

    return template;
  }

  /**
   * Get active prompt template for a task
   */
  static async getActiveTemplate(task: string) {
    return await prisma.promptTemplate.findFirst({
      where: {
        task,
        isActive: true
      },
      orderBy: { version: 'desc' }
    });
  }

  /**
   * Get all versions of a prompt template
   */
  static async getTemplateVersions(name: string) {
    return await prisma.promptTemplate.findMany({
      where: { name },
      orderBy: { version: 'desc' }
    });
  }

  /**
   * Activate a specific template version
   */
  static async activateTemplate(templateId: string) {
    // Deactivate all versions of this template
    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    await prisma.promptTemplate.updateMany({
      where: { name: template.name },
      data: { isActive: false }
    });

    // Activate the specified version
    return await prisma.promptTemplate.update({
      where: { id: templateId },
      data: { isActive: true }
    });
  }

  /**
   * Render template with parameters
   */
  static renderTemplate(template: string, parameters: Record<string, unknown>): string {
    let rendered = template;

    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return rendered;
  }

  /**
   * Get template with rendered content
   */
  static async getRenderedTemplate(task: string, parameters: Record<string, unknown> = {}) {
    const template = await this.getActiveTemplate(task);

    if (!template) {
      throw new Error(`No active template found for task: ${task}`);
    }

    const combinedParams = { ...(template.parameters as Record<string, unknown>), ...parameters };
    const renderedContent = this.renderTemplate(template.template, combinedParams);

    return {
      ...template,
      renderedContent,
      parameters: combinedParams
    };
  }
}

// Predefined templates
export const DEFAULT_TEMPLATES: PromptTemplateData[] = [
  {
    name: 'job-analysis',
    task: 'job_analysis',
    template: `Analyze this job posting and provide ratings on a scale of 1-10 for difficulty, career prospects, and fun factor.

Job Title: {{title}}
Description: {{description}}
Required Skills: {{skills}}

Please respond with ONLY a JSON object in this exact format:
{
  "difficulty": <number 1-10>,
  "prospects": <number 1-10>,
  "fun": <number 1-10>
}`,
    parameters: {}
  },
  {
    name: 'employer-rating',
    task: 'employer_rating',
    template: `Rate this employer based on the job posting information.

Employer: {{employer}}
Job Description: {{description}}

Rate on a scale of 1-10 for credit score, salary fairness, attitude, and career prospects.

Respond with ONLY JSON:
{
  "credit": <number 1-10>,
  "salary": <number 1-10>,
  "attitude": <number 1-10>,
  "prospects": <number 1-10>
}`,
    parameters: {}
  },
  {
    name: 'report-generation',
    task: 'report_generation',
    template: `Generate a comprehensive market analysis report based on the following data:

Skills: {{skills}}
Region: {{region}}
Experience Level: {{experienceLevel}}

Focus on:
1. Salary trends
2. Demand analysis
3. Career prospects
4. Market insights

Provide detailed analysis with data-driven insights.`,
    parameters: {}
  }
];
