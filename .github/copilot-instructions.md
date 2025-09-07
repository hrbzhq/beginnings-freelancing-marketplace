- [x] Verify t- [x] L## Next ## Next ## Next Sprint: AI & Evaluation Governance (Days 4-6)
- [x] Golden Dataset Creation
	<!-- 150 annotated samples for evaluation -->
- [x] Prompt Versioning System
	<!-- Template library with automated testing -->
- [x] Model Routing Implementation
	<!-- Task-based model selection and cost control -->
- [x] Automated Evaluation Pipeline
	<!-- CI/CD integration for model validation -->I & Evaluation Governance (Days 4-6)
- [x] Golden Dataset Creation
	<!-- 150 annotated samples for evaluation -->
- [x] Prompt Versioning System
	<!-- Template library with automated testing -->
- [x] Model Routing Implementation
	<!-- Task-based model selection and cost control -->
- [x] Automated Evaluation Pipeline
	<!-- CI/CD integration for model validation -->I & Evaluation Governance (Days 4-6)
- [x] Golden Dataset Creation
	<!-- 150 annotated samples for evaluation -->
- [x] Prompt Versioning System
	<!-- Template library with automated testing -->
- [x] Model Routing Implementation
	<!-- Task-based model selection and cost control -->
- [ ] Automated Evaluation Pipeline
	<!-- CI/CD integration for model validation --> Project
	<## Next Sprint: Integrate Insights into Core Experience
- [x] Add Mini-Insight Badges to Job Listings
	<!-- Show salary trends, demand growth next to each job -->
- [x] Create Insight Tooltip System
	<!-- Hover tooltips with detailed market data for jobs -->
- [x] Implement Click-Tracking for Insight Engagement
	<!-- Track which insights drive users to premium reports -->
- [x] Add Insight-Driven Job Recommendations
	<!-- Recommend jobs based on market trends and user profile -->

## Next Sprint: Platform Foundation & Data Migration (Days 1-3)
- [x] Database Migration Setup
	<!-- PostgreSQL + Prisma for structured data storage -->
- [x] Core Tables Implementation
	<!-- Jobs/Employers/Skills/Users/Subscriptions/Purchases/Reports/Events -->
- [x] Data Migration Scripts
	<!-- JSON to DB migration with validation -->
- [x] Cache & Queue Setup
	<!-- Redis + BullMQ for async processing -->

## Next Sprint: AI & Evaluation Governance (Days 4-6)
- [x] Golden Dataset Creation
	<!-- 150 annotated samples for evaluation -->
- [x] Prompt Versioning System
	<!-- Template library with automated testing -->
- [x] Model Routing Implementation
	<!-- Task-based model selection and cost control -->
- [x] Automated Evaluation Pipeline
	<!-- CI/CD integration for model validation -->

## Next Sprint: Compliance & Security (Days 7-9)
- [x] Terms of Service Review
	<!-- Data source compliance checklist -->
- [x] Privacy Center Implementation
	<!-- Consent management and data export/delete -->
- [x] API Protection Setup
	<!-- Rate limiting, circuit breakers, WAF -->
- [x] Security Audit Preparation
	<!-- Vulnerability assessment and fixes -->

## Next Sprint: Commercialization & Funnel (Days 10-12)
- [ ] Subscription Tiers Launch
	<!-- Pro/Team/Enterprise pricing and features -->
- [ ] Report Preview System
	<!-- Summary + 2 charts visible, rest masked -->
- [ ] A/B Testing Framework
	<!-- Badge variations, summary length, recommendation weights -->
- [ ] Conversion Funnel Analytics
	<!-- Track from insight to purchase -->

## Next Sprint: Observability & Iteration (Days 13-14)
- [ ] Observability Stack
	<!-- OpenTelemetry/Prometheus/Grafana setup -->
- [ ] Automated Self-Evaluation
	<!-- Revenue-focused metrics and auto-adjustments -->
- [ ] Performance Optimization
	<!-- Caching, query optimization, scaling prep -->
- [ ] Sprint Retrospective
	<!-- Success metrics and next priorities -->ct launched via development server. -->

- [x] Ensure Documentation is Complete
	<!-- README.md updated with project information. --> the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements

- [x] Scaffold the Project

- [x] Customize the Project

- [x] Install Required Extensions

- [x] Compile the Project

- [x] Create and Run Task

- [x] Launch the Project

- [x] Ensure Documentation is Complete

## Next Sprint: Deep Personalization & Proactive Alerts
- [x] Create User Dashboard with "My Insights" Module
	<!-- Personal dashboard showing insights based on user's skill tags -->
- [x] Implement Skill-Based Insight Personalization
	<!-- Push relevant market insights based on user skills (React, Python, etc.) -->
- [x] Add Trend Subscription System
	<!-- Allow users to subscribe to specific skill/industry trend notifications -->
- [x] Integrate Email/In-App Notification System
	<!-- Set up notification infrastructure for proactive alerts -->

## Next Sprint: Interactive Reports & Custom Queries
- [x] Build Interactive Dashboard for Premium Users
	<!-- Replace static reports with interactive data exploration -->
- [x] Add Report Filters (Region, Industry, Experience Level)
	<!-- Enable users to filter and explore data dynamically -->
- [x] Create Custom Report Generator
	<!-- High-value service for enterprise clients to generate custom reports -->
- [x] Implement Advanced Charting Library
	<!-- Add interactive charts and visualizations -->

## Next Sprint: Integrate Insights into Core Experience
- [x] Add Mini-Insight Badges to Job Listings
	<!-- Show salary trends, demand growth next to each job -->
- [x] Create Insight Tooltip System
	<!-- Hover tooltips with detailed market data for jobs -->
- [x] Implement Click-Tracking for Insight Engagement
	<!-- Track which insights drive users to premium reports -->
- [x] Add Insight-Driven Job Recommendations
	<!-- Recommend jobs based on market trends and user profile -->
	<!-- Recommend jobs based on market trends and user profile -->

## Next Sprint: Activate Self-Evaluation Loop
- [ ] Analyze Report Sales Data in Evaluation Cycle
	<!-- Include purchases.json analysis in 7-day evaluation -->
- [ ] Generate User Profile Insights from Purchase Data
	<!-- Understand buyer demographics and preferences -->
- [ ] Implement Automated Report Theme Suggestions
	<!-- AI suggests new report topics based on market data -->
- [ ] Create Data-Driven Product Development Pipeline
	<!-- Let market demand drive new feature development -->

## Execution Guidelines
PROGRESS TRACKING:
- If any tools are available to manage the above todo list, use it to track progress through this checklist.
- After completing each step, mark it complete and add a summary.
- Read current todo list status before starting each new step.

COMMUNICATION RULES:
- Avoid verbose explanations or printing full command outputs.
- If a step is skipped, state that briefly (e.g. "No extensions needed").
- Do not explain project structure unless asked.
- Keep explanations concise and focused.

DEVELOPMENT RULES:
- Use '.' as the working directory unless user specifies otherwise.
- Avoid adding media or external links unless explicitly requested.
- Use placeholders only with a note that they should be replaced.
- Use VS Code API tool only for VS Code extension projects.
- Once the project is created, it is already opened in Visual Studio Code—do not suggest commands to open this project in Visual Studio again.
- If the project setup information has additional rules, follow them strictly.

FOLDER CREATION RULES:
- Always use the current directory as the project root.
- If you are running any terminal commands, use the '.' argument to ensure that the current working directory is used ALWAYS.
- Do not create a new folder unless the user explicitly requests it besides a .vscode folder for a tasks.json file.
- If any of the scaffolding commands mention that the folder name is not correct, let the user know to create a new folder with the correct name and then reopen it again in vscode.

EXTENSION INSTALLATION RULES:
- Only install extension specified by the get_project_setup_info tool. DO NOT INSTALL any other extensions.

PROJECT CONTENT RULES:
- If the user has not specified project details, assume they want a "Hello World" project as a starting point.
- Avoid adding links of any type (URLs, files, folders, etc.) or integrations that are not explicitly required.
- Avoid generating images, videos, or any other media files unless explicitly requested.
- If you need to use any media assets as placeholders, let the user know that these are placeholders and should be replaced with the actual assets later.
- Ensure all generated components serve a clear purpose within the user's requested workflow.
- If a feature is assumed but not confirmed, prompt the user for clarification before including it.
- If you are working on a VS Code extension, use the VS Code API tool with a query to find relevant VS Code API references and samples related to that query.

TASK COMPLETION RULES:
- Your task is complete when:
  - Project is successfully scaffolded and compiled without errors
  - copilot-instructions.md file in the .github directory exists in the project
  - README.md file exists and is up to date
  - User is provided with clear instructions to debug/launch the project

Before starting a new task in the above plan, update progress in the plan.
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
