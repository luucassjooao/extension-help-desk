import { useEffect, useState } from "react";
import "./App.css";
import useScheduler from "./useScheduler";
import { CallStackPausa, Root, TypeOfPause, TypePausa } from "./interfaces";

function App() {
  const typePausas: TypePausa[] = [
    { id: '1204', name: "Banheiro" },
    { id: '3161', name: "Backlog" },
    { id: '0', name: "Remover pausa" },
  ];

  const [callStack, setCallStack] = useState<CallStackPausa[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedPausaId, setSelectedPausaId] = useState<number | string>("");

  const [pausaDuration, setPausaDuration] = useState("");
  const [valueTypePause, setValueTypePause] = useState('');
  const [typePausePutAfterXAgent, setTypePausePutAfterXAgent] = useState<boolean>(false);
  const [typePause, setTypePause] = useState<TypeOfPause>(null);
  const [isNextPauseIsAfterAgent, setIsNextPauseIsAfterAgent] = useState<boolean>(false);

  const { scheduleTask } = useScheduler();

  function toggleAddPausa() {
    setIsAdding(!isAdding);
    if (isAdding) {
      resetForm();
    }
  }

  function resetForm() {
    setSelectedPausaId("");
    setTypePause(null);
    setTypePausePutAfterXAgent(false);
    setPausaDuration("");
  }

  function addToCallStack() {
    if (selectedPausaId === "") return;

    const selectedPausa = typePausas.find((pausa) => pausa.id === String(selectedPausaId));

    if (selectedPausa) {
      const newPausa: CallStackPausa = {
        id: selectedPausa.id,
        name: selectedPausa.name,
        type: String(typePause),
        value: valueTypePause,
        duration: pausaDuration ? Number(pausaDuration) : null,
      };

      setCallStack((prev) => [...prev, newPausa]);

      if (newPausa.type === 'time') {
        scheduleTask(newPausa.value as string, { idPause: newPausa.id, setState: setCallStack })
      }
      if (newPausa.type === 'putAfterXAgent') {
        if (callStack.length !== 0) {
          setIsNextPauseIsAfterAgent(true);
        }
      }

      resetForm();
      setIsAdding(false);
    }
  }

  function removePausa(index: number) {
    setCallStack((prev) => prev.filter((_, i) => i !== index));
  }

  function handlerChangeValue(value: string, type: TypeOfPause) {
    setValueTypePause(value);
    setTypePause(type);

    if (type === 'putAfterXAgent') {
      setTypePausePutAfterXAgent(true)
    }
  }

  useEffect(() => {
    if (callStack[0].type === 'putAfterXAgent') {
      setIsNextPauseIsAfterAgent(true);
    } else {
      setIsNextPauseIsAfterAgent(false);
    }
  }, [callStack])

  useEffect(() => {
    if (!isNextPauseIsAfterAgent) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://api-pabx.valenet.com.br:8443/v2/agents",
          {
            headers: {
              "Api-Key": "UVYXcquaKGHTyuMPpegBD63FUyFx1esK",
            },
          }
        );

        const data: Root[] = await res.json();
        const filteredData = data.filter(
          (item) =>
            item.departamento === "Suporte 1º Nível" && item.inCall === true
        );

        // const findAgent = filteredData.find((agent) => agent.name === )

        // const dataRecebida = new Date(ag.channel.meta.created);

        // const agora = new Date();

        // const diferencaMs = agora - dataRecebida;
        // const diferencaMinutos = Math.floor(diferencaMs / 1000 / 60);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isNextPauseIsAfterAgent]);

  // async function pausarBanheiro(id: string) {
  //   // setPauseId(id); // Isso é opcional agora, já que vamos passar o id diretamente
  //   chrome.tabs.query({ url: "https://helpdesk.valenet.local:8443/*" }, function (tabs) {
  //     tabs.forEach(tab => {
  //       // Executa a função applyPause em cada aba, passando o id como argumento
  //       chrome.scripting.executeScript({
  //         target: { tabId: tab.id as number },
  //         func: applyPause,
  //         args: [id] // Passa o id diretamente para a função
  //       });
  //     });
  //   });
  // }
  
  // // Função que será injetada, agora aceitando o id como parâmetro
  // function applyPause(pauseId: string) {
  //   function clickElement(selector: string): boolean {
  //     const element = document.querySelector(selector);
  //     if (element) {
  //       (element as HTMLElement).click();
  //       return true;
  //     }
  //     return false;
  //   }
  
  //   function selectOption(): boolean {
  //     const selectElement = document.querySelector('.bootbox-input-select');
  //     if (selectElement) {
  //       (selectElement as HTMLSelectElement).value = pauseId; // Usa o pauseId passado como argumento
  //       const event = new Event('change', { bubbles: true });
  //       selectElement.dispatchEvent(event);
  //       return true;
  //     }
  //     return false;
  //   }
  
  //   function confirmPause(): boolean {
  //     const confirmButton = document.querySelector('button[data-bb-handler="confirm"]');
  //     if (confirmButton) {
  //       (confirmButton as HTMLElement).click();
  //       return true;
  //     }
  //     return false;
  //   }
  
  //   // Lógica de pausa
  //   if (clickElement('a[href="#"][onclick*="TogglePausa"]')) {
  //     setTimeout(() => {
  //       if (selectOption()) {
  //         setTimeout(() => {
  //           confirmPause();
  //         }, 500);
  //       }
  //     }, 500);
  //   } else {
  //     console.error('Botão de pausa não encontrado!');
  //   }
  // }

  const showAdditionalInfo = selectedPausaId !== "" && selectedPausaId !== 0;
  const disabledButtonAddPause = typePause || valueTypePause

  return (
    <div className="pausa-manager">
      <h1 className="title">Monte suas pausas na CallStack</h1>

      <button
        className={`btn ${isAdding ? "btn-cancel" : "btn-add"}`}
        onClick={toggleAddPausa}
      >
        {!isAdding ? "Adicionar Pausa" : "Cancelar"}
      </button>

      {isAdding && (
        <div className="form-container">
          <div className="form-row">
            <select
              value={selectedPausaId}
              onChange={(e) => setSelectedPausaId(Number(e.target.value))}
              className="form-select"
            >
              <option value="" disabled>
                Tipo de Pausa
              </option>
              {typePausas.map((pausa) => (
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
                  value={typePause === 'time' ? valueTypePause : ''}
                  onChange={(e) => handlerChangeValue(e.target.value, 'time')}
                  placeholder="Horário"
                  title="Horário da pausa"
                />

                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={typePause === 'putAfterXTime' ? valueTypePause : ''}
                  onChange={(e) => handlerChangeValue(e.target.value, 'putAfterXTime')}
                  placeholder="Após min"
                  title="Após quantos minutos"
                />

                <input
                  type="text"
                  className="form-input"
                  value={typePause === 'putAfterXAgent' ? valueTypePause : ''}
                  onChange={(e) => handlerChangeValue(e.target.value, 'putAfterXAgent')}
                  placeholder="Agente"
                  title="Após qual agente"
                />

                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={pausaDuration}
                  onChange={(e) => setPausaDuration(e.target.value)}
                  placeholder="Duração min"
                  title="Duração da pausa em minutos"
                />
              </>
            )}


            {typePause && <small>
              A pausa irá ser adicionada quando
              {typePause === 'time' && `der ${valueTypePause}`}
              {typePause === 'putAfterXAgent' && `o ${valueTypePause}, tirar a pausa de ${typePausePutAfterXAgent}`}
              {typePause === 'putAfterXTime' && `der ${valueTypePause} minutos de chamado`}
              {' ,'}ou quando voce terminar a ligação
            </small>}

            <button
              className="btn btn-save"
              onClick={addToCallStack}
              disabled={!disabledButtonAddPause}
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
          <ul className="stack-list">
            {callStack.map((pausa, index) => (
              <li key={index} className="stack-item">
                <span className="pausa-name">{pausa.name}</span>
                <div className="pausa-details">
                  {pausa.type === 'time' && (
                    <span className="detail">Horário: {pausa.value}</span>
                  )}
                  {pausa.type === 'putAfterXTime' && (
                    <span className="detail">
                      Após: {pausa.value}min
                    </span>
                  )}
                  {pausa.type === 'putAfterXAgent' && (
                    <span className="detail">
                      Agente: {pausa.value}
                    </span>
                  )}
                  {pausa.duration! > 0 && (
                    <span className="detail">Duração: {pausa.duration}min</span>
                  )}
                  <button
                    className="btn-remove"
                    onClick={() => removePausa(index)}
                  >
                    ✕
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

export default App;
