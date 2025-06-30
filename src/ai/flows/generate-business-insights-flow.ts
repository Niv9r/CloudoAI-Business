'use server';
/**
 * @fileOverview An AI flow to generate a comprehensive analysis of the entire business.
 *
 * - handleGenerateInsights - A server action that triggers the AI analysis.
 * - BusinessInsightsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBusinessInsightsInputSchema = z.object({
  businessContext: z.string().describe('A JSON string containing all relevant business data like products, sales, and expenses.'),
});

export const BusinessInsightsOutputSchema = z.object({
  revenueAndProfit: z.string().describe("Markdown formatted insights on revenue and profit. Analyze sales data, identify trends, top-performing days/products, and profitability. Include a summary and key bullet points."),
  inventory: z.string().describe("Markdown formatted insights on inventory. Analyze product stock levels, identify slow-moving vs. fast-moving items, point out items that are out of stock or low stock, and suggest potential reorder actions. Include a summary and key bullet points."),
  employeePerformance: z.string().describe("Markdown formatted insights on employee performance. Analyze sales data attributed to employees, identify top performers, and comment on sales distribution. Include a summary and key bullet points."),
  expenseAnalysis: z.string().describe("Markdown formatted analysis of expenses. Break down expenses by vendor or category, identify major cost centers, and point out any overdue expenses. Include a summary and key bullet points."),
  strategicSuggestions: z.string().describe("A markdown formatted list of 3-5 actionable, strategic suggestions for the business based on the holistic analysis of all provided data."),
});
export type BusinessInsightsOutput = z.infer<typeof BusinessInsightsOutputSchema>;


const generateBusinessInsightsFlow = ai.defineFlow(
  {
    name: 'generateBusinessInsightsFlow',
    inputSchema: GenerateBusinessInsightsInputSchema,
    outputSchema: BusinessInsightsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateBusinessInsightsPrompt',
      input: { schema: GenerateBusinessInsightsInputSchema },
      output: { schema: BusinessInsightsOutputSchema },
      prompt: `You are an expert business analyst and consultant AI. Your task is to perform a comprehensive, holistic analysis of the provided business data and generate a report with actionable insights.

The user has provided a JSON object containing their core business data: products, sales, vendors, and expenses.

Carefully analyze all the data to generate insights for each of the following categories. For each category, provide a concise summary followed by key bullet points. The entire response for each category MUST be in markdown format.

1.  **Revenue & Profit Analysis**: Analyze sales trends, profitability (if possible), top-performing products, and peak sales periods.
2.  **Inventory Analysis**: Evaluate inventory health. Identify fast-moving, slow-moving, low-stock, and out-of-stock items.
3.  **Employee Performance**: Analyze sales per employee to identify top performers and any interesting patterns.
4.  **Expense Analysis**: Break down spending by vendor. Highlight significant cost centers and any overdue expenses.
5.  **Strategic Suggestions**: Based on your complete analysis, provide a list of 3-5 clear, actionable, and strategic recommendations to help the business owner improve operations, increase profit, or reduce costs.

Here is the business data context:
\`\`\`json
{{{businessContext}}}
\`\`\`
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);


interface InsightsState {
  insights: BusinessInsightsOutput | null;
  error: string | null;
}

export async function handleGenerateInsights(
  prevState: InsightsState,
  formData: FormData
): Promise<InsightsState> {
  const businessContext = formData.get('businessContext') as string;
  
  if (!businessContext) {
    return { insights: null, error: 'Missing business context.' };
  }

  try {
    const result = await generateBusinessInsightsFlow({ businessContext });
    return { insights: result, error: null };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred during analysis.';
    return {
      insights: null,
      error: `An error occurred while generating insights: ${errorMessage}`,
    };
  }
}
