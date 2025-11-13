import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import type { TraceStep } from '../services/skipTraceAgent';

interface TraceStepsProps {
  steps: TraceStep[];
}

export function TraceSteps({ steps }: TraceStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Agent Activity</h3>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.step} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {step.status === 'completed' && (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
              {step.status === 'running' && (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              )}
              {step.status === 'failed' && (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              {step.status === 'pending' && (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">{step.tool}</p>
              <p className="text-xs text-gray-600">{step.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
