#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="hospital"
CLUSTER="medibook-cluster"

echo "=== 1. Création du cluster Kind ==="
kind delete cluster --name "$CLUSTER" 2>/dev/null || true
kind create cluster --name "$CLUSTER" --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
EOF

echo "=== 2. Installation de l'Ingress Controller ==="
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
sleep 5
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "=== 3. Build des images Docker ==="
docker compose build

echo "=== 4. Chargement des images dans Kind ==="
kind load docker-image medibook-api:latest --name "$CLUSTER"
kind load docker-image medibook-frontend:latest --name "$CLUSTER"

echo "=== 5. Déploiement des manifests ==="
kubectl apply -f k8s/

echo "=== 6. Attente des pods ==="
kubectl wait --namespace "$NAMESPACE" \
  --for=condition=ready pod \
  --selector=app=medibook-api \
  --timeout=120s
kubectl wait --namespace "$NAMESPACE" \
  --for=condition=ready pod \
  --selector=app=medibook-frontend \
  --timeout=120s

echo "=== 7. Ajout de l'entrée /etc/hosts ==="
if ! grep -q "hopital.local" /etc/hosts; then
  echo "127.0.0.1 hopital.local" | sudo tee -a /etc/hosts
  echo "✓ Entrée ajoutée à /etc/hosts"
else
  echo "→ Entrée déjà présente dans /etc/hosts"
fi

echo ""
echo "=== Déploiement terminé ! ==="
echo "Accède à http://hopital.local dans ton navigateur."
echo ""
echo "Commandes utiles :"
echo "  kubectl get all -n hospital"
echo "  kubectl logs -n hospital deployment/medibook-api"
echo "  kubectl exec -n hospital deploy/medibook-api -- python seed.py"
