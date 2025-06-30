'use client';

import { useState } from 'react';
import type { Shift } from '@/lib/types';
import ShiftsLog from '@/components/shifts/shifts-log';
import ShiftDetailsDialog from '@/components/shifts/shift-details-dialog';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';

export default function ShiftsPage() {
  const { selectedBusiness } = useBusiness();
  const { getShifts } = useInventory();
  const shifts = getShifts(selectedBusiness.id);
  
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleViewDetails = (shift: Shift) => {
    setSelectedShift(shift);
  };
  
  const handleCloseDialog = () => {
    setSelectedShift(null);
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Shift Reports</h1>
          <p className="text-muted-foreground">Review historical shift reconciliation reports.</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ShiftsLog
          key={selectedBusiness.id}
          shifts={shifts}
          onViewDetails={handleViewDetails}
        />
      </div>
      {selectedShift && (
        <ShiftDetailsDialog
            isOpen={!!selectedShift}
            onOpenChange={(open) => !open && handleCloseDialog()}
            shift={selectedShift}
        />
      )}
    </div>
  );
}
