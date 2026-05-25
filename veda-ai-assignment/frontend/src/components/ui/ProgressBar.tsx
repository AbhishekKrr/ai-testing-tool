interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <p className="text-sm text-slate-600 mb-1.5">{label}</p>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="text-right text-xs text-slate-500 mt-1">{progress}%</p>
    </div>
  );
}
