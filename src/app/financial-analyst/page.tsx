
'use client';

import FinancialAnalystChat from '@/components/financial-analyst/financial-analyst-chat';

export default function FinancialAnalystPage() {

  return (
    <div className="flex h-full w-full flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">AI Financial Analyst</h1>
          <p className="text-muted-foreground">
            Ask complex questions about your financial data in plain English.
          </p>
        </div>
      </div>
      <div className="flex-1">
        <FinancialAnalystChat />
      </div>
    </div>
  );
}

