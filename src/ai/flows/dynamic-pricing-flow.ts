'use server';
/**
 * @fileOverview An AI flow for conducting market research on products.
 *
 * - handleMarketResearch - A server action wrapper for the flow.
 * - MarketResearchOutput - The return type for the flow.
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
        { title: 'Fossil UK - Men\'s Wallets', link: 'https://www.fossil.com/en-gb/men/wallets/', snippet: 'Men\'s leather wallets from Fossil. Our top selling wallets are around £55.' },
        { title: 'Marks & Spencer - Wallets', link: 'https://www.marksandspencer.com/l/men/accessories/wallets', snippet: 'Stylish and practical leather wallets for men. Prices start at just £22.50.' },
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
const MarketResearchInputSchema = z.object({
  productName: z.string(),
  productCategory: z.string(),
  currentPrice: z.number(),
});

const MarketResearchOutputSchema = z.object({
  marketSummary: z.string().describe('A markdown-formatted summary of the market research findings, including price ranges, common product names, and overall market positioning.'),
  marketAnalysis: z.array(
    z.object({
      productName: z.string().describe("The name of the competitor's product or the name of the retail store."),
      price: z.number().describe("The price of the competitor's product, extracted as a number."),
      url: z.string().url().describe("The direct URL to the competitor's product page."),
    })
  ).describe('A comprehensive list of all relevant products found during the market research.'),
});
export type MarketResearchOutput = z.infer<typeof MarketResearchOutputSchema>;


// 3. Define the main AI flow
const marketResearchFlow = ai.defineFlow(
  {
    name: 'marketResearchFlow',
    inputSchema: MarketResearchInputSchema,
    outputSchema: MarketResearchOutputSchema,
    model: 'googleai/gemini-2.5-flash',
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'marketResearchPrompt',
        input: { schema: MarketResearchInputSchema },
        output: { schema: MarketResearchOutputSchema },
        tools: [googleSearchTool],
        prompt: `You are a Market Research Analyst for a UK-based retail business. Your task is to perform a comprehensive market analysis for a given product and present your findings.

Product to analyze:
- Name: {{{productName}}}
- Category: {{{productCategory}}}
- Our Current Price: £{{{currentPrice}}}

Instructions:
1.  Use the googleSearchTool to search for the same or very similar products available for sale in the UK. Use multiple search queries like "{{{productName}}} price uk", "buy {{{productCategory}}} uk", and similar variations to gather broad data.
2.  Analyze all search results to identify as many relevant competitors and their prices as possible. Extract the price as a number from the search result snippet or title.
3.  Provide a concise 'marketSummary' in markdown. This summary should synthesize your findings, mentioning the general price range you discovered, any noticeable market tiers (e.g., budget, mid-range, premium), and how our current price fits into this landscape.
4.  Compile a comprehensive 'marketAnalysis' list of all the competitor products you found. For each, include the product/store name, its price, and the direct URL from the search result. Ensure the URL is a direct link to the product if possible.
`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);


// 4. Create a server action to be called from the UI
interface ResearchState {
  result?: MarketResearchOutput;
  error?: string;
}

export async function handleMarketResearch(
  prevState: ResearchState,
  formData: FormData
): Promise<ResearchState> {
  const productData = formData.get('product') as string;

  if (!productData) {
    return { error: 'Missing product data.' };
  }

  try {
    const product = JSON.parse(productData);
    const result = await marketResearchFlow({
        productName: product.name,
        productCategory: product.category,
        currentPrice: product.price,
    });
    return { result };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected AI error occurred.';
    return {
      error: `An error occurred while analyzing the market: ${errorMessage}`,
    };
  }
}
