import { AppSidebar } from "./AppSidebar";
import { PerplexityAttribution } from "./PerplexityAttribution";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="px-6 py-3 border-t border-border">
            <PerplexityAttribution />
          </footer>
        </div>
      </main>
    </div>
  );
}
