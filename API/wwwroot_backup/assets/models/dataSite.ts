// cluster.interface.ts
export interface Cluster {
  index: number;
  clusterName: string;
  name: string;
  remarks: string;
  id: number;
}

// bts-type.interface.ts
export interface BTSType {
  btsName: string;
  telecomSupport: number[];
  eom: string;
  eos: string;
  lodsp: string;
  vendor: number;
  id: number;
}

// antenna-type.interface.ts
export interface AntennaType {
  name: string;
  description: string;
  antennaTypeImage: string | null;
  id: number;
}

// frequency-band.interface.ts
export interface FrequencyBand {
  name: string;
  telecomSupport: number[];
  alias: string;
  id: number;
}


export interface NetworkElements {
  id: number;
  name: string;
  telecomType: number;
  eom: string;
  eos: string;
  lodsp: string | null;
  vendor: number;
}
