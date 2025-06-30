'use server';

import { suggestReorderAlgorithm, SuggestReorderAlgorithmInput, SuggestReorderAlgorithmOutput } from '@/ai/flows/suggest-reorder-algorithm';
import { z } from 'zod';

const SuggestReorderAlgorithmSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  historicalSalesData: z.string().min(1, "Sales data is required."),
});

export type FormState = {
  message: string;
  data: SuggestReorderAlgorithmOutput | null;
  error: string | null;
};

export async function handleSuggestReorderAlgorithm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SuggestReorderAlgorithmSchema.safeParse({
    productName: formData.get('productName'),
    historicalSalesData: formData.get('historicalSalesData'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data',
      data: null,
      error: validatedFields.error.flatten().fieldErrors_to_string(), // a helper method might be needed here
    };
  }
  
  try {
    const result = await suggestReorderAlgorithm(validatedFields.data as SuggestReorderAlgorithmInput);
    return { message: 'Suggestion generated successfully!', data: result, error: null };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: 'Failed to generate suggestion.', data: null, error: errorMessage };
  }
}
