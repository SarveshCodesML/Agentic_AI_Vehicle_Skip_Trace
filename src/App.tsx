import { useState, useRef, useEffect } from 'react';
import { Send, Car } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { TraceSteps } from './components/TraceSteps';
import { TraceResults } from './components/TraceResults';
import { SkipTraceAgent, type TraceStep, type TraceResult } from './services/skipTraceAgent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to the Skip Trace AI Agent for Vehicle Repossession.\n\nProvide the following information to begin tracing:\n• VIN Number\n• First Name\n• Last Name\n\nExample: "Trace VIN 1HGBH41JXMN109186 for John Smith"'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<TraceStep[]>([]);
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentSteps, traceResult]);

  const extractTraceInfo = (input: string): { vin: string; firstName: string; lastName: string } | null => {
    const vinMatch = input.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);

    const namePatterns = [
      /for\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
      /name[:\s]+([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
      /([A-Z][a-z]+)\s+([A-Z][a-z]+)$/i
    ];

    let firstName = '';
    let lastName = '';

    for (const pattern of namePatterns) {
      const nameMatch = input.match(pattern);
      if (nameMatch) {
        firstName = nameMatch[1];
        lastName = nameMatch[2];
        break;
      }
    }

    if (vinMatch && firstName && lastName) {
      return {
        vin: vinMatch[0].toUpperCase(),
        firstName,
        lastName
      };
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const traceInfo = extractTraceInfo(userMessage);

    if (!traceInfo) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I couldn\'t extract the required information. Please provide:\n• A valid 17-character VIN\n• First and Last name\n\nExample: "Trace VIN 1HGBH41JXMN109186 for John Smith"'
      }]);
      return;
    }

    setIsProcessing(true);
    setCurrentSteps([]);
    setTraceResult(null);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Initiating skip trace for:\n• VIN: ${traceInfo.vin}\n• Name: ${traceInfo.firstName} ${traceInfo.lastName}\n\nActivating AI agents...`
    }]);

    const agent = new SkipTraceAgent((steps) => {
      setCurrentSteps(steps);
    });

    try {
      const result = await agent.traceVehicle(
        traceInfo.vin,
        traceInfo.firstName,
        traceInfo.lastName
      );

      setTraceResult(result);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Skip trace completed successfully. Review the detailed report below.'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'An error occurred while processing the trace. Please try again.'
      }]);
      console.error('Trace error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Skip Trace AI Agent</h1>
              <p className="text-xs text-blue-100">Vehicle Repossession Intelligence System</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => (
            <ChatMessage key={idx} role={message.role} content={message.content} />
          ))}

          {currentSteps.length > 0 && <TraceSteps steps={currentSteps} />}

          {traceResult && <TraceResults result={traceResult} />}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter VIN and borrower name..."
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Trace'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Hackathon Demo • All data is simulated for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
