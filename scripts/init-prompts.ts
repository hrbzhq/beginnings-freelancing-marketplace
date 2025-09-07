import { PromptManager, DEFAULT_TEMPLATES } from '../src/lib/prompt-manager';

async function initializePromptTemplates() {
  console.log('Initializing default prompt templates...');

  for (const templateData of DEFAULT_TEMPLATES) {
    try {
      const template = await PromptManager.createTemplate(templateData);
      console.log(`✅ Created template: ${template.name} v${template.version}`);
    } catch (error) {
      console.error(`❌ Failed to create template ${templateData.name}:`, error);
    }
  }

  console.log('Prompt template initialization completed!');
}

initializePromptTemplates().catch(console.error);
