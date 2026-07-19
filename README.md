# MediBook — SI Hospitalier sur Kubernetes

Application de gestion de rendez-vous médicaux déployée sur Kubernetes (Kind), avec résilience et persistance des données.

## Stack technique

| Composant | Technologie |
|---|---|
| Frontend | React 19 (Vite) + Nginx |
| Backend API | Python Flask + Gunicorn |
| Base de données | PostgreSQL 15 |
| Cluster | Kind (Kubernetes v1.32) |
| Ingress | Nginx Ingress Controller |

## Architecture

```
Navigateur → Ingress (medibook.local) → Frontend Nginx → API Flask → PostgreSQL → PVC
```

## Structure du projet

```
Projet_ISI_Sujet2_MediBook/
├── app/
│   ├── backend/          # API Flask
│   │   ├── app.py        # Routes API
│   │   ├── models.py     # Modèles SQLAlchemy
│   │   ├── seed.py       # Peuplement initial (6 médecins)
│   │   └── Dockerfile
│   └── frontend/         # Interface React
│       ├── src/
│       │   ├── components/   # DoctorCard, AppointmentForm, etc.
│       │   ├── pages/        # Home, MyAppointments
│       │   └── api.js        # Client Axios
│       └── Dockerfile
├── k8s/                  # Manifests Kubernetes
│   ├── 00-namespace.yaml
│   ├── 01-configmap.yaml
│   ├── 02-secret.yaml
│   ├── 03-pvc.yaml
│   ├── 04-statefulset-db.yaml
│   ├── 05-service-db.yaml
│   ├── 06-deployment-api.yaml
│   ├── 07-service-api.yaml
│   ├── 08-deployment-frontend.yaml
│   ├── 09-service-frontend.yaml
│   └── 10-ingress.yaml
├── docker-compose.yml
└── docs/                 # Documentation et schémas
```

## Prérequis

- Docker 24+
- Kind 0.27+
- kubectl 1.32+

## Déploiement local (Docker Compose)

```bash
docker compose up -d
```

Application accessible sur http://localhost

## Déploiement Kubernetes (Kind)

### 1. Créer le cluster

```bash
kind create cluster --name medibook --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 8080
    protocol: TCP
EOF
```

### 2. Installer l'Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller --timeout=180s
```

### 3. Build et charger les images

```bash
docker build -t medibook-api:latest ./app/backend
docker build -t medibook-frontend:latest ./app/frontend

# Alternative 1 : chargement direct
kind load docker-image medibook-api:latest --name medibook || true

# Alternative 2 (si la 1 échoue) : via archive .tar
docker save medibook-api:latest -o /tmp/medibook-api.tar
docker save medibook-frontend:latest -o /tmp/medibook-frontend.tar
kind load image-archive /tmp/medibook-api.tar --name medibook
kind load image-archive /tmp/medibook-frontend.tar --name medibook
```

### 4. Déployer l'application

```bash
kubectl apply -f k8s/
kubectl wait --namespace hospital --for=condition=ready pod --all --timeout=180s
```

### 5. Configurer l'accès

```bash
# Ajouter medibook.local dans /etc/hosts (une seule fois)
echo "127.0.0.1 medibook.local" | sudo tee -a /etc/hosts
```

### 6. Tester

```bash
# Option A : via port-forward (simple, pas de DNS requis)
kubectl port-forward -n hospital service/medibook-frontend 3000:80
# Ouvrir http://localhost:3000

# Option B : via Ingress (nécessite /etc/hosts + port 8080)
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
curl -H "Host: medibook.local" http://localhost:8080/api/doctors
# Ouvrir http://medibook.local:8080
```

## API REST

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/doctors?specialty=` | Liste des médecins (filtre optionnel) |
| `GET` | `/api/appointments` | Liste des rendez-vous |
| `POST` | `/api/appointments` | Créer un rendez-vous |
| `DELETE` | `/api/appointments/<id>` | Annuler un rendez-vous |

## Tests de résilience

| Test | Commande | Résultat |
|---|---|---|
| Scale up | `kubectl scale deployment -n hospital medibook-api --replicas=4` | Pods passent de 2 à 4 |
| Auto-guérison API | `kubectl delete pod -n hospital medibook-api-xxx` | Nouveau pod créé automatiquement |
| Persistance DB | `kubectl delete pod -n hospital medibook-db-0` | Données conservées après recréation |

## Modèle de données

```sql
doctors:    id | name | specialty | avatar_url
appointments: id | patient_name | doctor_id (FK) | date | time_slot | reason | status
```

## Vidéo de démonstration

[Lien vers la vidéo]

---

Projet réalisé dans le cadre de l'UE ISI — 2026
