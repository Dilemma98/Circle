import "./appLayout.css";

import Header from "./header";
import Navigation from "./navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Header />
      <Navigation />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
