
'use server';
/**
 * @fileOverview A dynamic pricing engine AI flow.
 *
 * - handleDynamicPricing - A server action wrapper for the flow.
 * - DynamicPricingOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define the tool for the AI to use (Google Search)
const googleSearchTool = ai.defineTool(
  {
    name: 'googleSearchTool',
    description: 'Performs a Google search for a given query and returns the top results.',
    inputSchema: z.object({
      query: z.string().describe('The search query, e.g., "Classic Leather Wallet price uk".'),
    }),
    outputSchema: z.array(
      z.object({
        title: z.string().describe('The title of the search result.'),
        link: z.string().describe('The URL of the search result.'),
        snippet: z.string().describe('A snippet of the content from the search result.'),
      })
    ),
  },
  async (input) => {
    // In a real application, this would call a Google Search API.
    // For this prototype, we'll return mock data based on the query.
    console.log(`[Mock Google Search] Searching for: ${input.query}`);
    if (input.query.toLowerCase().includes('leather wallet')) {
      return [
        { title: 'The Leather Store UK - Mens Wallets', link: 'https://www.leatherstore.co.uk/wallets', snippet: 'Handmade real leather wallets. Prices from £39.99. Free UK delivery.' },
        { title: 'Aspinal of London | Mens Leather Wallets', link: 'https://www.aspinaloflondon.com/mens-collection/mens-wallets', snippet: 'Discover our luxury collection of men\'s leather wallets. Billfold wallets from £95.' },
        { title: 'John Lewis - Leather Wallets', link: 'https://www.johnlewis.com/men/mens-accessories/wallets', snippet: 'Shop for leather wallets at John Lewis & Partners. Prices range from £35 to £150.' },
      ];
    }
    // Generic fallback for other products
    return [
       { title: 'Example Competitor Site', link: 'https://www.competitor.co.uk/productA', snippet: 'A similar product with a competitive price of £14.99. Check for details.' },
       { title: 'Another UK Retailer', link: 'https://www.another-site.co.uk/productB', snippet: 'Get this product for just £16.50 with next day delivery.' }
    ];
  }
);


// 2. Define the input and output schemas for the flow
const DynamicPricingInputSchema = z.object({
  productName: z.string(),
  productCategory: z.string(),
  currentPrice: z.number(),
});

const DynamicPricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The AI-suggested optimal price for the product.'),
  reasoning: z.string().describe('A markdown-formatted summary explaining the rationale behind the suggested price.'),
  competitors: z.array(
    z.object({
      productName: z.string().describe('The name of the competitor\'s product or the store name.'),
      price: z.number().describe('The price of the competitor\'s product.'),
      url: z.string().url().describe('The direct URL to the competitor\'s product page.'),
    })
  ).describe('A list of key competitors found during the search.'),
});
export type DynamicPricingOutput = z.infer<typeof DynamicPricingOutputSchema>;


// 3. Define the main AI flow
const dynamicPricingFlow = ai.defineFlow(
  {
    name: 'dynamicPricingFlow',
    inputSchema: DynamicPricingInputSchema,
    outputSchema: DynamicPricingOutputSchema,
    model: 'googleai/gemini-1.5-flash-preview',
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'dynamicPricingPrompt',
        input: { schema: DynamicPricingInputSchema },
        output: { schema: DynamicPricingOutputSchema },
        tools: [googleSearchTool],
        prompt: `You are a dynamic pricing analyst for a UK-based retail business. Your task is to analyze a product and suggest an optimal price based on competitor pricing in the UK market.

Product to analyze:
- Name: {{{productName}}}
- Category: {{{productCategory}}}
- Current Price: £{{{currentPrice}}}

Instructions:
1.  Use the googleSearchTool to search for similar products available for sale in the UK. Use search queries like "{{{productName}}} price uk" or "buy {{{productCategory}}} uk".
2.  Analyze the search results to identify 3-5 key competitors and their pricing. Extract the price as a number.
3.  Based on the competitor prices, determine a suggested new price for the product. The goal is to be competitive but also maximize profit.
4.  Provide a brief reasoning for your price suggestion. Explain how it positions the product in the market (e.g., "This price places us slightly below the premium brands like Aspinal but above the budget options...").
5.  List the top competitors you found, including their product name (or a close equivalent), price, and a direct URL to their product page from the search results.
`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);


// 4. Create a server action to be called from the UI
interface PricingState {
  result?: DynamicPricingOutput;
  error?: string;
}

export async function handleDynamicPricing(
  prevState: PricingState,
  formData: FormData
): Promise<PricingState> {
  const productData = formData.get('product') as string;

  if (!productData) {
    return { error: 'Missing product data.' };
  }

  try {
    const product = JSON.parse(productData);
    const result = await dynamicPricingFlow({
        productName: product.name,
        productCategory: product.category,
        currentPrice: product.price,
    });
    return { result };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      error: `An error occurred while analyzing pricing: ${errorMessage}`,
    };
  }
}
