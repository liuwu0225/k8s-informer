import informers from "./informers";
import _ from "lodash";
import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

_.each(informers, (informer) => {
  new informer(kc).start();
});
