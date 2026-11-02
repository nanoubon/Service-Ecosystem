import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => { setMsg(m); window.setTimeout(() => setMsg(null), 2600); }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && <div role="status" className="fixed bottom-6 right-6 z-50 rounded-md border border-border bg-panel-2 px-4 py-3 text-text shadow-lg">{msg}</div>}
    </Ctx.Provider>
  );
}
