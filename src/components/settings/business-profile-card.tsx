'use client';

import { useBusiness } from '@/context/business-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import BusinessFormDialog from './business-form-dialog';

export default function BusinessProfileCard() {
  const { selectedBusiness } = useBusiness();

  if (!selectedBusiness) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>No business selected.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">Select a business from the list or create a new one to see its details here.</p>
             </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Details for {selectedBusiness.name}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h3 className="font-semibold">{selectedBusiness.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedBusiness.legalName}</p>
        </div>
        <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedBusiness.address}</span>
            </div>
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{selectedBusiness.email}</span>
            </div>
            <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedBusiness.phone}</span>
            </div>
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>Timezone: {selectedBusiness.timezone}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <BusinessFormDialog business={selectedBusiness}>
            <Button className='w-full'>Edit Profile</Button>
        </BusinessFormDialog>
      </CardFooter>
    </Card>
  );
}
