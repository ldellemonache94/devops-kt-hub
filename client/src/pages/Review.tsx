import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  Shield,
} from "lucide-react";

interface ReviewIssue {
  severity: "ok" | "warning" | "error";
  message: string;
}

interface ReviewResult {
  assessment: string;
  summary: string;
  issues: ReviewIssue[];
  suggestions: string[];
}

const codeTypes = [
  { value: "yaml", label: "YAML (Kubernetes)" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "jenkinsfile", label: "Jenkinsfile" },
  { value: "other", label: "Altro" },
];

const exampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 1
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
        image: nginx:latest
        ports:
        - containerPort: 80`;

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "ok":
      return <CheckCircle size={14} className="text-green-400 shrink-0" />;
    case "warning":
      return <AlertTriangle size={14} className="text-amber-400 shrink-0" />;
    case "error":
      return <XCircle size={14} className="text-red-400 shrink-0" />;
    default:
      return null;
  }
}

function AssessmentBadge({ assessment }: { assessment: string }) {
  const lower = assessment.toLowerCase();
  if (lower.includes("ottimo")) {
    return (
      <Badge className="bg-green-500/10 text-green-400 border-green-500/30" data-testid="assessment-badge">
        <CheckCircle size={12} className="mr-1" /> Ottimo
      </Badge>
    );
  }
  if (lower.includes("critico")) {
    return (
      <Badge className="bg-red-500/10 text-red-400 border-red-500/30" data-testid="assessment-badge">
        <XCircle size={12} className="mr-1" /> Critico
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30" data-testid="assessment-badge">
      <AlertTriangle size={12} className="mr-1" /> Attenzione
    </Badge>
  );
}

export default function Review() {
  const [code, setCode] = useState(exampleYaml);
  const [codeType, setCodeType] = useState("yaml");
  const [review, setReview] = useState<ReviewResult | null>(null);

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/review", { code, type: codeType });
      return res.json();
    },
    onSuccess: (data) => {
      setReview(data.review);
    },
  });

  const handleReview = () => {
    if (!code.trim()) return;
    setReview(null);
    reviewMutation.mutate();
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <FileCode size={16} className="text-primary" />
        <h1 className="text-xl font-bold font-mono" data-testid="review-title">Code Review</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Code Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Codice
            </span>
            <Select value={codeType} onValueChange={setCodeType}>
              <SelectTrigger className="w-44 h-8 text-xs" data-testid="select-code-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {codeTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[500px] font-mono text-xs bg-[hsl(220,27%,6%)] text-[hsl(220,10%,85%)] border border-border rounded-lg p-4 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Incolla il tuo codice qui..."
            spellCheck={false}
            data-testid="textarea-code"
          />

          <Button
            onClick={handleReview}
            disabled={!code.trim() || reviewMutation.isPending}
            className="w-full"
            data-testid="btn-review"
          >
            {reviewMutation.isPending ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" />
                Analisi in corso...
              </>
            ) : (
              <>
                <Shield size={14} className="mr-1" />
                Analizza Codice
              </>
            )}
          </Button>
        </div>

        {/* Right: Results */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risultati
          </span>

          {reviewMutation.isPending && !review && (
            <Card className="bg-card border border-border">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {review && (
            <div className="space-y-3" data-testid="review-results">
              {/* Assessment */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono flex items-center justify-between">
                    Valutazione
                    <AssessmentBadge assessment={review.assessment} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" data-testid="review-summary">
                    {review.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Issues */}
              {review.issues && review.issues.length > 0 && (
                <Card className="bg-card border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">
                      Problemi ({review.issues.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {review.issues.map((issue, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs"
                          data-testid={`review-issue-${idx}`}
                        >
                          <SeverityIcon severity={issue.severity} />
                          <span className="text-muted-foreground">{issue.message}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {review.suggestions && review.suggestions.length > 0 && (
                <Card className="bg-card border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Lightbulb size={14} className="text-amber-400" />
                      Suggerimenti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {review.suggestions.map((sug, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                          data-testid={`review-suggestion-${idx}`}
                        >
                          <span className="text-primary font-mono shrink-0">→</span>
                          {sug}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!review && !reviewMutation.isPending && (
            <Card className="bg-card border border-border border-dashed">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <FileCode size={32} className="text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Incolla il tuo codice e clicca "Analizza Codice" per ricevere
                  feedback dall'AI.
                </p>
              </CardContent>
            </Card>
          )}

          {reviewMutation.isError && (
            <Card className="bg-card border border-red-500/30">
              <CardContent className="p-4">
                <p className="text-sm text-red-400">
                  Errore durante l'analisi. Riprova tra qualche secondo.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
