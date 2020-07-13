
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/namespaces.yaml
## install istio 1.4.5
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/istio/v1.4.5/install.yaml -n istio-system
## install argo 2.7.2
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/argo/v2.7.2/install.yaml -n argo
## install metacontroller 0.4.0
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/metacontroller/v0.4.0/install.yaml -n metacontroller
## install rbac for argo workflow
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/argo/argo-workflow-rbac.yaml
