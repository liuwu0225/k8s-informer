import _ from "lodash";
export default class StringHelper {
  public static generateKey(obj: object): string {
    return `/apis/x4.sap.com/v1/${_.get("obj", "metadata.namespace")}/${_.get(
      "obj",
      "metadata.name"
    )}`;
  }
}
