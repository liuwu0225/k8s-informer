kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/metrics-apiservice.yaml
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/aggregated-metrics-reader.yaml
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/metrics-server-deployment.yaml
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/auth-delegator.yaml
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/metrics-server-service.yaml
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/auth-reader.yaml
kubectl apply -f https://github.wdf.sap.corp/raw/BIG/xman/dev/k8s/preparation/resources/kubernetes-metrics-server/resource-reader.yaml