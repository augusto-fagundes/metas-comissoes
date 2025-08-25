"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { DataProvider } from "@/contexts/data-context";
import { PeriodFilterProvider } from "@/contexts/period-filter-context";
import { LoginForm } from "@/components/login-form";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardPage } from "@/components/pages/dashboard-page";
import { ColaboradoresPage } from "@/components/pages/colaboradores-page";
import { MetasPage } from "@/components/pages/metas-page";
import { VendasPage } from "@/components/pages/vendas-page";
import { ComissoesPage } from "@/components/pages/comissoes-page";
import { ConfiguracoesPage } from "@/components/pages/configuracoes-page";
import { NotificacoesPage } from "@/components/pages/notificacoes-page";
import { Toaster } from "@/components/ui/toaster";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "colaboradores":
        return <ColaboradoresPage />;
      case "metas":
        return <MetasPage />;
      case "vendas":
        return <VendasPage />;
      case "comissoes":
        return <ComissoesPage />;
      case "configuracoes":
        return <ConfiguracoesPage />;
      case "notificacoes":
        return <NotificacoesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    // CORREÇÃO: Invertemos a ordem dos Providers.
    // Agora o DataProvider está dentro do PeriodFilterProvider.
    <PeriodFilterProvider>
      <DataProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
          <Toaster />
        </div>
      </DataProvider>
    </PeriodFilterProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
