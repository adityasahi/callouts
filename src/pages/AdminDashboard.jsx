import { Shield, ListChecks, Image, Webhook, BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTasksTable from '@/components/admin/AdminTasksTable';
import AdminSubmissionsTable from '@/components/admin/AdminSubmissionsTable';
import WebhookSettings from '@/components/admin/WebhookSettings';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage tasks and submissions</p>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="mb-6">
          <TabsTrigger value="tasks" className="gap-2">
            <ListChecks className="w-4 h-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Image className="w-4 h-4" /> Submissions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart2 className="w-4 h-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="developer" className="gap-2">
            <Webhook className="w-4 h-4" /> Developer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <AdminTasksTable />
        </TabsContent>

        <TabsContent value="submissions">
          <AdminSubmissionsTable />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="developer">
          <WebhookSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}