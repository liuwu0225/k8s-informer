import _ from "lodash";

interface KeyObject {
  group: string;
  version: string;
  namespace: string;
  plural: string;
  name: string;
}
export default class StringHelper {
  public static generateAppKey(obj: object): string {
    return `/apis/x4.sap.com/v1/${_.get(
      obj,
      "metadata.namespace"
    )}/x4apps/${_.get(obj, "metadata.name")}`;
  }

  public static parseAppKey(key: string): KeyObject {
    const splits = key.split("/");
    return {
      group: "x4.sap.com",
      version: "v1",
      namespace: splits[5],
      plural: "x4apps",
      name: splits[7],
    } as KeyObject;
  }
}
