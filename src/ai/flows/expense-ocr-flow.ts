
'use server';
/**
 * @fileOverview An AI flow to extract data from receipt images.
 *
 * - handleExpenseOcr - A server action wrapper for the flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OcrInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt or invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const OcrOutputSchema = z.object({
  vendorName: z.string().optional().describe('The name of the vendor or merchant.'),
  totalAmount: z.number().optional().describe('The final total amount on the receipt.'),
  transactionDate: z.string().optional().describe('The date of the transaction in YYYY-MM-DD format.'),
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;

const expenseOcrFlow = ai.defineFlow(
  {
    name: 'expenseOcrFlow',
    inputSchema: OcrInputSchema,
    outputSchema: OcrOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'expenseOcrPrompt',
      input: { schema: OcrInputSchema },
      output: { schema: OcrOutputSchema },
      prompt: `You are an expert receipt processing AI. Analyze the following receipt image and extract the vendor name, total amount, and transaction date.

If a value cannot be confidently determined, leave it empty.
For the date, return it in YYYY-MM-DD format.

Receipt: {{media url=receiptDataUri}}`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);


export async function handleExpenseOcr(
  receiptDataUri: string
): Promise<OcrOutput> {
  try {
    const result = await expenseOcrFlow({ receiptDataUri });
    return result;
  } catch (e: any) {
    console.error('OCR Flow Error:', e);
    throw new Error('Failed to process receipt image with AI.');
  }
}
