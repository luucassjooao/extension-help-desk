export interface TypePausa {
  id: string;
  name: string;
}

export interface CallStackPausa extends TypePausa {
  type: string;
  value: string | number | null;
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

export type TypeOfPause = "time" | "putAfterXAgent" | null;
