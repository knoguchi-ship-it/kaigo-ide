import { useEffect, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

let toastId = 0;
let addToastFn: ((item: Omit<ToastItem, 'id'>) => void) | null = null;

export function toast(type: 'success' | 'error', message: string) {
  addToastFn?.({ type, message });
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = ++toastId;
    setItems((prev) => [...prev, { ...item, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg px-4 py-3 text-white shadow-lg transition-all ${
            item.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
