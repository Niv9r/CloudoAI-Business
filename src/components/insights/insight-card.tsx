'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InsightCardProps {
  title: string;
  icon: ReactNode;
  markdownContent: string;
}

export default function InsightCard({ title, icon, markdownContent }: InsightCardProps) {
  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                {icon}
            </div>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-p:my-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
