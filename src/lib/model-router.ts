import { PromptManager } from './prompt-manager';

export interface ModelConfig {
  name: string;
  provider: 'ollama' | 'openai' | 'anthropic';
  model: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number; // For cost tracking
}

export interface TaskConfig {
  task: string;
  priority: 'low' | 'medium' | 'high';
  timeout: number; // seconds
  models: ModelConfig[];
  fallbackModels?: ModelConfig[];
}

export class ModelRouter {
  private static readonly TASK_CONFIGS: Record<string, TaskConfig> = {
    job_analysis: {
      task: 'job_analysis',
      priority: 'medium',
      timeout: 30,
      models: [
        {
          name: 'qwen2.5-coder-7b',
          provider: 'ollama',
          model: 'qwen2.5-coder:7b',
          maxTokens: 1000,
          temperature: 0.3,
          costPerToken: 0
        },
        {
          name: 'deepseek-r1-7b',
          provider: 'ollama',
          model: 'deepseek-r1:7b',
          maxTokens: 1000,
          temperature: 0.3,
          costPerToken: 0
        }
      ]
    },
    employer_rating: {
      task: 'employer_rating',
      priority: 'medium',
      timeout: 25,
      models: [
        {
          name: 'qwen2.5-coder-3b',
          provider: 'ollama',
          model: 'qwen2.5-coder:3b',
          maxTokens: 800,
          temperature: 0.2,
          costPerToken: 0
        }
      ]
    },
    report_generation: {
      task: 'report_generation',
      priority: 'high',
      timeout: 60,
      models: [
        {
          name: 'qwen2.5-coder-7b',
          provider: 'ollama',
          model: 'qwen2.5-coder:7b',
          maxTokens: 2000,
          temperature: 0.7,
          costPerToken: 0
        }
      ]
    },
    insight_extraction: {
      task: 'insight_extraction',
      priority: 'low',
      timeout: 20,
      models: [
        {
          name: 'gemma3-1b',
          provider: 'ollama',
          model: 'gemma3:1b',
          maxTokens: 500,
          temperature: 0.1,
          costPerToken: 0
        }
      ]
    }
  };

  /**
   * Route a task to the appropriate model
   */
  static async routeTask(
    task: string,
    input: Record<string, unknown>,
    options: {
      priority?: 'low' | 'medium' | 'high';
      timeout?: number;
      forceModel?: string;
    } = {}
  ): Promise<{
    model: ModelConfig;
    prompt: string;
    taskConfig: TaskConfig;
  }> {
    const taskConfig = this.TASK_CONFIGS[task];
    if (!taskConfig) {
      throw new Error(`Unknown task: ${task}`);
    }

    // Get the prompt template
    const template = await PromptManager.getRenderedTemplate(task, input);

    // Select model based on priority and availability
    let selectedModel: ModelConfig;

    if (options.forceModel) {
      selectedModel = taskConfig.models.find(m => m.name === options.forceModel) ||
                     taskConfig.models[0];
    } else {
      // Simple load balancing - in production, use actual metrics
      selectedModel = taskConfig.models[0];
    }

    return {
      model: selectedModel,
      prompt: template.renderedContent,
      taskConfig
    };
  }

  /**
   * Get cost estimate for a task
   */
  static estimateCost(task: string, estimatedTokens: number = 1000): number {
    const taskConfig = this.TASK_CONFIGS[task];
    if (!taskConfig) return 0;

    const model = taskConfig.models[0];
    return model.costPerToken * estimatedTokens;
  }

  /**
   * Get all available tasks
   */
  static getAvailableTasks(): string[] {
    return Object.keys(this.TASK_CONFIGS);
  }

  /**
   * Get task configuration
   */
  static getTaskConfig(task: string): TaskConfig | null {
    return this.TASK_CONFIGS[task] || null;
  }

  /**
   * Update model performance metrics (for future load balancing)
   */
  static async updateModelMetrics(
    modelName: string,
    metrics: {
      responseTime: number;
      success: boolean;
      tokensUsed: number;
      cost: number;
    }
  ) {
    // In a real implementation, store these metrics in Redis/database
    // for model selection optimization
    console.log(`Model ${modelName} metrics:`, metrics);
  }
}

// Helper function to execute routed task
export async function executeRoutedTask(
  task: string,
  input: Record<string, unknown>,
  executeFn: (model: ModelConfig, prompt: string) => Promise<unknown>
) {
  const routing = await ModelRouter.routeTask(task, input);

  try {
    const startTime = Date.now();
    const result = await executeFn(routing.model, routing.prompt);
    const responseTime = Date.now() - startTime;

    // Update metrics
    await ModelRouter.updateModelMetrics(routing.model.name, {
      responseTime,
      success: true,
      tokensUsed: 1000, // Estimate - in real implementation, get from API
      cost: ModelRouter.estimateCost(task)
    });

    return result;
  } catch (error) {
    // Update failure metrics
    await ModelRouter.updateModelMetrics(routing.model.name, {
      responseTime: 0,
      success: false,
      tokensUsed: 0,
      cost: 0
    });

    throw error;
  }
}
