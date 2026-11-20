import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function DashboardPage({ searchParams }) {
  const params = (await searchParams) || {};
  const initialView = typeof params.view === 'string' ? params.view : 'overview';
  const initialTransactionId = typeof params.tx === 'string' ? params.tx : null;

  return (
    <DashboardLayout
      initialView={initialView}
      initialTransactionId={initialTransactionId}
    />
  );
}
