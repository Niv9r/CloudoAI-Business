import BusinessProfileCard from "@/components/settings/business-profile-card";
import ManageBusinessesCard from "@/components/settings/manage-businesses-card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business profiles and application settings.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <ManageBusinessesCard />
        </div>
        <div className="lg:col-span-1">
            <BusinessProfileCard />
        </div>
      </div>
    </div>
  );
}
