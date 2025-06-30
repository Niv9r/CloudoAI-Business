'use server';
/**
 * @fileOverview An AI flow to suggest product reorders based on inventory levels.
 *
 * - suggestReorderFlow - A function that handles the reorder suggestion process.
 * - handleSuggestReorder - A server action wrapper for the flow.
 * - SuggestReorderOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { products as allProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { z } from 'genkit';

const SuggestReorderInputSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      stock: z.number(),
      status: z.string(),
    })
  ),
});

const SuggestReorderOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        productId: z.string().describe('The unique ID of the product.'),
        productName: z.string().describe('The name of the product.'),
        reason: z
          .string()
          .describe('A brief, actionable reason for the reorder suggestion.'),
      })
    )
    .describe('List of products that should be reordered.'),
  summary: z
    .string()
    .describe(
      'A brief, one-sentence summary of the inventory health and reorder needs.'
    ),
});
export type SuggestReorderOutput = z.infer<typeof SuggestReorderOutputSchema>;

export const suggestReorderFlow = ai.defineFlow(
  {
    name: 'suggestReorderFlow',
    inputSchema: SuggestReorderInputSchema,
    outputSchema: SuggestReorderOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'suggestReorderPrompt',
      input: { schema: SuggestReorderInputSchema },
      output: { schema: SuggestReorderOutputSchema },
      prompt: `You are an expert inventory management AI for a retail business.
Your task is to analyze the current inventory levels and suggest which products should be reordered.

- Base your suggestions on the 'stock' and 'status' fields.
- Prioritize items that are 'Out of Stock' or 'Low Stock'.
- For each suggestion, provide a brief, actionable reason.
- If inventory levels are healthy and no reorders are needed, state that clearly in the summary and provide an empty suggestions array.

Here is the current inventory data:
{{#each products}}
- Product: {{name}} (ID: {{id}}), Stock: {{stock}}, Status: '{{status}}'
{{/each}}
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function handleSuggestReorder(
  prevState: any,
  formData: FormData
): Promise<SuggestReorderOutput & { error: string | null }> {
  try {
    const result = await suggestReorderFlow({ products: allProducts });
    return { ...result, error: null };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      suggestions: [],
      summary: '',
      error: `An error occurred while generating suggestions: ${errorMessage}`,
    };
  }
}
