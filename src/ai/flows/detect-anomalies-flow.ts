
'use server';
/**
 * @fileOverview An AI flow to detect business anomalies.
 *
 * - handleDetectAnomalies - A server action wrapper for the flow.
 * - DetectAnomaliesOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectAnomaliesInputSchema = z.object({
  businessContext: z.string().describe('A JSON string containing recent business data like the business profile, products, and sales.'),
});

const AnomalySchema = z.object({
    title: z.string().describe("A short, descriptive title for the anomaly."),
    description: z.string().describe("A concise, one-to-two sentence explanation of the anomaly, why it's noteworthy, and a potential cause or action."),
    severity: z.enum(['Low', 'Medium', 'High']).describe("The potential impact of the anomaly."),
    relevantLink: z.string().optional().describe("A link to a relevant page in the app, if applicable (e.g., /inventory, /sales).")
});

const DetectAnomaliesOutputSchema = z.object({
  anomalies: z
    .array(AnomalySchema)
    .describe('A list of detected business anomalies. If no significant anomalies are found, this array should be empty.'),
});
export type DetectAnomaliesOutput = z.infer<typeof DetectAnomaliesOutputSchema>;


const detectAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAnomaliesFlow',
    inputSchema: DetectAnomaliesInputSchema,
    outputSchema: DetectAnomaliesOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'detectAnomaliesPrompt',
        input: { schema: DetectAnomaliesInputSchema },
        output: { schema: DetectAnomaliesOutputSchema },
        prompt: `You are an expert business data analyst AI. Your task is to examine the provided business data and identify significant anomalies or patterns that a business owner should be aware of.

Analyze the sales data in relation to product stock levels and typical performance. Look for things like:
- A product that is selling much faster or slower than usual.
- A product that is low in stock but still selling well (risk of stockout).
- A product with high stock but very low sales (dead stock).
- Unusually high or low sales for a recent day compared to the average.

For each anomaly you find, provide a title, a brief description, a severity level (Low, Medium, High), and an optional link to a relevant page in the app. If there are no noteworthy anomalies, return an empty array.

Available pages:
- /: Dashboard
- /pos: Point of Sale
- /sales: Sales Log
- /inventory: Inventory Management
- /reports: Reports & Analytics
- /expenses: Expense Management

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


interface AnomalyState {
  anomalies?: z.infer<typeof AnomalySchema>[];
  error?: string;
}

export async function handleDetectAnomalies(
  prevState: AnomalyState,
  formData: FormData
): Promise<AnomalyState> {
  const businessContext = formData.get('businessContext') as string;
  
  if (!businessContext) {
    return { error: 'Missing business context.' };
  }

  try {
    const result = await detectAnomaliesFlow({ businessContext });
    return { anomalies: result.anomalies };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      error: `An error occurred while detecting anomalies: ${errorMessage}`,
    };
  }
}

    