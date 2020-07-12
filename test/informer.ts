import * as k8s from '@kubernetes/client-node';
import { makeInformer } from "../src/k8s/informer" 
import _ from "lodash";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sCustomObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);

const listFn1 = () => k8sCustomObjectsApi.listClusterCustomObject("x4.sap.com", "v1", "x4apps");
const listFn = () => k8sApi.listNamespacedPod('default');

const informer = makeInformer(kc, '/apis/x4.sap.com/v1/namespaces/x4-bc-local/x4apps', listFn1);

informer.on('add', (obj) => { console.log(`Added: ${_.get(obj, "metadata.name", "")}`); });
informer.on('update', (obj) => { console.log(`Updated: ${ _.get(obj, "metadata.name", "")}`); });
informer.on('delete', (obj) => { console.log(`Deleted: ${ _.get(obj, "metadata.name", "")}`); });
informer.on('error', (err) => {
  console.error(err);
  // Restart informer after 5sec
  setTimeout(() => {
    informer.start();
  }, 5000);
});

console.log("Start Informer......")
informer.start();

// import * as k8s from '@kubernetes/client-node';

// const kc = new k8s.KubeConfig();
// kc.loadFromDefault();

// const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// const listFn = () => k8sApi.listNamespacedPod('default');

// const informer = k8s.makeInformer(kc, '/api/v1/namespaces/default/pods', listFn);

// informer.on('add', (obj: k8s.V1Pod) => { console.log(`Added: ${obj.metadata!.name}`); });
// informer.on('update', (obj: k8s.V1Pod) => { console.log(`Updated: ${obj.metadata!.name}`); });
// informer.on('delete', (obj: k8s.V1Pod) => { console.log(`Deleted: ${obj.metadata!.name}`); });
// informer.on('error', (err: k8s.V1Pod) => {
//   console.error(err);
//   // Restart informer after 5sec
//   setTimeout(() => {
//     informer.start();
//   }, 5000);
// });

// informer.start();