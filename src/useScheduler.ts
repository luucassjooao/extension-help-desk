import { Dispatch, useEffect, useRef } from "react";
import { CallStackPausa } from "./interfaces";
import { calculateDelay } from "./funcs";

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
    }, delay as number);
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
