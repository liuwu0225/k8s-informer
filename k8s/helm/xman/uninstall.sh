for each in $(kubectl get crds -o=jsonpath="{range .items[*]}{.metadata.name}{'\n'}" |grep x4.sap.com);
do
  kubectl delete crd $each
done
for each in $(kubectl get DecoratorController -o=jsonpath="{range .items[*]}{.metadata.name}{'\n'}");
do
  kubectl delete DecoratorController $each
done
kubectl delete clusterrolebinding xman-operator
kubectl delete ns xman-system
