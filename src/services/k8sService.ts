import * as k8s from "@kubernetes/client-node";
import _ from "lodash";

export default class KubernetesService {
  private k8sCustomObjectClient: k8s.CustomObjectsApi;
  private k8sAppsV1Client: k8s.AppsV1Api;
  public constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sCustomObjectClient = kc.makeApiClient(k8s.CustomObjectsApi);
    this.k8sAppsV1Client = kc.makeApiClient(k8s.AppsV1Api);
  }

  public async readNamespacedCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string
  ) {
    try {
      const result = await this.k8sCustomObjectClient.getNamespacedCustomObject(
        group,
        version,
        namespace,
        plural,
        name
      );
      return _.get(result, "body");
    } catch (ex) {
      //   console.log(ex);
      throw ex;
    }
  }

  public async applyDeployment(
    namespace: string,
    body: k8s.V1Deployment
  ): Promise<void> {
    try {
      if (await this.deploymentExists(body.metadata.name, namespace)) return;
      await this.k8sAppsV1Client.createNamespacedDeployment(namespace, body);
      console.log(
        `>>>>>> Deployment ${body.metadata.name} in namespace ${namespace} created`
      );
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  }

  public async deploymentExists(
    name: string,
    namespace: string
  ): Promise<boolean> {
    try {
      const deployment = await this.k8sAppsV1Client.readNamespacedDeployment(
        name,
        namespace
      );
      return deployment ? true : false;
    } catch (ex) {
      return false;
    }
  }
}
