
'use client';

import GeneralLedgerLog from "@/components/reports/general-ledger-log";
import { useBusiness } from "@/context/business-context";
import { useInventory } from "@/context/inventory-context";

export default function GeneralLedgerPage() {
    const { selectedBusiness } = useBusiness();
    const { getGeneralLedger, getChartOfAccounts } = useInventory();
    
    const ledgerEntries = getGeneralLedger(selectedBusiness.id);
    const accounts = getChartOfAccounts(selectedBusiness.id);

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">General Ledger</h1>
                <p className="text-muted-foreground">The complete, immutable record of all financial transactions.</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <GeneralLedgerLog 
                    key={selectedBusiness.id}
                    ledgerEntries={ledgerEntries}
                    accounts={accounts}
                />
            </div>
        </div>
    );
}

