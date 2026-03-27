import { Link } from "wouter";
import {
  GitBranch,
  Box,
  Award,
  Container,
  Layers,
  RefreshCw,
  MessageSquare,
  BrainCircuit,
  FileCode,
  ArrowRight,
  Network,
  Coffee,
  Code2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const topics = [
  {
    id: "git",
    title: "Git & Version Control",
    description: "Comandi base, branching, merge vs rebase, risoluzione conflitti, PAT",
    icon: GitBranch,
    exercises: 5,
    color: "text-orange-400",
    badge: "exercises/",
  },
  {
    id: "kubernetes",
    title: "Kubernetes & CKAD",
    description: "Pods, Deployments, CronJob, ConfigMap, Secret, RBAC, NetworkPolicy",
    icon: Box,
    exercises: 8,
    color: "text-blue-400",
    badge: "CKAD/esercizi_ckad/",
  },
  {
    id: "helm",
    title: "Helm Charts",
    description: "_helpers.tpl, condizionali, range/with, schema JSON, test, CI/CD",
    icon: Layers,
    exercises: 4,
    color: "text-green-400",
    badge: "CKAD/Helm/",
  },
  {
    id: "networking",
    title: "Networking",
    description: "ping, curl, dig, nc, nmap, tcpdump, K8s network debug, WSL lab",
    icon: Network,
    exercises: 9,
    color: "text-cyan-400",
    badge: "Networking/",
  },
  {
    id: "java",
    title: "Java & JVM su K8s",
    description: "Heap, container limits, Shenandoah GC, OOMKilled, Spring Boot lab",
    icon: Coffee,
    exercises: 4,
    color: "text-amber-400",
    badge: "JAVA/",
  },
  {
    id: "coding",
    title: "Coding & DevSecOps",
    description: "Task Manager vanilla JS, Flask Python, pip-audit, bandit SAST, Maven",
    icon: Code2,
    exercises: 4,
    color: "text-purple-400",
    badge: "coding/ & exercises/",
  },
];

const aiToolCards = [
  {
    id: "chat",
    title: "AI Tutor",
    description: "Chiedi qualsiasi cosa su DevOps al tuo tutor AI personale",
    icon: MessageSquare,
    href: "/chat",
    cta: "Avvia Chat",
  },
  {
    id: "quiz",
    title: "Quiz Generator",
    description: "Genera quiz personalizzati per testare le tue conoscenze",
    icon: BrainCircuit,
    href: "/quiz",
    cta: "Genera Quiz",
  },
  {
    id: "review",
    title: "Code Review",
    description: "Incolla il tuo YAML/Dockerfile e ricevi feedback dall'AI",
    icon: FileCode,
    href: "/review",
    cta: "Analizza Codice",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Hero */}
      <div className="space-y-2" data-testid="dashboard-hero">
        <h1 className="text-xl font-bold font-mono tracking-tight">
          Benvenuto nel DevOps KT Hub
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Piattaforma di Knowledge Transfer per il team DevOps Accenture.
          Esplora i moduli, utilizza gli strumenti AI e preparati per la certificazione CKAD.
          Basato sul repository{" "}
          <a
            href="https://github.com/ldellemonache94/studio-consip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono text-xs inline-flex items-center gap-1"
          >
            studio-consip <ExternalLink size={10} />
          </a>
        </p>
        <div className="flex gap-2 flex-wrap pt-1">
          <Badge variant="outline" className="text-[10px] font-mono text-green-400 border-green-400/30">
            8 esercizi CKAD
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono text-blue-400 border-blue-400/30">
            4 chart Helm
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-400/30">
            9 lab Networking
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono text-orange-400 border-orange-400/30">
            5 esercizi Git
          </Badge>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Moduli
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <Card
                className="group cursor-pointer border border-border hover:border-primary/30 transition-all duration-200 bg-card"
                data-testid={`card-topic-${topic.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-md bg-muted ${topic.color}`}>
                      <topic.icon size={18} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {topic.exercises} sezioni
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold font-mono mb-1 group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {topic.description}
                  </p>
                  <code className="text-[9px] text-muted-foreground/60 font-mono">
                    {topic.badge}
                  </code>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Tools */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Strumenti AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiToolCards.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <Card
                className="group cursor-pointer border border-border hover:border-primary/30 transition-all duration-200 bg-card"
                data-testid={`card-ai-${tool.id}`}
              >
                <CardContent className="p-4">
                  <div className="p-2 rounded-md bg-primary/10 text-primary w-fit mb-3">
                    <tool.icon size={18} />
                  </div>
                  <h3 className="text-sm font-semibold font-mono mb-1 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {tool.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary hover:text-primary"
                    data-testid={`btn-ai-${tool.id}`}
                  >
                    {tool.cta}
                    <ArrowRight size={12} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
