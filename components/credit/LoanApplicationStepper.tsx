interface Step {
  label: string;
  state: 'complete' | 'current' | 'upcoming';
}

interface LoanApplicationStepperProps {
  steps: Step[];
  currentIndex: number;
}

export function LoanApplicationStepper({ steps, currentIndex }: LoanApplicationStepperProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            step.state === 'complete' ? 'bg-emerald-100 text-emerald-800' :
            step.state === 'current' ? 'bg-sky-100 text-sky-800' :
            'bg-gray-100 text-gray-500'
          }`}>
            <span>{index + 1}</span>
            <span>{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-0.5 bg-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}