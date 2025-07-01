
'use client';

import { ReportRow } from '@/app/reports/custom/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench } from 'lucide-react';

interface CustomReportDisplayProps {
    reportData: ReportRow[] | null;
}

export default function CustomReportDisplay({ reportData }: CustomReportDisplayProps) {
    if (!reportData) {
        return (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground space-y-2">
                    <Wrench className="h-12 w-12 mx-auto" />
                    <p className="font-semibold">Your report will be displayed here.</p>
                    <p>Select your desired metrics and dimensions, then click "Generate Report".</p>
                </div>
            </Card>
        );
    }

    if (reportData.length === 0) {
        return (
             <Card className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground space-y-2">
                    <p className="font-semibold">No data found for the selected criteria.</p>
                    <p>Try adjusting your filters or date range.</p>
                </div>
            </Card>
        );
    }
    
    const headers = Object.keys(reportData[0]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Custom Report</CardTitle>
                <CardDescription>Results based on your selected criteria.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(header => (
                                <TableHead key={header}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((row, index) => (
                            <TableRow key={index}>
                                {headers.map(header => (
                                    <TableCell key={header}>
                                        {typeof row[header] === 'number' 
                                            ? (row[header] as number).toLocaleString(undefined, {
                                                style: header.toLowerCase().includes('sales') || header.toLowerCase().includes('profit') ? 'currency' : 'decimal',
                                                currency: 'USD',
                                                minimumFractionDigits: header.toLowerCase().includes('sales') || header.toLowerCase().includes('profit') ? 2 : 0,
                                            })
                                            : row[header]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

    