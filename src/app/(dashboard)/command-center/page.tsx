'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { arcTestnet } from '@/config/chains';
import { CHAIN_DISPLAY_NAMES } from '@/config/chains';
import type { ChatMessage, ParseIntentResponse, ParsedIntent, IntentExecState } from '@/types/intents';
import IntentCard from '@/components/command-center/IntentCard';
import { useIntentExecution } from '@/hooks/useIntentExecution';
import { saveTransaction, buildTransactionRecord } from '@/lib/transaction-store';

const PROMPT_CHIPS = [
  'Swap 500 USDC to EURC',
  'Bridge USDC to Sepolia',
  'Check my balance',
  'Show my portfolio',
];

export default function CommandCenterPage() {
  const { address, isConnected } = useAccount();
  const { data: arcBalance } = useBalance({
    address,
    chainId: arcTestnet.id,
    query: { enabled: isConnected },
  });
  const { estimateIntent, executeIntent, isReady: adapterReady } = useIntentExecution();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [intentStates, setIntentStates] = useState<Record<string, IntentExecState>>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [mounted, setMounted] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, intentStates, scrollToBottom]);

  const runEstimation = useCallback(
    async (msgId: string, intent: ParsedIntent) => {
      if (intent.type === 'balance_check' || intent.type === 'recurring_payment') return;
      if (!adapterReady) return;

      setIntentStates((prev) => ({
        ...prev,
        [msgId]: { phase: 'estimating' },
      }));

      try {
        const estimation = await estimateIntent(intent);
        setIntentStates((prev) => ({
          ...prev,
          [msgId]: { phase: 'ready', estimation },
        }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Estimation failed';
        setIntentStates((prev) => ({
          ...prev,
          [msgId]: { phase: 'ready', estimation: undefined },
        }));
        console.error('Estimation error:', errorMsg);
      }
    },
    [adapterReady, estimateIntent],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setShowChips(false);
      setInput('');

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch('/api/ai/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        });

        let data: ParseIntentResponse & { error?: string };
        try {
          data = await res.json();
        } catch {
          data = { intent: null, message: 'Failed to parse AI response.', confidence: 0 };
        }

        if (!res.ok) {
          const aiMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.error || 'Something went wrong. Please try again.',
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          return;
        }

        const aiMsgId = crypto.randomUUID();
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'assistant',
          content: data.message,
          intent: data.intent,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (data.intent && data.intent.type !== 'balance_check' && data.intent.type !== 'recurring_payment') {
          runEstimation(aiMsgId, data.intent);
        }
      } catch {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Network error. Please check your connection and try again.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, runEstimation],
  );

  const handleApprove = useCallback(
    async (msgId: string, intent: ParsedIntent) => {
      if (intent.type === 'balance_check') {
        const balanceStr = arcBalance
          ? parseFloat(formatUnits(arcBalance.value, arcBalance.decimals)).toFixed(6)
          : '0.00';
        const chainLabel = intent.chainId
          ? CHAIN_DISPLAY_NAMES[intent.chainId] || 'Unknown'
          : 'Arc Testnet';

        const balanceMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Your balance on ${chainLabel}: ${balanceStr} USDC`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, balanceMsg]);

        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, intent: null } : m)));
        return;
      }

      if (intent.type === 'recurring_payment') {
        const infoMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Recurring payments will be available in a future update. The schedule has been noted.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, infoMsg]);
        return;
      }

      if (!adapterReady) return;

      setIntentStates((prev) => ({
        ...prev,
        [msgId]: { ...prev[msgId], phase: 'executing' },
      }));

      try {
        const result = await executeIntent(intent);

        if (result.error) {
          setIntentStates((prev) => ({
            ...prev,
            [msgId]: {
              ...prev[msgId],
              phase: 'error',
              execution: result,
            },
          }));
          saveTransaction(buildTransactionRecord(intent, result.txHash, result.explorerUrl, result.error));
        } else {
          setIntentStates((prev) => ({
            ...prev,
            [msgId]: {
              ...prev[msgId],
              phase: 'success',
              execution: result,
            },
          }));
          saveTransaction(buildTransactionRecord(intent, result.txHash, result.explorerUrl));

          if (result.txHash) {
            const successMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Transaction confirmed. Hash: ${result.txHash}`,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, successMsg]);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
        setIntentStates((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId],
            phase: 'error',
            execution: { error: errorMsg },
          },
        }));
      }
    },
    [adapterReady, arcBalance, executeIntent],
  );

  const handleDismiss = (msgId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, intent: null } : m)));
    setIntentStates((prev) => {
      const next = { ...prev };
      delete next[msgId];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full">
      {/* Thread area */}
      <div ref={threadRef} className="flex-1 overflow-y-auto px-4 pt-8 pb-4">
        {messages.length === 0 && (
          <div className="text-center pt-12 md:pt-24">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
              Command Center
            </h2>
            <p className="font-body-lg text-on-surface-variant">
              {mounted && isConnected
                ? 'Sedge AI is ready. How can I assist with your operations today?'
                : 'Connect your wallet to execute transactions. You can still explore commands.'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="flex gap-3 justify-end">
                  <div className="bg-surface-container-high rounded-2xl rounded-tr-sm px-5 py-3 text-on-surface font-body-md max-w-[80%]">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint/10 flex items-center justify-center shrink-0 mt-1 border border-primary-container/20">
                    <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                  </div>
                  <div className="flex-1 max-w-[90%]">
                    <p className="font-body-md text-on-surface mb-3">{msg.content}</p>
                    {msg.intent && (
                      <div className="mt-2">
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2 font-mono-data">
                          INTENT RECOGNIZED
                        </p>
                        <IntentCard
                          intent={msg.intent}
                          execState={intentStates[msg.id]}
                          walletConnected={isConnected}
                          onApprove={() => handleApprove(msg.id, msg.intent!)}
                          onCancel={() => handleDismiss(msg.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-tint/10 flex items-center justify-center shrink-0 mt-1 border border-primary-container/20">
                <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">auto_awesome</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-primary-container/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-body-sm text-on-surface-variant ml-2">Analyzing your request...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 pb-6 pt-2">
        {showChips && messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-2xl mx-auto">
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                disabled={isLoading}
                className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-body-sm hover:border-primary-container hover:text-primary transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-2 transition-all duration-200 focus-within:shadow-md focus-within:border-primary-container/30">
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-bright rounded-lg border border-outline-variant/50 focus-within:border-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none font-body-lg text-on-surface placeholder:text-on-surface-variant/50"
                placeholder="What would you like to do today?"
                type="text"
                maxLength={500}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-primary-container text-white p-2 rounded-md hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
