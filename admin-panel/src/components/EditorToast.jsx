import { useEffect } from "react";

function EditorToast({ message, tone = "success", onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onDone?.(), 4200);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className={`we-toast we-toast--${tone}`} role="status">
      {message}
    </div>
  );
}

export default EditorToast;
