// use server'

/**
 * @fileOverview Suggests an appropriate sales velocity calculation algorithm based on historical sales data.
 *
 * - suggestReorderAlgorithm - A function that suggests the algorithm.
 * - SuggestReorderAlgorithmInput - The input type for the suggestReorderAlgorithm function.
 * - SuggestReorderAlgorithmOutput - The return type for the suggestReorderAlgorithm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReorderAlgorithmInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  historicalSalesData: z
    .string()
    .describe(
      'Historical sales data for the product, including dates and quantities sold.'
    ),
});
export type SuggestReorderAlgorithmInput = z.infer<
  typeof SuggestReorderAlgorithmInputSchema
>;

const SuggestReorderAlgorithmOutputSchema = z.object({
  algorithmSuggestion: z
    .string()
    .describe(
      'The suggested algorithm for calculating sales velocity, e.g., Simple Moving Average, Weighted Moving Average, Exponential Smoothing.'
    ),
  justification: z
    .string()
    .describe(
      'A justification for the suggested algorithm based on the sales data characteristics.'
    ),
});
export type SuggestReorderAlgorithmOutput = z.infer<
  typeof SuggestReorderAlgorithmOutputSchema
>;

export async function suggestReorderAlgorithm(
  input: SuggestReorderAlgorithmInput
): Promise<SuggestReorderAlgorithmOutput> {
  return suggestReorderAlgorithmFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReorderAlgorithmPrompt',
  input: {schema: SuggestReorderAlgorithmInputSchema},
  output: {schema: SuggestReorderAlgorithmOutputSchema},
  prompt: `You are an expert in inventory management and sales forecasting.
  Based on the historical sales data for the product "{{{productName}}}", you will suggest the most appropriate algorithm for calculating sales velocity.

  Here is the historical sales data:
  {{{historicalSalesData}}}

  Consider the following algorithms:
  - Simple Moving Average
  - Weighted Moving Average
  - Exponential Smoothing

  Provide a clear justification for your suggestion.

  Output should be JSON format.`,
});

const suggestReorderAlgorithmFlow = ai.defineFlow(
  {
    name: 'suggestReorderAlgorithmFlow',
    inputSchema: SuggestReorderAlgorithmInputSchema,
    outputSchema: SuggestReorderAlgorithmOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
