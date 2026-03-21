import { useCallback, useState } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const toast = useCallback((message: string, duration = 2500) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), duration);
  }, []);

  return { toastMessage, toastVisible, toast, setToastVisible };
}
