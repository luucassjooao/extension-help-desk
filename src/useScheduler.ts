import { Dispatch, useEffect, useRef } from "react";
import { CallStackPausa } from "./interfaces";

interface IPropsExecuteTask {
  idPause: string;
  setState: Dispatch<React.SetStateAction<CallStackPausa[]>>;
  duration: {
    isDuration: boolean;
    has: boolean;
    time: string | null;
  };
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

  function scheduleTask(
    targetTime: string,
    { idPause, setState, duration }: IPropsExecuteTask
  ): void {
    if (!targetTime) {
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    const delay = calculateDelay(targetTime);

    timerRef.current = window.setTimeout(() => {
      executeTask({ idPause, setState, duration });
    }, delay);
  }

  function executeTask({
    idPause,
    setState,
    duration,
  }: IPropsExecuteTask): void {
    if (duration.isDuration) {
      setState((prev) => prev.filter((item) => item.id !== idPause));
      return;
    }

    try {
      // chamar a api para pausa

      if (duration.has) {
        scheduleTask(duration.time!, {
          idPause,
          setState,
          duration: { isDuration: true, has: false, time: "" },
        });
      }
    } catch (error) {
      console.error(error);
    }
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
  };
}

export default useScheduler;
