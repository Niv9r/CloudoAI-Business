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
    description: 'Performs a Google search for a given query and returns the top results. The results contain direct links to product pages.',
    inputSchema: z.object({
      query: z.string().describe('The search query, e.g., "Classic Leather Wallet price uk".'),
    }),
    outputSchema: z.array(
      z.object({
        title: z.string().describe('The title of the search result.'),
        link: z.string().url().describe('The direct URL of the search result product page.'),
        snippet: z.string().describe('A snippet of the content from the search result.'),
      })
    ),
  },
  async (input) => {
    // NOTE: This is a MOCK search tool for demonstration. In a real application,
    // you would replace this with a call to a real search API (e.g., Google Custom Search API, SerpAPI).
    console.log(`[Mock Google Search] Searching for: ${input.query}`);
    
    // This mock data simulates finding direct product links.
    if (input.query.toLowerCase().includes('leather wallet')) {
      return [
        { title: 'Handmade Bifold Leather Wallet | The Leather Store UK', link: 'https://www.leatherstore.co.uk/products/handmade-bifold-wallet', snippet: 'Handmade real leather wallets. Our classic bifold is priced at £39.99. Free UK delivery.' },
        { title: 'Billfold Wallet with 8 Credit Card Slots | Aspinal of London', link: 'https://www.aspinaloflondon.com/products/billfold-wallet-with-8-credit-card-slots-smooth-black', snippet: 'Discover our luxury collection of men\'s leather wallets. This billfold wallet is £95.' },
        { title: 'John Lewis ANYDAY Leather Billfold Wallet, Brown', link: 'https://www.johnlewis.com/john-lewis-anyday-leather-billfold-wallet-brown/p5610810', snippet: 'Shop for leather wallets at John Lewis & Partners. Simple and durable, priced at £35.' },
        { title: 'Fossil Men\'s Derrick Leather Bifold Wallet', link: 'https://www.fossil.com/en-gb/products/derrick-rfid-bifold/ML3681200.html', snippet: 'Our top selling men\'s leather wallet from Fossil. The Derrick bifold is £55.' },
        { title: 'M&S Collection Leather Billfold Wallet | M&S', link: 'https://www.marksandspencer.com/collection-leather-billfold-wallet/p/flp60585698', snippet: 'A stylish and practical leather wallet for men. Price: £22.50.' },
      ];
    }
    // Generic fallback for other products
    return [
       { title: 'Example Competitor Site - Product A', link: 'https://www.competitor.co.uk/products/product-a', snippet: 'A similar product with a competitive price of £14.99. Check for details.' },
       { title: 'Another UK Retailer - Product B', link: 'https://www.another-site.co.uk/items/product-b-plus', snippet: 'Get this product for just £16.50 with next day delivery.' }
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
      url: z.string().url().describe("The direct URL to the competitor's product page, as returned by the search tool."),
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
        prompt: `You are a Market Research Analyst for a UK-based retail business. Your task is to perform a comprehensive market analysis for a given product and present your findings. You **must** ground all of your analysis in the real-time data provided by the googleSearchTool. Do not invent information.

Product to analyze:
- Name: {{{productName}}}
- Category: {{{productCategory}}}
- Our Current Price: £{{{currentPrice}}}

Instructions:
1.  Use the googleSearchTool to search for the same or very similar products available for sale in the UK. Use multiple search queries like "{{{productName}}} price uk", "buy {{{productCategory}}} uk", and similar variations to gather broad data.
2.  Analyze all search results to identify as many relevant competitors and their prices as possible. Extract the price as a number from the search result snippet or title.
3.  For the 'marketAnalysis' list, you MUST use the exact 'link' provided by the tool for the 'url' field. Do not create or hallucinate URLs.
4.  Provide a concise 'marketSummary' in markdown. This summary should synthesize your findings, mentioning the general price range you discovered and how our current price fits into this landscape. Base this summary **only** on the information returned by the tool.
5.  Compile a comprehensive 'marketAnalysis' list of all the competitor products you found. For each, include the product/store name, its price, and the direct URL from the search result.
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
