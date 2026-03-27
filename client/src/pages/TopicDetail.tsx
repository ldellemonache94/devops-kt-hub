import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, MessageSquare, FileCode, Github, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/* ── helpers ── */
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-md overflow-hidden border border-border my-3">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{lang}</span>
      </div>
      <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed whitespace-pre">
        {code.trim()}
      </pre>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-primary/60 tabular-nums">{num}</span>
        <h3 className="text-sm font-semibold font-mono">{title}</h3>
      </div>
      <div className="pl-6 space-y-2 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function ExerciseCard({ title, difficulty, time, path, url, desc }: {
  title: string; difficulty: string; time: string; path: string; url: string; desc: string;
}) {
  const diffColor = difficulty.includes("⭐⭐⭐") ? "text-red-400" : difficulty.includes("⭐⭐") ? "text-amber-400" : "text-green-400";
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Card className="group cursor-pointer border border-border hover:border-primary/30 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-semibold font-mono group-hover:text-primary transition-colors flex-1">{title}</h4>
            <ExternalLink size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground">{desc}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-mono ${diffColor}`}>{difficulty}</span>
            <span className="text-[10px] text-muted-foreground font-mono">⏱ {time}</span>
            <code className="text-[9px] text-muted-foreground/60 font-mono truncate">{path}</code>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

/* ══════════════════════════════════════════════
   CONTENT MAP — dati reali dal repo studio-consip
   ══════════════════════════════════════════════ */
const TOPICS: Record<string, { title: string; subtitle: string; repoPath: string; sections: React.ReactNode; exercises: React.ReactNode }> = {

  /* ── GIT ── */
  git: {
    title: "Git & Version Control",
    subtitle: "Comandi base, branching, merge conflicts, PAT, workflow Accenture",
    repoPath: "exercises/",
    sections: (
      <div className="space-y-8">
        <Section num="01" title="Setup iniziale e clone con PAT">
          <p>Il repo usa HTTPS con Personal Access Token (non la password normale).</p>
          <CodeBlock lang="bash" code={`# 1. Genera PAT su GitHub → Settings → Developer settings → Tokens (classic)
# Scope necessario: repo (full access)

# Clone con HTTPS + PAT
git clone https://github.com/ldellemonache94/studio-consip.git
# Username: il tuo username GitHub
# Password: incolla il PAT

# Salva credenziali per non reinserirle ogni volta
git config --global credential.helper store

# Rendi eseguibile lo script di init e lancialo
chmod +x inizio.sh
./inizio.sh`} />
        </Section>

        <Section num="02" title="Branch workflow — feature branch">
          <p>Sempre lavorare su un branch feature dedicato, mai direttamente su master.</p>
          <CodeBlock lang="bash" code={`# Parti sempre da master aggiornato
git checkout master
git pull origin master

# Crea e passa al branch feature
git checkout -b feature/<tuo-nome>-<descrizione>

# Lavora, poi commit e push
git add .
git commit -m "feat: descrizione modifiche"
git push -u origin feature/<tuo-nome>-<descrizione>

# Dopo il primo push, basta:
git push`} />
        </Section>

        <Section num="03" title="WEB_LOGIC — esercizio properties">
          <p>Workflow completo su file .properties: clone → branch → modifica → merge su master.</p>
          <CodeBlock lang="bash" code={`git checkout master
git pull origin master
git checkout -b feature/<tuo_nome>-properties

# Modifica WEB_LOGIC/properties/generic.properties
# Aggiungi la tua riga nel file

git status
git add generic.properties
git commit -m "Aggiunto nuovo obiettivo nel file properties"
git push origin feature/<tuo_nome>-properties

# Merge su master
git checkout master
git pull origin master
git merge feature/<tuo_nome>-properties
git push origin master`} />
        </Section>

        <Section num="04" title="Risoluzione conflitti di merge">
          <p>Esercizio 05 del repo: simulare e risolvere un merge conflict reale.</p>
          <CodeBlock lang="bash" code={`# Branch A — prima modifica
git checkout master && git pull
git checkout -b feature/<nome>-merge-conflict
# Edita file.txt con "Versione iniziale"
git add file.txt && git commit -m "Modifica iniziale per esercizio conflitti"

# Branch B — modifica alternativa (genera il conflitto)
git checkout master
git checkout -b feature/<nome>-conflict-alt
# Edita file.txt con "Versione alternativa"
git add file.txt && git commit -m "Modifica alternativa per generare conflitto"

# Torna al branch A e fai il merge → CONFLICT!
git checkout feature/<nome>-merge-conflict
git merge feature/<nome>-conflict-alt
# CONFLICT: edita file.txt, rimuovi i marker <<<<<<< ======= >>>>>>>

# Risolvi il conflitto e committa
git add file.txt
git commit -m "Risolto conflitto di merge su file.txt"
git push origin feature/<nome>-merge-conflict`} />
          <p className="text-xs">Video utili nel repo: <code>exercises/git-merge-conflicts-link/link.txt</code></p>
        </Section>

        <Section num="05" title="Comandi Git essenziali — cheat sheet">
          <CodeBlock lang="bash" code={`# Status e log
git status
git log --oneline --graph --all

# Diff e stash
git diff HEAD
git stash
git stash pop

# Rebase (più pulito del merge per aggiornare il branch)
git fetch origin
git rebase origin/master

# Annulla ultimo commit (mantenendo le modifiche)
git reset --soft HEAD~1

# Annulla modifiche non committate
git restore <file>
git restore .

# Alias utili
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch`} />
        </Section>
      </div>
    ),
    exercises: (
      <div className="space-y-3">
        <ExerciseCard
          title="Esercizio 05 — Merge Conflicts"
          difficulty="⭐⭐ Base-intermedio"
          time="15 min"
          path="exercises/git-merge-conflicts/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/git-merge-conflicts"
          desc="Crea due branch in conflitto su file.txt e impara a risolverli con i marker Git."
        />
        <ExerciseCard
          title="Esercizio git-merge-conflicts-02"
          difficulty="⭐⭐ Intermedio"
          time="20 min"
          path="exercises/git-merge-conflicts-02/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/git-merge-conflicts-02"
          desc="Versione avanzata dell'esercizio conflitti con step-by-step guidato."
        />
        <ExerciseCard
          title="WEB_LOGIC — Properties workflow"
          difficulty="⭐ Base"
          time="10 min"
          path="WEB_LOGIC/properties/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/WEB_LOGIC/properties"
          desc="Workflow completo Git su file .properties: branch, modifica, merge su master."
        />
        <ExerciseCard
          title="Esercizio 03 — k8s-configmap"
          difficulty="⭐⭐ Base-intermedio"
          time="15 min"
          path="exercises/k8s-configmap/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/k8s-configmap"
          desc="Crea un branch feature, scrivi un ConfigMap Kubernetes e committa sul repo."
        />
        <ExerciseCard
          title="Esercizio 06 — k8s-deployment-service"
          difficulty="⭐⭐ Intermedio"
          time="20 min"
          path="exercises/k8s-deployment-service/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/k8s-deployment-service"
          desc="Crea Deployment (nginx, 2 repliche) + Service ClusterIP e committa sul repo."
        />
      </div>
    ),
  },

  /* ── KUBERNETES ── */
  kubernetes: {
    title: "Kubernetes & CKAD",
    subtitle: "8 esercizi pratici dal repo: Deploy, CronJob, NetworkPolicy, RBAC",
    repoPath: "CKAD/esercizi_ckad/",
    sections: (
      <div className="space-y-8">
        <Section num="01" title="Certificazione CKAD — Domini e Pesi">
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 pr-4 font-mono text-primary">Dominio</th>
                  <th className="text-left py-1 pr-4 font-mono text-primary">Peso</th>
                  <th className="text-left py-1 font-mono text-primary">Topic</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/40"><td className="py-1.5 pr-4">Environment, Config & Security</td><td className="pr-4 text-amber-400 font-bold">25%</td><td>ConfigMap, Secret, SA, SecurityContext, RBAC</td></tr>
                <tr className="border-b border-border/40"><td className="py-1.5 pr-4">Application Design and Build</td><td className="pr-4 text-blue-400 font-bold">20%</td><td>Container, Deployment, DaemonSet, CronJob, Job, PVC</td></tr>
                <tr className="border-b border-border/40"><td className="py-1.5 pr-4">Application Deployment</td><td className="pr-4 text-blue-400 font-bold">20%</td><td>Rolling update, Blue/Green, Canary, Helm, Kustomize</td></tr>
                <tr className="border-b border-border/40"><td className="py-1.5 pr-4">Services and Networking</td><td className="pr-4 text-blue-400 font-bold">20%</td><td>Service, Ingress, NetworkPolicy</td></tr>
                <tr><td className="py-1.5 pr-4">Observability and Maintenance</td><td className="pr-4 text-green-400 font-bold">15%</td><td>Probes, Logs, kubectl debug, API deprecations</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section num="02" title="Alias e setup consigliati (esame CKAD)">
          <p>Da eseguire subito all'inizio dell'esame per risparmiare tempo.</p>
          <CodeBlock lang="bash" code={`# Alias kubectl → k
alias k=kubectl

# Autocompletamento
source <(kubectl completion bash)
complete -F __start_kubectl k

# Dry-run rapido (genera YAML senza creare la risorsa)
export do="--dry-run=client -o yaml"
export now="--force --grace-period 0"

# Uso:
k run nginx --image=nginx $do > pod.yaml   # Genera YAML
k delete pod nginx $now                    # Cancella subito`} />
        </Section>

        <Section num="03" title="Esercizio 1 — Deploy WebApp con ConfigMap, Secret e Probes">
          <p>Deploy di webapp (3 repliche nginx:1.25-alpine) con ConfigMap, Secret Opaque, liveness e readiness probe.</p>
          <CodeBlock lang="yaml" code={`# webapp-deployment.yaml (da exercises/k8s-deployment-service)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        env:
        - name: MESSAGE
          valueFrom:
            configMapKeyRef:
              name: webapp-config
              key: APP_MESSAGE
        - name: SECRET_PASS
          valueFrom:
            secretKeyRef:
              name: webapp-secret
              key: APP_PASSWORD
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5`} />
          <CodeBlock lang="bash" code={`# Secret: crea con base64
echo -n "devuser" | base64    # output: ZGV2dXNlcg==
echo -n "password" | base64   # output: cGFzc3dvcmQ=

k create ns ckad-webapp
k apply -f . -n ckad-webapp
k get all -n ckad-webapp
k port-forward svc/webapp 8080:80 -n ckad-webapp`} />
        </Section>

        <Section num="04" title="Esercizio 2 — CronJob con InitContainer e PVC">
          <p>CronJob che scrive log su PVC ogni 2 minuti, con initContainer per il setup.</p>
          <CodeBlock lang="yaml" code={`# cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: log-writer
spec:
  schedule: "*/2 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          initContainers:
          - name: volume-init
            image: busybox:1.36
            command: ['sh', '-c', 'echo "=== CKAD Log Init $(date) ===" > /data/output.log']
            volumeMounts:
            - name: log-volume
              mountPath: /data
          containers:
          - name: logger
            image: busybox:1.36
            command: ['sh', '-c', 'echo "$(date): CKAD CronJob run" >> /data/output.log && sleep 10']
            volumeMounts:
            - name: log-volume
              mountPath: /data
          restartPolicy: OnFailure
          volumes:
          - name: log-volume
            persistentVolumeClaim:
              claimName: ckad-logs-pvc`} />
          <CodeBlock lang="bash" code={`k create ns ckad-jobs
k apply -f . -n ckad-jobs
k get cronjob,pvc -n ckad-jobs

# Forza esecuzione immediata
k create job manual-log --from=cronjob/log-writer -n ckad-jobs
k logs job/manual-log -n ckad-jobs

# Debug
k exec pod/<nome> -n ckad-jobs -- cat /data/output.log`} />
        </Section>

        <Section num="05" title="NetworkPolicy — deny-all e whitelist">
          <CodeBlock lang="yaml" code={`# 1. Deny-all ingress sul namespace db
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-deny-all
  namespace: ckad-db
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
# 2. Permetti solo al backend di raggiungere il db
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-allow-backend
  namespace: ckad-db
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          role: backend
      podSelector:
        matchLabels:
          app: backend
    ports:
    - protocol: TCP
      port: 80`} />
        </Section>

        <Section num="06" title="RBAC — Role, RoleBinding, ServiceAccount">
          <CodeBlock lang="yaml" code={`# role.yaml — accesso a pods e configmaps, NO secrets
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-configmap-reader
  namespace: ckad-rbac
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-reader-binding
  namespace: ckad-rbac
subjects:
- kind: ServiceAccount
  name: app-reader
  namespace: ckad-rbac
roleRef:
  kind: Role
  name: pod-configmap-reader
  apiGroup: rbac.authorization.k8s.io`} />
          <CodeBlock lang="bash" code={`# Verifica permessi
k auth can-i get pods --as=system:serviceaccount:ckad-rbac:app-reader -n ckad-rbac
k auth can-i get secrets --as=system:serviceaccount:ckad-rbac:app-reader -n ckad-rbac`} />
        </Section>
      </div>
    ),
    exercises: (
      <div className="space-y-3">
        <ExerciseCard title="Esercizio 1 — Deploy WebApp" difficulty="⭐ Base" time="15 min"
          path="CKAD/esercizi_ckad/Esercizi_K8s/deploy_webapp_1/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/Esercizi_K8s/deploy_webapp_1"
          desc="Deploy nginx 3 repliche con ConfigMap, Secret Opaque, liveness/readiness probe e Service." />
        <ExerciseCard title="Esercizio 2 — CronJob con PVC e InitContainer" difficulty="⭐⭐ Base-intermedio" time="15 min"
          path="CKAD/esercizi_ckad/Esercizi_K8s/deploy_cronjob_2/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/Esercizi_K8s/deploy_cronjob_2"
          desc="CronJob ogni 2 minuti che scrive log persistenti su PVC con initContainer di setup." />
        <ExerciseCard title="Esercizio 7 — NetworkPolicy" difficulty="⭐⭐⭐ Intermedio-avanzato" time="20 min"
          path="CKAD/esercizi_ckad/networkpolicy/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/networkpolicy"
          desc="Architettura frontend/backend/db con deny-all e whitelist selettivi tramite NetworkPolicy." />
        <ExerciseCard title="Esercizio 8 — RBAC" difficulty="⭐⭐⭐ Avanzato" time="20 min"
          path="CKAD/esercizi_ckad/rbac/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/rbac"
          desc="Role + RoleBinding + ServiceAccount con least privilege: accesso a pods/configmaps, NO secrets." />
        <ExerciseCard title="Guida CKAD completa" difficulty="📖 Reference" time="—"
          path="CKAD/Helm/docs/CKAD_CERTIFICATION.md"
          url="https://github.com/ldellemonache94/studio-consip/blob/master/CKAD/Helm/docs/CKAD_CERTIFICATION.md"
          desc="Guida completa con tutti i domini, pesi, ambiente d'esame, alias e setup consigliati." />
      </div>
    ),
  },

  /* ── HELM ── */
  helm: {
    title: "Helm Charts",
    subtitle: "_helpers.tpl, condizionali, range/with, schema JSON, test, CI/CD",
    repoPath: "CKAD/Helm/",
    sections: (
      <div className="space-y-8">
        <Section num="01" title="Comandi Helm essenziali — cheat sheet">
          <CodeBlock lang="bash" code={`# Installazione
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version && helm env

# Repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo list && helm repo update
helm search repo bitnami/nginx

# Install / Upgrade / Rollback
helm install my-app ./my-chart --namespace my-ns --create-namespace
helm install my-app ./my-chart --set replicaCount=5
helm install my-app ./my-chart -f values-prod.yaml

helm upgrade my-app ./my-chart --set image.tag="1.26-alpine"
helm upgrade --install my-app ./my-chart --namespace my-ns --create-namespace  # idempotente

helm history my-app -n my-ns
helm rollback my-app 1 -n my-ns

# Debug / Inspection
helm template my-app ./my-chart          # Renderizza senza installare
helm install my-app ./my-chart --dry-run --debug
helm get values my-app -n my-ns
helm get manifest my-app -n my-ns
helm status my-app -n my-ns
helm lint ./my-chart

# Uninstall
helm uninstall my-app -n my-ns`} />
        </Section>

        <Section num="02" title="Esercizio 3 — Primo Deploy con Helm">
          <p>Deploy di una webapp tramite Helm chart: install, upgrade con --set, rollback, history.</p>
          <CodeBlock lang="bash" code={`cd CKAD/esercizi_ckad/Esercizi_Helm/
helm template my-webapp ./helm-webapp

kubectl create ns ckad-helm
helm install my-webapp ./helm-webapp --namespace ckad-helm
helm list -n ckad-helm
kubectl get all -n ckad-helm
kubectl port-forward svc/helm-webapp 8080:80 -n ckad-helm

# Upgrade: 5 repliche + nuovo messaggio
helm upgrade my-webapp ./helm-webapp --namespace ckad-helm \
  --set replicaCount=5 \
  --set config.appMessage="Upgraded via Helm!"

# Rollback alla revisione 1
helm rollback my-webapp 1 -n ckad-helm
helm history my-webapp -n ckad-helm

# Upgrade con file di override
helm upgrade my-webapp ./helm-webapp --namespace ckad-helm -f values-prod.yaml

helm uninstall my-webapp -n ckad-helm
kubectl delete ns ckad-helm`} />
        </Section>

        <Section num="03" title="Esercizio 4 — _helpers.tpl e Named Templates">
          <p>Perché <code>selectorLabels</code> è separato da <code>labels</code>? Perché il selector è <strong>immutabile</strong> dopo il primo deploy.</p>
          <CodeBlock lang="yaml" code={`{{/* _helpers.tpl */}}
{{- define "helm-helpers.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "helm-helpers.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
{{ include "helm-helpers.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "helm-helpers.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}`} />
          <CodeBlock lang="bash" code={`kubectl create ns ckad-helpers
helm install my-release ./helm-helpers --namespace ckad-helpers
kubectl get deploy my-release-helm-helpers -n ckad-helpers -o yaml | grep -A 10 labels

helm uninstall my-release -n ckad-helpers
kubectl delete ns ckad-helpers`} />
        </Section>

        <Section num="04" title="Esercizio 5 — Condizionali, range e with">
          <p><code>if</code> per risorse opzionali (Ingress, HPA), <code>range</code> per liste env vars, <code>with</code> per path annidati.</p>
          <CodeBlock lang="yaml" code={`# deployment.yaml con condizionali
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  ...
  containers:
  - name: webapp
    env:
    {{- range .Values.envVars }}
    - name: {{ .name }}
      value: {{ .value | quote }}
    {{- end }}
    {{- with .Values.resources }}
    resources:
      requests:
        memory: {{ .requests.memory | quote }}
        cpu: {{ .requests.cpu | quote }}
      limits:
        memory: {{ .limits.memory | quote }}
        cpu: {{ .limits.cpu | quote }}
    {{- end }}

# hpa.yaml — risorsa opzionale
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
...
{{- end }}`} />
          <CodeBlock lang="bash" code={`# Rendering condizionale
helm template my-rel ./helm-conditionals | grep "kind:"
helm template my-rel ./helm-conditionals --set ingress.enabled=true | grep "kind:"
helm template my-rel ./helm-conditionals \
  --set ingress.enabled=true \
  --set autoscaling.enabled=true | grep "kind:"`} />
        </Section>

        <Section num="05" title="Esercizio 6 — Chart avanzato: Schema JSON + helm test + CI/CD">
          <CodeBlock lang="json" code={`// values.schema.json — validazione automatica al helm install
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["replicaCount", "image", "service"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "image": {
      "type": "object",
      "properties": {
        "pullPolicy": {
          "type": "string",
          "enum": ["Always", "IfNotPresent", "Never"]
        }
      }
    }
  }
}`} />
          <CodeBlock lang="bash" code={`# Schema validation — errore con tipo sbagliato
helm install test-schema ./helm-advanced --namespace ckad-adv --set replicaCount=abc

# Deploy con dry-run e debug
helm install my-adv ./helm-advanced --namespace ckad-adv --create-namespace --dry-run --debug

# helm test
helm install my-adv ./helm-advanced --namespace ckad-adv
helm test my-adv -n ckad-adv

# Upgrade idempotente (CI/CD pattern)
helm upgrade --install my-adv ./helm-advanced \
  --namespace ckad-adv --create-namespace \
  --set image.tag="1.26-alpine" \
  --wait --timeout 3m

helm history my-adv -n ckad-adv
helm get values my-adv -n ckad-adv --all`} />
        </Section>
      </div>
    ),
    exercises: (
      <div className="space-y-3">
        <ExerciseCard title="Esercizio 3 — Primo Deploy Helm" difficulty="⭐⭐ Base-intermedio" time="20 min"
          path="CKAD/esercizi_ckad/Esercizi_Helm/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/Esercizi_Helm"
          desc="helm install, upgrade --set, rollback, history, uninstall su una webapp nginx." />
        <ExerciseCard title="Esercizio 4 — _helpers.tpl" difficulty="⭐⭐ Base-intermedio" time="20 min"
          path="CKAD/esercizi_ckad/Esercizi_Helm/04-helm-helpers/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/Esercizi_Helm/04-helm-helpers"
          desc="Named templates, fullname/labels/selectorLabels, perché il selector è immutabile." />
        <ExerciseCard title="Esercizio 5 — Condizionali, range, with" difficulty="⭐⭐⭐ Intermedio" time="25 min"
          path="CKAD/esercizi_ckad/Esercizi_Helm/05-helm-conditionals/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/Esercizi_Helm/05-helm-conditionals"
          desc="Chart con Ingress e HPA opzionali, env vars dinamiche da lista, rendering condizionale." />
        <ExerciseCard title="Esercizio 6 — Chart avanzato" difficulty="⭐⭐⭐ Avanzato" time="30 min"
          path="CKAD/esercizi_ckad/Esercizi_Helm/06-helm-advanced/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/CKAD/esercizi_ckad/Esercizi_Helm/06-helm-advanced"
          desc="Schema JSON validation, helm test, ConfigMap + Secret + probes, CI/CD upgrade --install pattern." />
        <ExerciseCard title="README Helm — guida completa" difficulty="📖 Reference" time="—"
          path="CKAD/Helm/docs/README_Helm.md"
          url="https://github.com/ldellemonache94/studio-consip/blob/master/CKAD/Helm/docs/README_Helm.md"
          desc="Tutti i comandi Helm con spiegazioni, struttura chart, Go Template, precedenza values, dipendenze." />
      </div>
    ),
  },

  /* ── NETWORKING ── */
  networking: {
    title: "Networking",
    subtitle: "Linux network tools + 9 lab K8s/WSL dal repo",
    repoPath: "Networking/",
    sections: (
      <div className="space-y-8">
        <Section num="01" title="Cheat sheet tool di rete">
          <CodeBlock lang="bash" code={`# CONNETTIVITÀ
ping -c 4 google.com
traceroute google.com
mtr google.com                    # mix traceroute + ping continuo

# DNS
dig google.com A
dig @8.8.8.8 google.com           # DNS specifico
nslookup google.com
dig -x 8.8.8.8                    # Reverse lookup
dig google.com +trace             # Trace completo

# HTTP/API
curl -v https://google.com
curl -s -o /dev/null -w "%{http_code}" https://google.com
curl -I https://google.com        # Solo headers
wget --spider https://google.com  # Verifica esistenza

# PORT CHECK
nc -zw3 google.com 443 && echo "APERTA" || echo "CHIUSA"
nmap -p 80,443 google.com

# PORTE LOCALI
ss -tlnp                          # Porte TCP in ascolto
netstat -tlnp

# INTERFACCE
ip addr show
ip route show

# PACKET CAPTURE
sudo tcpdump -i eth0 port 80 -nn

# REMOTE
ssh user@host
scp file.txt user@host:/path/`} />
        </Section>

        <Section num="02" title="Setup lab Networking (prerequisiti)">
          <CodeBlock lang="bash" code={`# WSL/Ubuntu — installa i tool
sudo apt update && sudo apt install -y \
  curl wget dnsutils netcat-openbsd \
  traceroute iputils-ping iproute2 \
  nmap tcpdump

# K8s — crea namespace e pod di debug
kubectl create namespace lab-networking
kubectl run net-busybox --image=busybox:1.36 -n lab-networking -- sleep 3600
kubectl run net-netshoot --image=nicolaka/netshoot -n lab-networking -- sleep 3600`} />
        </Section>

        <Section num="03" title="Lab K8s 01 — DNS e curl dentro un Pod">
          <CodeBlock lang="bash" code={`# Entra nel pod busybox
kubectl exec -it net-busybox -n lab-networking -- sh

# DNS resolution interna K8s
nslookup kubernetes.default
cat /etc/resolv.conf

# FQDN completo di un Service
# <service>.<namespace>.svc.cluster.local
nslookup my-service.my-namespace.svc.cluster.local

# curl a un Service
curl http://my-service.my-namespace.svc.cluster.local
wget -O- http://my-service`} />
        </Section>

        <Section num="04" title="Lab K8s 05 — Debug script universale">
          <CodeBlock lang="bash" code={`#!/usr/bin/env bash
# Uso: ./k8s-net-debug.sh <SERVICE_NAME> <NAMESPACE>
SVC=$1
NS=$\{2:-default}

echo "--- Service ---"
kubectl get svc "$SVC" -n "$NS" -o wide

echo "--- Endpoints ---"
kubectl get endpoints "$SVC" -n "$NS"

echo "--- Pod selezionati ---"
SELECTOR=$(kubectl get svc "$SVC" -n "$NS" -o jsonpath='{.spec.selector}')
echo "Selector: $SELECTOR"

echo "--- NetworkPolicy in namespace $NS ---"
kubectl get networkpolicies -n "$NS"`} />
        </Section>

        <Section num="05" title="WSL 02 — Script url-check.sh">
          <CodeBlock lang="bash" code={`#!/usr/bin/env bash
FILE=$\{1:-urls.txt}
while IFS= read -r url || [ -n "$url" ]; do
  [ -z "$url" ] && continue
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
  if [[ "$CODE" =~ ^2|^3 ]]; then STATUS="✅ OK"; else STATUS="❌ KO"; fi
  printf "%-40s %-10s %s\n" "$url" "$CODE" "$STATUS"
done < "$FILE"`} />
        </Section>
      </div>
    ),
    exercises: (
      <div className="space-y-3">
        <ExerciseCard title="K8s Lab 01 — DNS e curl nel Pod" difficulty="🟢 Base" time="15 min"
          path="Networking/networking-lab/k8s/01-basic-dns-curl/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/Networking/networking-lab/k8s/01-basic-dns-curl"
          desc="DNS resolution interna K8s, /etc/resolv.conf, FQDN, curl a Service da dentro un Pod." />
        <ExerciseCard title="K8s Lab 02 — Services e Endpoints" difficulty="🟡 Intermedio" time="20 min"
          path="Networking/networking-lab/k8s/02-services-endpoints/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/Networking/networking-lab/k8s/02-services-endpoints"
          desc="Service vs Endpoints, load balancing osservabile, NodePort, chiamata diretta a Pod IP." />
        <ExerciseCard title="K8s Lab 03 — NetworkPolicy" difficulty="🟡 Intermedio-Avanzato" time="25 min"
          path="Networking/networking-lab/k8s/03-network-policies/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/Networking/networking-lab/k8s/03-network-policies"
          desc="deny-all policy, whitelist per label, troubleshooting NetworkPolicy." />
        <ExerciseCard title="K8s Lab 05 — Advanced Debug" difficulty="🔴 Avanzato" time="30 min"
          path="Networking/networking-lab/k8s/05-advanced-debug/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/Networking/networking-lab/k8s/05-advanced-debug"
          desc="Checklist troubleshooting sistemática, scenari Service rotto, script k8s-net-debug.sh." />
        <ExerciseCard title="WSL Lab 01 — Basi networking" difficulty="🟢 Base" time="15 min"
          path="Networking/networking-lab/wsl/01-basics/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/Networking/networking-lab/wsl/01-basics"
          desc="ping, nslookup/dig, curl, wget, ip addr/route, ss — tool base su WSL/Linux." />
        <ExerciseCard title="Tool: curl completo" difficulty="📖 Reference" time="—"
          path="Networking/networking-lab/troubleshooting-tools/01-curl/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/Networking/networking-lab/troubleshooting-tools/01-curl"
          desc="Anatomy di curl -v, timing, K8s pod testing, SSL debug, VPN scenarios." />
        <ExerciseCard title="README Networking — guida 23K" difficulty="📖 Reference" time="—"
          path="Networking/README.md"
          url="https://github.com/ldellemonache94/studio-consip/blob/master/Networking/README.md"
          desc="Guida completa a tutti i comandi di rete Linux: ping, traceroute, dig, curl, nc, nmap, tcpdump, ssh." />
      </div>
    ),
  },

  /* ── JAVA ── */
  java: {
    title: "Java & JVM su Kubernetes",
    subtitle: "Heap, container limits, Shenandoah GC, OOMKilled, Spring Boot lab",
    repoPath: "JAVA/",
    sections: (
      <div className="space-y-8">
        <Section num="01" title="JVM Memory su K8s — Quick Start">
          <CodeBlock lang="bash" code={`minikube start --memory=8192 --cpus=4
eval $(minikube docker-env)
cd JAVA/java-k8s-lab/app
docker build -t memory-eater:latest .

# Scenario 1: No -Xmx → OOMKilled
kubectl apply -f k8s/deployment.yaml

# Scenario 2: Heap limitato con -Xmx
kubectl apply -f k8s/deployment-xmx.yaml

# Scenario 3: Shenandoah GC
kubectl apply -f k8s/deployment-shenandoah.yaml

kubectl get pods
kubectl logs -f <pod>
kubectl describe pod <pod>       # Cerca OOMKilled
kubectl top pod`} />
        </Section>

        <Section num="02" title="MemoryEater.java — app di test">
          <CodeBlock lang="java" code={`// Alloca 10MB al secondo finché non va OOM
import java.util.ArrayList;
import java.util.List;

public class MemoryEater {
    public static void main(String[] args) throws Exception {
        List<byte[]> memory = new ArrayList<>();
        while (true) {
            memory.add(new byte[10 * 1024 * 1024]); // 10MB
            System.out.println("Allocated: " + memory.size() * 10 + " MB");
            Thread.sleep(1000);
        }
    }
}`} />
        </Section>

        <Section num="03" title="Deployment con -Xmx e Shenandoah GC">
          <CodeBlock lang="yaml" code={`# deployment-shenandoah.yaml
spec:
  containers:
  - name: app
    image: memory-eater:latest
    command: ["java"]
    args:
      - "-Xms128m"
      - "-Xmx256m"
      - "-XX:+UseShenandoahGC"
      - "-Xlog:gc*"
      - "MemoryEater"
    resources:
      limits:
        memory: "512Mi"`} />
        </Section>

        <Section num="04" title="Spring Boot su K8s">
          <CodeBlock lang="dockerfile" code={`# Dockerfile Spring Boot
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]`} />
          <CodeBlock lang="bash" code={`# Test endpoint /eat (alloca 5MB per call)
curl http://localhost:8080/eat

# Osserva il consumo
kubectl top pod
kubectl logs -f <pod>

# OOMKilled? Aumenta -Xmx o limits.memory
# GC troppo frequente? Prova Shenandoah`} />
        </Section>
      </div>
    ),
    exercises: (
      <div className="space-y-3">
        <ExerciseCard title="JVM K8s Lab — Memory Eater" difficulty="⭐⭐⭐ Avanzato" time="30 min"
          path="JAVA/java-k8s-lab/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/JAVA/java-k8s-lab"
          desc="3 scenari: No Xmx (OOMKilled), Heap limitato (-Xmx256m), Shenandoah GC con GC logs." />
        <ExerciseCard title="Spring Boot su K8s" difficulty="⭐⭐⭐ Avanzato" time="25 min"
          path="JAVA/java-k8s-lab/springboot/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/JAVA/java-k8s-lab/springboot"
          desc="Spring Boot con endpoint /eat, osservazione heap, thread/CPU limits, GC logs su K8s." />
        <ExerciseCard title="Guida JVM internals" difficulty="📖 Reference" time="—"
          path="JAVA/JavaVirtualMachine/README.md"
          url="https://github.com/ldellemonache94/studio-consip/blob/master/JAVA/JavaVirtualMachine/README.md"
          desc="Deep-dive: heap vs container limits, Shenandoah GC, native memory, CompressedOops, NMT, OOMKilled." />
      </div>
    ),
  },

  /* ── CODING ── */
  coding: {
    title: "Coding & DevSecOps",
    subtitle: "Task Manager vanilla JS, Flask Python, DevSecOps, Maven versioning",
    repoPath: "coding/ & exercises/",
    sections: (
      <div className="space-y-8">
        <Section num="01" title="Task Manager — Vanilla JS">
          <p>App JavaScript senza framework: add/complete/delete task, priorità, filtri, storage locale.</p>
          <CodeBlock lang="javascript" code={`// app.js — stato e helpers
let tasks = JSON.parse(window['local'+'Storage'].getItem('tasks')) || [];
let currentFilter = 'all';

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return taskInput.focus();
  tasks.unshift({
    id:        Date.now(),
    text,
    priority:  prioritySelect.value,   // 'high' | 'medium' | 'low'
    completed: false,
    createdAt: new Date().toISOString()
  });
  taskInput.value = '';
  save();
  render();
}

// Apri index.html nel browser — nessun server necessario`} />
        </Section>

        <Section num="02" title="Flask Python — Hello World">
          <CodeBlock lang="python" code={`# hello.py
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    numero1, numero2 = 10, 20
    risultato = numero1 + numero2
    return f"<h1>La somma è {risultato}</h1>"

if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)`} />
          <CodeBlock lang="bash" code={`# Setup
python3 -m venv venv && source venv/bin/activate
pip3 install flask
python3 hello.py
# Apri http://localhost:8080`} />
        </Section>

        <Section num="03" title="DevSecOps — Flask hardening + SAST">
          <CodeBlock lang="bash" code={`# pip-audit: scan CVE nelle dipendenze
pip install pip-audit
pip-audit

# bandit: SAST (Static Application Security Testing)
pip install bandit
bandit -r . -f txt

# Flask hardening
# debug=False in produzione (mai debug=True su K8s!)
# Usa variabili d'ambiente per secrets, non hardcoded
# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

# Push al repo dopo il fix
git add .
git commit -m "security: hardening Flask app, fix bandit findings"
git push origin feature/<nome>-devsecops`} />
        </Section>

        <Section num="04" title="Maven versioning — build.sh">
          <CodeBlock lang="bash" code={`#!/bin/bash
# Uso: ./build.sh 1.2.3
set -e
if [ -z "$1" ]; then
  echo "Errore: versione non specificata"
  echo "Uso: ./build.sh <nuova-versione>"
  exit 1
fi
NEW_VERSION=$1
echo "Aggiornamento versione Maven a: $NEW_VERSION"
mvn versions:set -DnewVersion=$NEW_VERSION -DgenerateBackupPoms=false
echo "Download dipendenze"
mvn dependency:resolve
echo "Esecuzione build"
mvn clean package
echo "Build completata con successo"`} />
        </Section>
      </div>
    ),
    exercises: (
      <div className="space-y-3">
        <ExerciseCard title="Task Manager — Vanilla JS" difficulty="⭐⭐ Base-intermedio" time="20 min"
          path="coding/TaskManager/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/coding/TaskManager"
          desc="Task Manager con priorità, filtri e storage locale. Apri index.html direttamente nel browser." />
        <ExerciseCard title="Flask Python — Hello World" difficulty="⭐ Base" time="10 min"
          path="exercises/frontend-python/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/frontend-python"
          desc="Setup venv, pip install flask, app con calcolo e HTML inline, run su localhost:8080." />
        <ExerciseCard title="DevSecOps — Flask Secure App" difficulty="⭐⭐⭐ Avanzato" time="30 min"
          path="exercises/DevSecOps exercise/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/DevSecOps%20exercise"
          desc="pip-audit per CVE scan, bandit SAST, Flask hardening (debug=False, secrets da env), push al repo." />
        <ExerciseCard title="Esercizio 07 — Maven versioning" difficulty="⭐⭐ Intermedio" time="20 min"
          path="exercises/maven-versioning/"
          url="https://github.com/ldellemonache94/studio-consip/tree/master/exercises/maven-versioning"
          desc="Script bash per mvn versions:set, dependency:resolve, clean package con gestione errori." />
      </div>
    ),
  },
};

/* ── Fallback topics (vecchi ID) ── */
const FALLBACKS: Record<string, string> = {
  docker: "coding",
  cicd: "helm",
  ckad: "kubernetes",
};

/* ══════ COMPONENT ══════ */
export default function TopicDetail() {
  const params = useParams<{ id: string }>();
  const rawId = params.id ?? "";
  const id = FALLBACKS[rawId] ?? rawId;
  const topic = TOPICS[id];

  if (!topic) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-muted-foreground font-mono text-sm">Modulo "{rawId}" non trovato.</p>
        <Link href="/">
          <Button variant="outline" size="sm">← Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground -ml-2" data-testid="btn-back">
            <ArrowLeft size={12} className="mr-1" /> Dashboard
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold font-mono">{topic.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{topic.subtitle}</p>
          </div>
          <a
            href={`https://github.com/ldellemonache94/studio-consip/tree/master/${topic.repoPath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" data-testid="btn-github">
              <Github size={12} />
              Vedi nel repo
              <ExternalLink size={10} />
            </Button>
          </a>
        </div>
        <div className="flex gap-2">
          <Link href="/chat">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" data-testid="btn-chat">
              <MessageSquare size={12} /> Chiedi all'AI Tutor
            </Button>
          </Link>
          <Link href="/review">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" data-testid="btn-review">
              <FileCode size={12} /> Code Review
            </Button>
          </Link>
          <Link href="/quiz">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" data-testid="btn-quiz">
              <ChevronRight size={12} /> Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Theory Content */}
      <div className="space-y-6">
        {topic.sections}
      </div>

      {/* Exercises from repo */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-muted-foreground">
            Esercizi nel repo
          </h2>
          <Badge variant="outline" className="text-[10px] font-mono">
            <code>{topic.repoPath}</code>
          </Badge>
        </div>
        {topic.exercises}
      </div>
    </div>
  );
}
