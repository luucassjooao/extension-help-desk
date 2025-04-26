import { useState } from "react";
import "./App.css";

interface TypePausa {
  id: string;
  name: string;
}

interface CallStackPausa extends TypePausa {
  time: string | null;
  putAfterXTime: number | null;
  putAfterXAgent: string | null;
  duration: number | null;
}

export interface Root {
  agent: string;
  agentNumber: string;
  ramal: any;
  status: string;
  paused: boolean;
  lastCall: any;
  inCall: boolean;
  location: any;
  name: string;
  departamento: string;
  aPausaDescanso: any[];
  bloqueado_pausa: boolean;
  call: any;
  inicio_pausa: any;
  motivo_pausa: any;
  pausaDescanso: boolean;
  id_pausa: any;
  tempo_ocioso: any;
  horario_login: number;
  isReturning: number;
  host: any;
  channel: any;
  lastStateChange: number;
  queues: Queue[];
  meta: Meta;
  $loki: number;
  info_adicional: InfoAdicional;
}

export interface Queue {
  name: string;
  identifier: string;
  penalty: string;
}

export interface Meta {
  revision: number;
  created: number;
  version: number;
  updated: number;
}

export interface InfoAdicional {
  chamado: number;
  agente: string;
  tipo: string;
  codcidade: string;
  solicitacao: string;
}

function App() {
  const typePausas: TypePausa[] = [
    { id: '1204', name: "Banheiro" },
    { id: '3161', name: "Backlog" },
    { id: '0', name: "Remover pausa" },
  ];

  const [callStack, setCallStack] = useState<CallStackPausa[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedPausaId, setSelectedPausaId] = useState<number | string>("");
  const [pausaTime, setPausaTime] = useState("");
  const [pausaMinutes, setPausaMinutes] = useState("");
  const [pausaAgent, setPausaAgent] = useState("");
  const [pausaDuration, setPausaDuration] = useState("");

  function toggleAddPausa() {
    setIsAdding(!isAdding);
    if (isAdding) {
      resetForm();
    }
  }

  function resetForm() {
    setSelectedPausaId("");
    setPausaTime("");
    setPausaMinutes("");
    setPausaAgent("");
    setPausaDuration("");
  }

  function addToCallStack() {
    if (selectedPausaId === "") return;

    const selectedPausa = typePausas.find((pausa) => pausa.id === selectedPausaId);

    if (selectedPausa) {
      const newPausa: CallStackPausa = {
        id: selectedPausa.id,
        name: selectedPausa.name,
        time: pausaTime || null,
        putAfterXTime: pausaMinutes ? Number(pausaMinutes) : null,
        putAfterXAgent: pausaAgent || null,
        duration: pausaDuration ? Number(pausaDuration) : null,
      };

      setCallStack((prev) => [...prev, newPausa]);
      resetForm();
      setIsAdding(false);
    }
  }

  function removePausa(index: number) {
    setCallStack((prev) => prev.filter((_, i) => i !== index));
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch(
  //         "https://api-pabx.valenet.com.br:8443/v2/agents",
  //         {
  //           headers: {
  //             "Api-Key": "UVYXcquaKGHTyuMPpegBD63FUyFx1esK",
  //           },
  //         }
  //       );

  //       const data: Root[] = await res.json();
  //       const filteredData = data.filter(
  //         (item) =>
  //           item.departamento === "Suporte 1º Nível" && item.inCall === true
  //       );

  //       const filteredDataPausa = data.filter(
  //         (item) =>
  //           item.departamento === "Suporte 1º Nível" && item.paused === true
  //       );

  //       // const dataRecebida = new Date(ag.channel.meta.created);

  //       // const agora = new Date();

  //       // const diferencaMs = agora - dataRecebida;
  //       // const diferencaMinutos = Math.floor(diferencaMs / 1000 / 60);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();

  //   const intervalId = setInterval(fetchData, 1000);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);

  const showAdditionalInfo = selectedPausaId !== "" && selectedPausaId !== 0;

  async function pausarBanheiro(id: string) {
    // setPauseId(id); // Isso é opcional agora, já que vamos passar o id diretamente
    chrome.tabs.query({ url: "https://helpdesk.valenet.local:8443/*" }, function (tabs) {
      tabs.forEach(tab => {
        // Executa a função applyPause em cada aba, passando o id como argumento
        chrome.scripting.executeScript({
          target: { tabId: tab.id as number },
          func: applyPause,
          args: [id] // Passa o id diretamente para a função
        });
      });
    });
  }
  
  // Função que será injetada, agora aceitando o id como parâmetro
  function applyPause(pauseId: string) {
    function clickElement(selector: string): boolean {
      const element = document.querySelector(selector);
      if (element) {
        (element as HTMLElement).click();
        return true;
      }
      return false;
    }
  
    function selectOption(): boolean {
      const selectElement = document.querySelector('.bootbox-input-select');
      if (selectElement) {
        (selectElement as HTMLSelectElement).value = pauseId; // Usa o pauseId passado como argumento
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
        return true;
      }
      return false;
    }
  
    function confirmPause(): boolean {
      const confirmButton = document.querySelector('button[data-bb-handler="confirm"]');
      if (confirmButton) {
        (confirmButton as HTMLElement).click();
        return true;
      }
      return false;
    }
  
    // Lógica de pausa
    if (clickElement('a[href="#"][onclick*="TogglePausa"]')) {
      setTimeout(() => {
        if (selectOption()) {
          setTimeout(() => {
            confirmPause();
          }, 500);
        }
      }, 500);
    } else {
      console.error('Botão de pausa não encontrado!');
    }
  }

  return (
    <div className="pausa-manager">
      <h1 className="title">Monte suas pausas na CallStack</h1>

      {typePausas.map((item) => (
      <button type="button" onClick={() => pausarBanheiro(item.id)} key={item.id}>
        {item.name}
      </button>
    ))}

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
                  value={pausaTime}
                  onChange={(e) => setPausaTime(e.target.value)}
                  placeholder="Horário"
                  title="Horário da pausa"
                />

                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={pausaMinutes}
                  onChange={(e) => setPausaMinutes(e.target.value)}
                  placeholder="Após min"
                  title="Após quantos minutos"
                />

                <input
                  type="text"
                  className="form-input"
                  value={pausaAgent}
                  onChange={(e) => setPausaAgent(e.target.value)}
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

            <button
              className="btn btn-save"
              onClick={addToCallStack}
              disabled={selectedPausaId === ""}
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
                  {pausa.time && (
                    <span className="detail">Horário: {pausa.time}</span>
                  )}
                  {pausa.putAfterXTime && (
                    <span className="detail">
                      Após: {pausa.putAfterXTime}min
                    </span>
                  )}
                  {pausa.putAfterXAgent && (
                    <span className="detail">
                      Agente: {pausa.putAfterXAgent}
                    </span>
                  )}
                  {pausa.duration && (
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
