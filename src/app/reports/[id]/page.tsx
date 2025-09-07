import { Suspense } from 'react';
import ReportPreview from '@/components/ReportPreview';

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default function ReportPage({ params }: ReportPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading report...</div>}>
        <ReportPreview reportId={params.id} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: ReportPageProps) {
  return {
    title: `Report ${params.id} | Beginnings`,
    description: 'View detailed market analysis and insights for your career development.',
  };
}
