#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="hospital"
CLUSTER="medibook"

echo "=== 1. Création du cluster Kind ==="
kind delete cluster --name "$CLUSTER" 2>/dev/null || true
kind create cluster --name "$CLUSTER" --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 8080
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

echo "=== 4. Tag des images et chargement dans Kind ==="
# Docker Compose préfixe les images avec le nom du dossier projet
docker tag projet_isi_sujet2-medibook-api:latest medibook-api:latest
docker tag projet_isi_sujet2-medibook-frontend:latest medibook-frontend:latest
# Chargement via archive .tar (contourne le bug kind load docker-image)
docker save medibook-api:latest > /tmp/medibook-api.tar
docker save medibook-frontend:latest > /tmp/medibook-frontend.tar
kind load image-archive /tmp/medibook-api.tar --name "$CLUSTER"
kind load image-archive /tmp/medibook-frontend.tar --name "$CLUSTER"

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
if ! grep -q "medibook.local" /etc/hosts; then
  echo "127.0.0.1 medibook.local" | sudo tee -a /etc/hosts
  echo "✓ Entrée ajoutée à /etc/hosts"
else
  echo "→ Entrée déjà présente dans /etc/hosts"
fi

echo ""
echo "=== Déploiement terminé ! ==="
echo "Accède à http://medibook.local:8080 dans ton navigateur."
echo ""
echo "Pour tester l'API directement :"
echo "  kubectl port-forward -n hospital service/medibook-api 5001:5000"
echo "  curl http://localhost:5001/api/doctors"
echo ""
echo "Commandes utiles :"
echo "  kubectl get all -n hospital"
echo "  kubectl logs -n hospital deployment/medibook-api"
echo "  kubectl exec -n hospital deploy/medibook-api -- python seed.py"
