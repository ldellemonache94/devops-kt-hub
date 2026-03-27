import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BrainCircuit,
  GitBranch,
  Box,
  Award,
  Container,
  Layers,
  RefreshCw,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

const topicCards = [
  { id: "Git", label: "Git", icon: GitBranch, color: "text-orange-400" },
  { id: "Kubernetes", label: "Kubernetes", icon: Box, color: "text-blue-400" },
  { id: "CKAD", label: "CKAD", icon: Award, color: "text-purple-400" },
  { id: "Docker", label: "Docker", icon: Container, color: "text-cyan-400" },
  { id: "Helm", label: "Helm", icon: Layers, color: "text-green-400" },
  { id: "CI/CD", label: "CI/CD", icon: RefreshCw, color: "text-amber-400" },
];

type Phase = "select" | "loading" | "quiz" | "results";

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (topic: string) => {
      const res = await apiRequest("POST", "/api/quiz/generate", { topic });
      return res.json();
    },
    onSuccess: (data) => {
      setQuestions(data.questions || []);
      setPhase("quiz");
    },
    onError: () => {
      setPhase("select");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (result: { topic: string; score: number; total: number }) => {
      const res = await apiRequest("POST", "/api/quiz/save", result);
      return res.json();
    },
  });

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setAnswers({});
    setSubmitted(false);
    setPhase("loading");
    generateMutation.mutate(topic);
  };

  const handleAnswer = (qIdx: number, answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);
    saveMutation.mutate({ topic: selectedTopic, score, total: questions.length });
    setPhase("results");
  };

  const handleRestart = () => {
    setPhase("select");
    setSelectedTopic("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
  };

  const score = questions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correct ? 1 : 0);
  }, 0);

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <BrainCircuit size={16} className="text-primary" />
        <h1 className="text-xl font-bold font-mono" data-testid="quiz-title">Quiz Generator</h1>
      </div>

      {/* Phase: Topic Selection */}
      {phase === "select" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Seleziona un argomento per generare 5 domande a risposta multipla con l'AI.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topicCards.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer border border-border hover:border-primary/30 transition-all bg-card"
                onClick={() => handleSelectTopic(t.id)}
                data-testid={`quiz-topic-${t.id}`}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className={`p-2 rounded-md bg-muted ${t.color}`}>
                    <t.icon size={20} />
                  </div>
                  <span className="text-sm font-mono font-medium">{t.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Phase: Loading */}
      {phase === "loading" && (
        <div className="space-y-4" data-testid="quiz-loading">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Generazione quiz su {selectedTopic}...
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-card border border-border">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Phase: Quiz */}
      {(phase === "quiz" || phase === "results") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-mono text-xs">
              {selectedTopic}
            </Badge>
            {phase === "results" && (
              <Badge
                variant={score >= 4 ? "default" : score >= 2 ? "secondary" : "destructive"}
                className="font-mono text-xs"
                data-testid="quiz-score"
              >
                Punteggio: {score}/{questions.length}
              </Badge>
            )}
          </div>

          {questions.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correct;

            return (
              <Card
                key={idx}
                className={`bg-card border transition-colors ${
                  submitted
                    ? isCorrect
                      ? "border-green-500/30"
                      : userAnswer
                      ? "border-red-500/30"
                      : "border-border"
                    : "border-border"
                }`}
                data-testid={`quiz-question-${idx}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-start gap-2">
                    <span className="text-primary font-mono text-xs mt-0.5 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{q.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = ["A", "B", "C", "D"][optIdx];
                      const isSelected = userAnswer === letter;
                      const isCorrectAnswer = letter === q.correct;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswer(idx, letter!)}
                          disabled={submitted}
                          className={`text-left px-3 py-2 rounded-md text-xs border transition-all ${
                            submitted
                              ? isCorrectAnswer
                                ? "border-green-500/50 bg-green-500/10 text-green-400"
                                : isSelected && !isCorrectAnswer
                                ? "border-red-500/50 bg-red-500/10 text-red-400"
                                : "border-border text-muted-foreground"
                              : isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                          }`}
                          data-testid={`quiz-option-${idx}-${letter}`}
                        >
                          <span className="font-mono font-medium mr-1.5">{letter})</span>
                          {opt.replace(/^[A-D]\)\s*/, "")}
                          {submitted && isCorrectAnswer && (
                            <CheckCircle size={12} className="inline ml-1.5 text-green-400" />
                          )}
                          {submitted && isSelected && !isCorrectAnswer && (
                            <XCircle size={12} className="inline ml-1.5 text-red-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && q.explanation && (
                    <div className="mt-2 px-3 py-2 bg-muted rounded-md text-xs text-muted-foreground" data-testid={`quiz-explanation-${idx}`}>
                      <strong className="text-foreground">Spiegazione:</strong> {q.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-2 pt-2">
            {!submitted && (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                data-testid="btn-submit-quiz"
              >
                Verifica Risposte
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleRestart}
              data-testid="btn-new-quiz"
            >
              <RotateCcw size={14} className="mr-1" />
              Nuovo Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
