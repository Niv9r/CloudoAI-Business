import { config } from 'dotenv';
config();

// Define and register flows here.
// For example:
// import '@/ai/flows/example-flow.ts';
import '@/ai/flows/suggest-reorder-flow.ts';
import '@/ai/flows/business-copilot-flow.ts';
import '@/ai/flows/generate-business-insights-flow.ts';
