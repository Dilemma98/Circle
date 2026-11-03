
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {useEffect} from "react";

import AppLayout from "./components/layout/appLayout";
import HomePage from "./features/feed/pages/homePage";
import GroupsPage from "./features/groups/pages/groupsPage";
import GroupPage from "./features/groups/pages/groupPage";
import { ThemeProvider } from "./features/theme/themeProvider";

import { testSupabaseConnection } from "./lib/supabase";

export default function App() {

 useEffect(() => {
  testSupabaseConnection();
}, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<GroupPage />} />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    </BrowserRouter>
  );
}
