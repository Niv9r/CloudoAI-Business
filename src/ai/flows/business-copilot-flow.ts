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

const BusinessCopilotInputSchema = z.object({
  query: z.string().describe('The user\'s natural language question about their business.'),
  businessContext: z.string().describe('A JSON string containing relevant business data like products, sales, and expenses.'),
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

Analyze the user's question and the provided JSON data context to generate a helpful and accurate response. The data context includes products, sales, and expenses. The sales data includes an 'employee' field, allowing you to answer questions about sales performance per employee. Format your response in markdown for readability.

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

User's question:
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
  response?: string;
  suggestedActionLink?: string;
  error?: string;
}

export async function handleBusinessCopilotQuery(
  prevState: CopilotState,
  formData: FormData
): Promise<CopilotState> {
  const query = formData.get('query') as string;
  const businessContext = formData.get('businessContext') as string;
  
  if (!query || !businessContext) {
    return { error: 'Missing query or business context.' };
  }

  try {
    const result = await businessCopilotFlow({ query, businessContext });
    return { ...result };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      error: `An error occurred while generating the response: ${errorMessage}`,
    };
  }
}
