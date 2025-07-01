
'use server';
/**
 * @fileOverview An AI flow for advanced financial analysis and Q&A.
 *
 * - handleFinancialQuery - A server action wrapper for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialQueryInputSchema = z.object({
  query: z.string().describe("The user's natural language question about their finances."),
  financialContext: z.string().describe('A JSON string containing the Profit & Loss, Balance Sheet, and Cash Flow statements.'),
});

const FinancialQueryOutputSchema = z.object({
  response: z.string().describe("The AI's natural language response, formatted as markdown."),
});
export type FinancialQueryOutput = z.infer<typeof FinancialQueryOutputSchema>;

const financialAnalystFlow = ai.defineFlow(
  {
    name: 'financialAnalystFlow',
    inputSchema: FinancialQueryInputSchema,
    outputSchema: FinancialQueryOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'financialAnalystPrompt',
      input: { schema: FinancialQueryInputSchema },
      output: { schema: FinancialQueryOutputSchema },
      prompt: `You are 'CLOUDO Financial Analyst', an expert AI specializing in business finance. Your task is to answer the user's questions based on the provided financial data.

The user has provided a JSON object containing three key financial statements:
1.  **Profit & Loss (pnl):** Shows revenues, costs, and expenses over a period.
2.  **Balance Sheet (balanceSheet):** A snapshot of assets, liabilities, and equity.
3.  **Cash Flow (cashFlow):** Tracks the movement of cash from operations.

Analyze the user's question and the provided JSON data to generate a helpful, accurate, and insightful response. Format your entire response in markdown for readability. Provide clear explanations and use the data to back up your analysis.

User's question:
"{{{query}}}"

Financial Data (JSON context):
\`\`\`json
{{{financialContext}}}
\`\`\`
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);


interface AnalystState {
  response?: string;
  error?: string;
}

export async function handleFinancialQuery(
  prevState: AnalystState,
  formData: FormData
): Promise<AnalystState> {
  const query = formData.get('query') as string;
  const financialContext = formData.get('financialContext') as string;
  
  if (!query || !financialContext) {
    return { error: 'Missing query or financial context.' };
  }

  try {
    const result = await financialAnalystFlow({ query, financialContext });
    return { ...result };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      error: `An error occurred while generating the response: ${errorMessage}`,
    };
  }
}
