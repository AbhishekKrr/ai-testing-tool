import AssignmentForm from '@/components/AssignmentForm';

export const metadata = {
  title: 'Create Assessment – VedaAI',
};

export default function CreatePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create Assessment</h1>
        <p className="text-slate-500 mt-1.5">
          Fill in the details below and our AI will generate a structured question paper.
        </p>
      </div>

      <AssignmentForm />
    </div>
  );
}
