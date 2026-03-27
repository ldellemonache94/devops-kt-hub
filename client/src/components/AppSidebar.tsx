import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import {
  LayoutDashboard,
  GitBranch,
  Box,
  Layers,
  Network,
  Coffee,
  Code2,
  MessageSquare,
  BrainCircuit,
  FileCode,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";

const modules = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "git", label: "Git & Version Control", icon: GitBranch, href: "/topic/git" },
  { id: "kubernetes", label: "Kubernetes & CKAD", icon: Box, href: "/topic/kubernetes" },
  { id: "helm", label: "Helm Charts", icon: Layers, href: "/topic/helm" },
  { id: "networking", label: "Networking", icon: Network, href: "/topic/networking" },
  { id: "java", label: "Java & JVM su K8s", icon: Coffee, href: "/topic/java" },
  { id: "coding", label: "Coding & DevSecOps", icon: Code2, href: "/topic/coding" },
];

const aiTools = [
  { id: "chat", label: "AI Tutor", icon: MessageSquare, href: "/chat" },
  { id: "quiz", label: "Quiz Generator", icon: BrainCircuit, href: "/quiz" },
  { id: "review", label: "Code Review", icon: FileCode, href: "/review" },
];

function KTLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DevOps KT Hub Logo"
    >
      {/* Circuit board pattern */}
      <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* K letterform */}
      <path d="M10 8L10 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 16L20 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 16L20 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Circuit nodes */}
      <circle cx="10" cy="8" r="1.5" fill="hsl(221 83% 58%)" />
      <circle cx="10" cy="24" r="1.5" fill="hsl(221 83% 58%)" />
      <circle cx="20" cy="8" r="1.5" fill="hsl(221 83% 58%)" />
      <circle cx="20" cy="24" r="1.5" fill="hsl(221 83% 58%)" />
      <circle cx="10" cy="16" r="1.5" fill="hsl(221 83% 58%)" />
      {/* Circuit traces */}
      <line x1="22" y1="8" x2="26" y2="8" stroke="hsl(221 83% 58%)" strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="24" x2="26" y2="24" stroke="hsl(221 83% 58%)" strokeWidth="1" opacity="0.5" />
      <circle cx="26" cy="8" r="1" fill="hsl(221 83% 58%)" opacity="0.5" />
      <circle cx="26" cy="24" r="1" fill="hsl(221 83% 58%)" opacity="0.5" />
    </svg>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside
      className="w-60 h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0"
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-sidebar-border">
        <KTLogo />
        <div>
          <h1 className="text-sm font-semibold font-mono text-sidebar-foreground leading-tight" data-testid="app-title">
            DevOps KT Hub
          </h1>
          <span className="text-[10px] text-muted-foreground font-mono">studio-consip</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* Moduli */}
        <div>
          <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Moduli
          </span>
          <ul className="mt-1 space-y-0.5">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  href={m.href}
                  data-testid={`nav-${m.id}`}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    isActive(m.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <m.icon size={16} />
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Tools */}
        <div>
          <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Tools
          </span>
          <ul className="mt-1 space-y-0.5">
            {aiTools.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.href}
                  data-testid={`nav-${t.id}`}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    isActive(t.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-sidebar-border flex items-center justify-between">
        <a
          href="https://github.com/ldellemonache94/studio-consip"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-sidebar-foreground transition-colors flex items-center gap-1.5 text-xs"
          data-testid="link-github"
        >
          <ExternalLink size={14} />
          GitHub
        </a>
        <button
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-sidebar-foreground transition-colors p-1 rounded"
          data-testid="btn-theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </aside>
  );
}
