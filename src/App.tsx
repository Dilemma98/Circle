
import AppLayout from "./components/layout/appLayout";
import HomePage from "./features/feed/pages/homePage";
import { ThemeProvider } from "./features/theme/themeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AppLayout>
        <HomePage />
      </AppLayout>
    </ThemeProvider>
  );
}