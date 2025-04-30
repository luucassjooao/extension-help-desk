import { Dispatch, useEffect, useRef } from "react";
import { CallStackPausa } from "./interfaces";

interface IPropsExecuteTask {
  idPause: string;
  setState: Dispatch<React.SetStateAction<CallStackPausa[]>>;
}

function useScheduler() {
  const timerRef = useRef<number | null>(null);

  const calculateDelay = (timeString: string): number => {
    const now = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);

    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    return targetDate.getTime() - now.getTime();
  };

  function scheduleTask(targetTime: string, { idPause, setState }: IPropsExecuteTask): void {
    if (!targetTime) {
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    const delay = calculateDelay(targetTime);

    timerRef.current = window.setTimeout(() => {
      executeTask({idPause, setState});
    }, delay);
  }

  function executeTask({ idPause, setState }: IPropsExecuteTask): void {
    // chamar a api para pausa
    
    setState((prev) => prev.filter((item) => item.id !== idPause))
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    scheduleTask,
  }
};

export default useScheduler;
