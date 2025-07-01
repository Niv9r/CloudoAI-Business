'use server';
/**
 * @fileOverview A whole-business AI co-pilot for answering natural language questions.
 *
 * - businessCopilotFlow - A function that handles the AI analysis process.
 * - handleBusinessCopilotQuery - A server action wrapper for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product, Sale, Expense } from '@/lib/types';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const BusinessCopilotInputSchema = z.object({
  query: z.string().describe("The user's current question about their business."),
  businessContext: z.string().describe('A JSON string containing relevant business data like the business profile, products, sales, and expenses.'),
  history: z.array(MessageSchema).optional().describe('The history of the conversation so far.'),
});

const BusinessCopilotOutputSchema = z.object({
  response: z
    .string()
    .describe('The AI\'s natural language response. This should be formatted as markdown.'),
  suggestedActionLink: z
    .string()
    .optional()
    .describe('An optional link to a relevant page in the app if an action is suggested.'),
});
export type BusinessCopilotOutput = z.infer<typeof BusinessCopilotOutputSchema>;

const businessCopilotFlow = ai.defineFlow(
  {
    name: 'businessCopilotFlow',
    inputSchema: BusinessCopilotInputSchema,
    outputSchema: BusinessCopilotOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'businessCopilotPrompt',
        input: { schema: BusinessCopilotInputSchema },
        output: { schema: BusinessCopilotOutputSchema },
        prompt: `You are 'CLOUDO Co-Pilot', an expert business analyst AI. Your goal is to provide concise, data-driven insights based on the user's question and the provided business data.

You are analyzing data for the business named in the \`businessProfile\` object within the JSON context. When responding, refer to the business by its name to personalize the experience.

Analyze the user's question, the conversation history, and the provided JSON data context to generate a helpful and accurate response. The data context includes the business profile, products, sales, and expenses. The sales data includes an 'employee' field, allowing you to answer questions about sales performance per employee. Format your response in markdown for readability.

If the user's query suggests a clear next step or action that can be performed within the app, identify the most relevant page from this list and include it in the 'suggestedActionLink' field.
Available pages:
- /: Dashboard
- /pos: Point of Sale
- /sales: Sales Log
- /inventory: Inventory Management
- /reports: Reports & Analytics
- /expenses: Expense Management
- /settings: Settings
- /customers: Customer Management
- /purchase-orders: Purchase Orders
- /stock-adjustments: Stock Adjustments

For example, if the user asks "Which products are low on stock?", you should suggest the '/inventory' page. If they ask about recent sales, suggest '/sales'. If they ask "Who is my top performing employee?", analyze the sales data and provide an answer.

{{#if history}}
---
Conversation History:
{{#each history}}
**{{role}}**: {{content}}
{{/each}}
---
{{/if}}

Current User Question:
"{{{query}}}"

Business Data (JSON context):
\`\`\`json
{{{businessContext}}}
\`\`\`
`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);


interface CopilotState {
  messages: { role: 'user' | 'ai'; content: string; link?: string }[];
  error?: string;
}

export async function handleBusinessCopilotQuery(
  prevState: CopilotState,
  formData: FormData
): Promise<CopilotState> {
  const query = formData.get('query') as string;
  const businessContext = formData.get('businessContext') as string;
  
  if (!query || !businessContext) {
    return { ...prevState, error: 'Missing query or business context.' };
  }

  // Convert the UI message history to the format the AI model expects
  const historyForAI = prevState.messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    content: msg.content,
  }));

  try {
    const result = await businessCopilotFlow({ query, businessContext, history: historyForAI });
    
    const newUserMessage = { role: 'user' as const, content: query };
    const newAiMessage = { role: 'ai' as const, content: result.response, link: result.suggestedActionLink };
    
    return {
      messages: [...prevState.messages, newUserMessage, newAiMessage],
      error: undefined
    };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      ...prevState,
      error: `An error occurred while generating the response: ${errorMessage}`,
    };
  }
}
