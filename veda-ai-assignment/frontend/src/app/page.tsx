import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] px-4 py-16">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            Powered by Claude AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Generate Professional<br />
            <span className="text-indigo-600">Question Papers</span> Instantly
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Create structured, curriculum-aligned exam papers in seconds.
            Set question types, difficulty, marks — AI does the rest.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/create"
            className="px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 text-base"
          >
            ✨ Create Assessment
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {[
            {
              icon: '🎯',
              title: 'Multiple Question Types',
              desc: 'MCQ, short answer, long answer, true/false, fill-in-the-blank',
            },
            {
              icon: '⚡',
              title: 'Real-time Generation',
              desc: 'Background AI processing with live progress updates',
            },
            {
              icon: '📄',
              title: 'Export as PDF',
              desc: 'Download clean, print-ready question papers instantly',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left shadow-sm"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
