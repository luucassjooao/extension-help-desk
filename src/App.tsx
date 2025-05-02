import { useCallback, useEffect, useState } from "react";
import "./App.css";
import useScheduler from "./useScheduler";
import { CallStackPausa, TypeOfPause, TypePausa } from "./interfaces";
import { shouldDisableButton } from "./funcs";
import { handlerClickPause } from "./clickButton";

export function App() {
  const PAUSE_TYPES: TypePausa[] = [
    { id: "1204", name: "Banheiro" },
    { id: "3161", name: "Backlog" },
    { id: "1", name: "Remover Pausa" },
  ];

  const API_BASE_URL = "https://api-pabx.valenet.com.br:8443/v2";
  const API_KEY = "UVYXcquaKGHTyuMPpegBD63FUyFx1esK";

  // State management
  const [callStack, setCallStack] = useState<CallStackPausa[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState({
    selectedPausaId: "",
    pausaDuration: "",
    valueTypePause: "",
    typePausePutAfterXAgent: false,
    typePause: null as TypeOfPause,
    valuePauseTypePausePutAfterXAgent: "",
  });
  const [currentPausePutAfterXAgent, setCurrentPausePutAfterXAgent] =
    useState(false);

  const { scheduleTask } = useScheduler();

  // Form handlers
  const resetForm = useCallback(() => {
    setFormState({
      selectedPausaId: "",
      pausaDuration: "",
      valueTypePause: "",
      typePausePutAfterXAgent: false,
      typePause: null,
      valuePauseTypePausePutAfterXAgent: "",
    });
  }, []);

  const toggleAddPausa = useCallback(() => {
    setIsAdding((prev) => {
      const newState = !prev;
      if (prev) resetForm();
      return newState;
    });
  }, [resetForm]);

  const handleChangeValue = useCallback((value: string, type: TypeOfPause) => {
    setFormState((prev) => ({
      ...prev,
      valueTypePause: value,
      typePause: type,
      typePausePutAfterXAgent: type === "putAfterXAgent",
    }));
  }, []);

  // Core functionality
  const addToCallStack = useCallback(() => {
    const {
      selectedPausaId,
      pausaDuration,
      valueTypePause,
      typePause,
      valuePauseTypePausePutAfterXAgent,
    } = formState;

    if (!selectedPausaId) return;

    const selectedPausa = PAUSE_TYPES.find(
      (pausa) => pausa.id === selectedPausaId
    );

    if (selectedPausa) {
      const newPausa: CallStackPausa = {
        id: selectedPausa.id,
        name: selectedPausa.name,
        type: typePause,
        value: valueTypePause,
        duration: pausaDuration || null,
        typePausePutAfterXAgent: valuePauseTypePausePutAfterXAgent,
      };

      setCallStack((prev) => [...prev, newPausa]);

      if (newPausa.type === "time") {
        scheduleTask({
          targetTime: String(newPausa.value),
          idPause: newPausa.id,
          setState: setCallStack,
          duration: {
            isDuration: false,
            has: Boolean(pausaDuration),
            time: pausaDuration || null,
          },
        });
      }

      resetForm();
      setIsAdding(false);
    }
  }, [formState, resetForm, scheduleTask]);

  const removePausa = useCallback((index: number) => {
    setCallStack((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // API integration
  const fetchAgentStatus = useCallback(
    async (agentId: string): Promise<{ motivo_pausa?: string } | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
          headers: {
            "Api-Key": API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching agent data:", error);
        return null;
      }
    },
    []
  );

  // Effects
  useEffect(() => {
    const currentCallStack = callStack[0];
    if (!currentCallStack) return;

    let intervalId: NodeJS.Timeout | null = null;

    const handleTimeBasedTask = () => {
      scheduleTask({
        targetTime: String(currentCallStack.value),
        idPause: currentCallStack.id,
        setState: setCallStack,
        duration: {
          isDuration: false,
          has: Boolean(currentCallStack.duration),
          time: currentCallStack.duration,
        },
      });
    };

    const handleRemovePausa = () => {
      if (currentCallStack?.name === "Remover Pausa") {
        handlerClickPause("1");
      }
    };

    const monitorAgentStatus = () => {
      intervalId = setInterval(async () => {
        const data = await fetchAgentStatus(String(currentCallStack.value));
        if (!data) return;

        if (data.motivo_pausa === currentCallStack.typePausePutAfterXAgent) {
          setCurrentPausePutAfterXAgent(true);
          console.log("data true", data);
        } else if (
          data.motivo_pausa !== currentCallStack.typePausePutAfterXAgent &&
          currentPausePutAfterXAgent
        ) {
          console.log("current true");
          if (currentCallStack.duration) {
            scheduleTask({
              targetTime: currentCallStack.duration,
              idPause: currentCallStack.id,
              setState: setCallStack,
              duration: {
                has: false,
                isDuration: false,
                time: currentCallStack.duration,
              },
            });
          } else {
            handlerClickPause(currentCallStack.id);
          }
        }
      }, 1000);
    };

    // Determine which handler to use based on pause type
    if (currentCallStack.type === "time") {
      handleTimeBasedTask();
    } else if (currentCallStack.name === "Remover Pausa") {
      handleRemovePausa();
    } else if (currentCallStack.type === "putAfterXAgent") {
      monitorAgentStatus();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callStack, currentPausePutAfterXAgent, fetchAgentStatus, scheduleTask]);

  // Computed values
  const showAdditionalInfo = Boolean(formState.selectedPausaId);
  const currentTime = new Date().toTimeString().slice(0, 5);
  const disabledButtonAddPause =
    formState.typePause === "time"
      ? shouldDisableButton(formState.pausaDuration, formState.valueTypePause)
      : shouldDisableButton(formState.pausaDuration, currentTime);

  return (
    <div className="pausa-manager">
      <h1 className="title">Monte suas pausas na CallStack</h1>

      <button
        className={`btn ${isAdding ? "btn-cancel" : "btn-add"}`}
        onClick={toggleAddPausa}
        aria-label={
          isAdding ? "Cancelar adição de pausa" : "Adicionar nova pausa"
        }
      >
        {isAdding ? "Cancelar" : "Adicionar Pausa"}
      </button>

      {isAdding && (
        <div className="form-container">
          <div className="form-row">
            <select
              value={formState.selectedPausaId}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  selectedPausaId: e.target.value,
                }))
              }
              className="form-select"
              aria-label="Selecione o tipo de pausa"
            >
              <option value="" disabled>
                Tipo de Pausa
              </option>
              {PAUSE_TYPES.map((pausa) => (
                <option key={pausa.id} value={pausa.id}>
                  {pausa.name}
                </option>
              ))}
            </select>

            {showAdditionalInfo && (
              <>
                <input
                  type="time"
                  className="form-input"
                  value={
                    formState.typePause === "time"
                      ? formState.valueTypePause
                      : ""
                  }
                  onChange={(e) => handleChangeValue(e.target.value, "time")}
                  placeholder="Horário"
                  title="Horário da pausa"
                  aria-label="Horário da pausa"
                />

                <input
                  type="text"
                  className="form-input"
                  value={
                    formState.typePause === "putAfterXAgent"
                      ? formState.valueTypePause
                      : ""
                  }
                  onChange={(e) =>
                    handleChangeValue(e.target.value, "putAfterXAgent")
                  }
                  placeholder="Agente"
                  title="Após qual agente"
                  aria-label="ID do agente para monitorar"
                />

                {formState.typePause === "putAfterXAgent" && (
                  <input
                    type="text"
                    className="form-input"
                    value={formState.valuePauseTypePausePutAfterXAgent}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        valuePauseTypePausePutAfterXAgent: e.target.value,
                      }))
                    }
                    placeholder="Qual a pausa"
                    title="Tipo de pausa a monitorar"
                    aria-label="Tipo de pausa a monitorar"
                  />
                )}

                <hr className="vertical-hr" />
                <input
                  type="time"
                  className="form-input"
                  value={formState.pausaDuration}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      pausaDuration: e.target.value,
                    }))
                  }
                  placeholder="Duração"
                  title="Duração da pausa"
                  aria-label="Duração da pausa"
                />
              </>
            )}

            {formState.typePause && (
              <div className="form-help-text">
                <small>
                  A pausa irá ser adicionada quando
                  {formState.typePause === "time" &&
                    ` der ${formState.valueTypePause}`}
                  {formState.typePause === "putAfterXAgent" &&
                    ` o agente ${formState.valueTypePause} tirar a pausa de ${formState.valuePauseTypePausePutAfterXAgent}`}
                  , ou quando você terminar a ligação
                </small>
              </div>
            )}

            <button
              className="btn btn-save"
              onClick={addToCallStack}
              disabled={!disabledButtonAddPause}
              aria-label="Adicionar pausa à fila"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      <div className="call-stack">
        <h2>CallStack</h2>
        {callStack.length === 0 ? (
          <p className="empty-state">Nenhuma pausa configurada</p>
        ) : (
          <ul className="stack-list" aria-label="Lista de pausas configuradas">
            {callStack.map((pausa, index) => (
              <li key={`pause-${pausa.id}-${index}`} className="stack-item">
                <div className="pausa-header">
                  <span className="pausa-id">{pausa.id}</span>
                  <span className="pausa-name">{pausa.name}</span>
                </div>

                <div className="pausa-details">
                  {pausa.type === "time" && (
                    <span className="detail">
                      <span className="detail-label">Horário:</span>{" "}
                      {pausa.value}
                    </span>
                  )}

                  {pausa.type === "putAfterXAgent" && (
                    <span className="detail">
                      <span className="detail-label">Agente:</span>{" "}
                      {pausa.value}
                      {pausa.typePausePutAfterXAgent && (
                        <span className="sub-detail">
                          <span className="detail-label">Tipo de pausa:</span>{" "}
                          {pausa.typePausePutAfterXAgent}
                        </span>
                      )}
                    </span>
                  )}

                  {pausa.duration && (
                    <span className="detail">
                      <span className="detail-label">Duração:</span>{" "}
                      {pausa.duration}
                    </span>
                  )}

                  <button
                    className="btn-remove"
                    onClick={() => removePausa(index)}
                    aria-label={`Remover pausa ${pausa.name}`}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
