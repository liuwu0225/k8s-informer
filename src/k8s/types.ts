import * as k8s from "@kubernetes/client-node";

export interface KubernetesObject {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s.V1ObjectMeta;
}

export interface KubernetesListObject<T extends KubernetesObject> {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s.V1ListMeta;
  items: T[];
}

export interface Application {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s.V1ObjectMeta;
  spec?: ApplicationSpec;
}

export interface ApplicationSpec {
  components?: Component[];
  configuration?: object;
  database?: { from: BindFrom; value: string };
  env?: object[];
  gateway?: Gateway;
  imagePullSecrets?: string[];
  jobmanager?: { from: BindFrom; value: string };
  lockmanager?: { from: BindFrom; value: string };
  supportUsers?: string[];
  uaa?: { from: BindFrom; value: string };
  status?: Status;
}

export interface Component {
  name: string;
  type: ComponentType;
  database?: Binding;
  image: string;
  replicas?: number;

  env?: object[];
  resources?: object;
}

export interface Binding {
  from: BindFrom;
  value: string;
}

export interface Gateway {
  host: string;
  tlsSecretName?: string;
  timeout?: number;

  maintenanceMode?: MaintenanceMode;
}

export enum ComponentType {
  lockmanager = "lockmanager",
  jobmanager = "jobmanager",
  postgres = "postgres",
  redis = "redis",
}

export enum BindFrom {
  Secret = "secret",
  Component = "component",
  Service = "service",
}

export enum DatabaseType {
  HANA = "HANA",
  POSTGRES = "POSTGRES",
}

interface MaintenanceMode {
  enable: boolean;
  uri?: string;
}

export interface Status {
  activities?: Activity[];
  conditions?: Condition[];
  observedGeneration?: number;
  phase?: SyncPhase;
  reconciledGeneration?: number;
}

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime: Date;
}

export interface Activity {
  name: string;
  reconciledGeneration: number;
  phase: SyncPhase;
  resources: ResourceInfo[];
  message: string;
  error: {
    stack: string;
    message: string;
  };
}

export interface ResourceInfo {
  kind: string;
  name: string;
  info: any;
  ready: boolean;
  error: Error;
}

export enum SyncPhase {
  INIT = "Init",
  WAITING = "Waiting",
  IN_PROVISION = "Provisioning",
  UPDATING = "Updating",
  ACTIVE = "Active",
  ERROR = "Error",
  TERMINATING = "Terminating",
  TERMINATED = "Terminated",
}
