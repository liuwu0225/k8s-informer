import * as k8s from '@kubernetes/client-node';

import { ListWatch } from './cache';
import { KubernetesObject } from './types';

import http = require('http');

export type ObjectCallback<T extends KubernetesObject> = (obj: T) => void;
export type ListCallback<T extends KubernetesObject> = (list: T[], ResourceVersion: string) => void;
export type ListPromise<T extends KubernetesObject> = () => Promise<{
    response: http.IncomingMessage;
    body: object;
}>;

export const ADD: string = 'add';
export const UPDATE: string = 'update';
export const DELETE: string = 'delete';
export const ERROR: string = 'error';

export interface Informer<T> {
    on(verb: string, fn: ObjectCallback<T>);
    off(verb: string, fn: ObjectCallback<T>);
    start(): Promise<void>;
}

export function makeInformer<T>(
    kubeconfig: k8s.KubeConfig,
    path: string,
    listPromiseFn: ListPromise<T>,
): Informer<T> {
    const watch = new k8s.Watch(kubeconfig);
    return new ListWatch<T>(path, watch, listPromiseFn, false);
}
