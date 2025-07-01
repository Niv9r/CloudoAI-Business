
'use server';
/**
 * @fileOverview An AI flow to explain financial reports.
 *
 * - handleExplainFinancials - A server action wrapper for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainFinancialsInputSchema = z.object({
  reportName: z.enum(['Profit & Loss', 'Balance Sheet', 'Cash Flow Statement']),
  reportData: z.string().describe('A JSON string containing the data for the financial report.'),
});

const ExplainFinancialsOutputSchema = z.object({
  explanation: z.string().describe("The AI's plain-English explanation of the financial report, formatted as markdown."),
});

const explainFinancialsFlow = ai.defineFlow(
  {
    name: 'explainFinancialsFlow',
    inputSchema: ExplainFinancialsInputSchema,
    outputSchema: ExplainFinancialsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'explainFinancialsPrompt',
      input: { schema: ExplainFinancialsInputSchema },
      output: { schema: ExplainFinancialsOutputSchema },
      prompt: `You are 'CLOUDO Financial Analyst', an expert AI specializing in making business finance easy to understand.
Your task is to explain the user's financial report in simple, clear terms. Avoid jargon. Focus on what the numbers mean for the business owner.

The user wants to understand their {{{reportName}}} report.

Analyze the data below and provide a concise summary. Highlight the most important takeaways a business owner should know. For example, if it's a P&L, explain what net profit means. If it's a Balance Sheet, explain what assets and liabilities are.

Financial Report Data (JSON context):
\`\`\`json
{{{reportData}}}
\`\`\`
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);


interface ExplainState {
  explanation?: string;
  error?: string;
}

export async function handleExplainFinancials(
  prevState: ExplainState,
  formData: FormData
): Promise<ExplainState> {
  const reportName = formData.get('reportName') as 'Profit & Loss' | 'Balance Sheet' | 'Cash Flow Statement';
  const reportData = formData.get('reportData') as string;
  
  if (!reportName || !reportData) {
    return { error: 'Missing report name or data.' };
  }

  try {
    const result = await explainFinancialsFlow({ reportName, reportData });
    return { explanation: result.explanation };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      error: `An error occurred while generating the explanation: ${errorMessage}`,
    };
  }
}
