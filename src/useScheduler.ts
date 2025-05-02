import { Dispatch, useEffect, useRef } from "react";
import { CallStackPausa } from "./interfaces";
import { calculateDelay } from "./funcs";
import { handlerClickPause } from "./clickButton";

interface IPropsExecuteTask {
  idPause: string;
  targetTime: string;
  setState: Dispatch<React.SetStateAction<CallStackPausa[]>>;
  duration: {
    isDuration: boolean;
    has: boolean;
    time: string | null;
  };
}

function useScheduler() {
  const timerRef = useRef<number | null>(null);

  function scheduleTask({
    idPause,
    setState,
    duration,
    targetTime,
  }: IPropsExecuteTask): void {
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
  }: Omit<IPropsExecuteTask, "targetTime">): void {
    if (duration.isDuration) {
      setState((prev) => prev.filter((item) => item.id !== idPause));
      return;
    }

    try {
      // chamar API para pausa
      handlerClickPause(idPause);

      if (duration.has) {
        scheduleTask({
          targetTime: duration.time!,
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
