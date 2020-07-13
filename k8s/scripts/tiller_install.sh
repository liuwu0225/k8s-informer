kubectl -n kube-system create sa tiller-admin
kubectl -n kube-system create rolebinding tiller-admin \
    --serviceaccount kube-system:tiller-admin \
    --clusterrole cluster-admin
helm init --service-account tiller-admin

kubectl -n xman-system create sa operator
kubectl -n xman-system create rolebinding operator-admin \
    --serviceaccount kube-system:operator \
    --clusterrole cluster-admin

kubectl -n x4-job-system create sa x4-job-operator
kubectl -n x4-job-system create rolebinding x4-job-operator-admin \
    --serviceaccount x4-job-system:x4-job-operator \
    --clusterrole cluster-admin

kubectl create -n sme-express secret generic sme-express-secret \
--from-file=key=/Users/i070219/git/x4/x4_onboarding/xman.bitsads.com_privkey.key \
--from-file=cert=/Users/i070219/git/x4/x4_onboarding/xman.bitsads.com_fullchain.pem