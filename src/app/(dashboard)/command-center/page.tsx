'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits, erc20Abi } from 'viem';
import { arcTestnet, TOKEN_ADDRESSES } from '@/config/chains';
import { CHAIN_DISPLAY_NAMES } from '@/config/chains';
import type { ChatMessage, ParseIntentResponse, ParsedIntent, IntentExecState } from '@/types/intents';
import IntentCard from '@/components/command-center/IntentCard';
import { useIntentExecution } from '@/hooks/useIntentExecution';
import { saveTransaction, buildTransactionRecord } from '@/lib/transaction-store';
import { useSettings, getCurrencySymbol } from '@/providers/SettingsProvider';

const PROMPT_CHIPS = [
  'Swap 2 USDC to EURC',
  'Bridge 2 USDC to Sepolia',
  'Check my balance',
  'Show my portfolio',
];

export default function CommandCenterPage() {
  const { address, isConnected } = useAccount();
  const { data: usdcBalanceRaw } = useReadContract({
    address: TOKEN_ADDRESSES[arcTestnet.id].USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });
  const { data: eurcBalanceRaw } = useReadContract({
    address: TOKEN_ADDRESSES[arcTestnet.id].EURC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });
  const { estimateIntent, executeIntent, isReady: adapterReady } = useIntentExecution();
  const { currency } = useSettings();
  const currencySymbol = getCurrencySymbol(currency);

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
      if (intent.type === 'balance_check') return;
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

      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      try {
        const res = await fetch('/api/ai/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history }),
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
        
        if (data.intent?.type === 'balance_check') {
          const balanceStr = usdcBalanceRaw !== undefined
            ? parseFloat(formatUnits(usdcBalanceRaw, 6)).toFixed(2)
            : '0.00';
          const eurcStr = eurcBalanceRaw !== undefined
            ? parseFloat(formatUnits(eurcBalanceRaw, 6)).toFixed(2)
            : '0.00';

          const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: 'assistant',
            content: data.message || `Here are your available token balances on Arc Testnet:`,
            intent: null,
            balances: [
              { token: 'USDC', amount: balanceStr, color: '#38BDF8' },
              { token: 'EURC', amount: eurcStr, color: '#818CF8' }
            ],
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: 'assistant',
            content: data.message,
            intent: data.intent,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiMsg]);

          if (data.intent && data.intent.type !== 'recurring_payment') {
            runEstimation(aiMsgId, data.intent);
          }
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
          
          // Send error notification
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Transaction Failed',
              message: result.error || `Failed to execute ${intent.type} transaction.`,
              type: 'error'
            })
          }).catch(console.error);
        } else {
          setIntentStates((prev) => ({
            ...prev,
            [msgId]: {
              ...prev[msgId],
              phase: 'success',
              execution: result,
            },
          }));
          
          setMessages((prev) => prev.map(m => 
            m.id === msgId 
              ? { ...m, content: '[Success] Transaction completed successfully.' }
              : m
          ));

          saveTransaction(buildTransactionRecord(intent, result.txHash, result.explorerUrl));
          
          // Send push notification
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: intent.type === 'recurring_payment' ? 'Schedule Created' : 'Transaction Successful',
              message: intent.type === 'recurring_payment' 
                ? `Recurring payment to ${intent.recipientAddress.substring(0, 6)}... created successfully.`
                : `Successfully executed ${intent.type} transaction.`,
              type: 'success'
            })
          }).catch(console.error);
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
        
        // Send error notification for exceptions
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Transaction Error',
            message: errorMsg,
            type: 'error'
          })
        }).catch(console.error);
      }
    },
    [adapterReady, usdcBalanceRaw, executeIntent],
  );

  const handleDismiss = (msgId: string) => {
    setIntentStates((prev) => {
      const next = { ...prev };
      const phase = next[msgId]?.phase;
      
      setMessages((msgPrev) => msgPrev.map((m) => {
        if (m.id === msgId) {
          // If the card was in success phase, keep the success content we already set.
          // Otherwise, the user cancelled it, so update the text.
          const isSuccess = phase === 'success';
          return { 
            ...m, 
            intent: null,
            content: isSuccess ? m.content : '[Cancelled] Transaction cancelled by user.'
          };
        }
        return m;
      }));

      delete next[msgId];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full relative">
      {/* Background Logo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-15 dark:opacity-20">
        <img src="/icons/sedge-logo.png" alt="" className="w-96 h-96 object-contain grayscale" />
      </div>

      {/* Thread area */}
      <div ref={threadRef} className="flex-1 overflow-y-auto px-4 pt-8 pb-4 relative z-10">
        {messages.length === 0 && (
          <div className="text-center pt-12 md:pt-24">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface dark:text-gray-100 mb-2">
              Command Center
            </h2>
            <p className="font-body-lg text-on-surface-variant dark:text-gray-400">
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
                  <div className="bg-surface-container-high dark:bg-[#2A2A2A] rounded-2xl rounded-br-sm px-4 py-3 md:px-5 text-on-surface dark:text-gray-100 font-body-md max-w-[90%] md:max-w-[80%]">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-tint/10 flex items-center justify-center shrink-0 mt-auto border border-primary-container/20">
                    <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
                  </div>
                  <div className="flex-1 max-w-full md:max-w-[90%] overflow-hidden">
                    {!msg.intent && msg.content && (
                      <p className="font-body-md text-on-surface dark:text-gray-200 mb-3 whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                    {msg.balances && (
                      <div className="bg-white dark:bg-[#1E1E1E] border border-outline-variant dark:border-[#333] p-4 rounded-[16px] shadow-sm w-full max-w-sm mt-1 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-outline text-[18px]">account_balance_wallet</span>
                          <span className="font-label-caps text-label-caps text-on-surface-variant dark:text-gray-400 uppercase tracking-wider">Wallet Balances</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {msg.balances.map((b) => (
                            <div key={b.token} className="flex justify-between items-center p-3 bg-surface-container-lowest dark:bg-[#2A2A2A] border border-outline-variant/50 dark:border-[#444] rounded-[12px]">
                              <div className="flex items-center gap-3">
                                {b.token === 'USDC' ? (
                                  <img src="/icons/usdc.png" alt="USDC" className="w-8 h-8 rounded-full" />
                                ) : b.token === 'EURC' ? (
                                  <img src="/icons/eurc.png" alt="EURC" className="w-8 h-8 rounded-full" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-label-caps text-[12px]" style={{ backgroundColor: b.color }}>
                                    {b.token.substring(0, 3)}
                                  </div>
                                )}
                                <span className="font-body-md font-medium text-on-surface dark:text-gray-100">{b.token}</span>
                              </div>
                              <span className="font-mono-data text-on-surface font-medium">{currencySymbol}{b.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.intent && (
                      <div className="mt-2">
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
              <div className="w-10 h-10 rounded-full bg-surface-tint/10 flex items-center justify-center shrink-0 mt-auto border border-primary-container/20">
                <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">smart_toy</span>
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
      <div className="px-4 pb-6 pt-2 relative z-10">
        {showChips && messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-2xl mx-auto">
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setInput(chip);
                  inputRef.current?.focus();
                }}
                disabled={isLoading}
                className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-body-sm hover:border-primary-container hover:text-primary transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full">
          <div className="bg-surface-container-lowest rounded-full border border-outline-variant p-1 md:p-2 transition-all duration-200 focus-within:shadow-md focus-within:border-primary-container/30">
            <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1 md:py-2 bg-surface-bright rounded-full border border-outline-variant/50 focus-within:border-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary hidden sm:block">smart_toy</span>
              
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 focus:outline-none font-body-md md:font-body-lg text-on-surface placeholder:text-on-surface-variant/50 px-2"
                placeholder="What would you like to do today?"
                type="text"
                maxLength={500}
                autoComplete="off"
              />
              
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
