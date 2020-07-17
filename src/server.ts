import controllers from "./controllers";
import _ from "lodash";
import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

_.each(controllers, (controller) => {
  new controller(kc).start();
});
