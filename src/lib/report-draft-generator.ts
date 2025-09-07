import { prisma } from './prisma';
import { callLLMWithFallback } from './llm';

interface LLMReportDraft {
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  keyInsights: string[];
  dataSources: string[];
  content: string;
  estimatedDemand: number;
}

export interface ReportDraft {
  title: string;
  description: string;
  category: string;
  estimatedDemand: number;
  targetAudience: string;
  keyInsights: string[];
  dataSources: string[];
  content: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected';
  createdBy: 'system' | 'human';
  evaluationId?: string;
}

export class ReportDraftGenerator {
  async generateDraftFromIdea(idea: any, evaluationId?: string): Promise<ReportDraft> {
    const prompt = `
你是一个专业的数据分析师和内容创作者。请根据以下报告想法，生成一个完整的报告草稿：

报告想法：
- 标题：${idea.title}
- 描述：${idea.description}
- 类别：${idea.category}
- 预计需求：${idea.estimatedDemand}/10
- 理由：${idea.reason}

请生成一个完整的报告草稿，包括：
1. 引言和背景
2. 数据分析和发现
3. 关键洞察和趋势
4. 建议和结论
5. 目标受众分析
6. 数据来源说明

请用JSON格式输出，包含以下字段：
- title: 报告标题
- description: 详细描述
- category: 报告类别
- targetAudience: 目标受众描述
- keyInsights: 关键洞察数组（3-5个）
- dataSources: 数据来源数组
- content: 完整的报告内容（Markdown格式）
- estimatedDemand: 需求评分（1-10）

确保内容专业、数据驱动、有洞察力。
`;

    console.log('Generating report draft for idea:', idea.title);
    const draftData = await callLLMWithFallback(prompt) as any;

    const draft: ReportDraft = {
      title: (draftData as any).title || idea.title,
      description: (draftData as any).description || idea.description,
      category: (draftData as any).category || idea.category,
      estimatedDemand: (draftData as any).estimatedDemand || idea.estimatedDemand,
      targetAudience: (draftData as any).targetAudience || 'Freelancers and business decision makers',
      keyInsights: (draftData as any).keyInsights || [],
      dataSources: (draftData as any).dataSources || ['Internal analytics', 'Market research'],
      content: (draftData as any).content || '',
      status: 'draft',
      createdBy: 'system',
      evaluationId
    };

    return draft;
  }

  async saveDraft(draft: ReportDraft): Promise<any> {
    const savedDraft = await prisma.reportDraft.create({
      data: {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        estimatedDemand: draft.estimatedDemand,
        targetAudience: draft.targetAudience,
        keyInsights: draft.keyInsights,
        dataSources: draft.dataSources,
        content: draft.content,
        status: draft.status,
        createdBy: draft.createdBy,
        evaluationId: draft.evaluationId
      }
    });

    console.log(`Report draft saved with ID: ${savedDraft.id}`);
    return savedDraft;
  }

  async generateAndSaveDraftsFromEvaluation(evaluationId: string): Promise<any[]> {
    // Get evaluation with suggestions
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId }
    });

    if (!evaluation || !evaluation.suggestions) {
      throw new Error('Evaluation not found or has no suggestions');
    }

    const suggestions = evaluation.suggestions as any;
    const drafts = [];

    if (suggestions.reportIdeas && suggestions.reportIdeas.length > 0) {
      console.log(`Generating ${suggestions.reportIdeas.length} report drafts...`);

      for (const idea of suggestions.reportIdeas) {
        try {
          const draft = await this.generateDraftFromIdea(idea, evaluationId);
          const savedDraft = await this.saveDraft(draft);
          drafts.push(savedDraft);
        } catch (error) {
          console.error(`Failed to generate draft for idea "${idea.title}":`, error);
        }
      }
    }

    return drafts;
  }

  async getDraftsByStatus(status: string): Promise<any[]> {
    return await prisma.reportDraft.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        evaluation: true
      }
    });
  }

  async updateDraftStatus(draftId: string, status: string, reviewerId?: string): Promise<any> {
    return await prisma.reportDraft.update({
      where: { id: draftId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewerId
      }
    });
  }

  async publishDraft(draftId: string, publishedBy: string): Promise<any> {
    // Update draft status
    await this.updateDraftStatus(draftId, 'published', publishedBy);

    // Get the draft
    const draft = await prisma.reportDraft.findUnique({
      where: { id: draftId }
    });

    if (!draft) {
      throw new Error('Draft not found');
    }

    // Create published report
    const report = await prisma.report.create({
      data: {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        content: draft.content,
        estimatedDemand: draft.estimatedDemand,
        targetAudience: draft.targetAudience || undefined,
        keyInsights: draft.keyInsights || undefined,
        dataSources: draft.dataSources || undefined,
        status: 'published',
        publishedBy,
        publishedAt: new Date(),
        draftId
      }
    });

    return report;
  }
}

export const reportDraftGenerator = new ReportDraftGenerator();
