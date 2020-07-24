import JobManager from "./jobManager";
import { Component } from "../../k8s/types";

export interface IChildFactory {}

export default class ChildFactory implements IChildFactory {
  public getChild(name: string, namespace: string, data: Component) {
    switch (name) {
      case "jobmanager":
        return new JobManager(namespace, data);
    }
  }
}
