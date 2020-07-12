import * as k8s from '@kubernetes/client-node';

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
