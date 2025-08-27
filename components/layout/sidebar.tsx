"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Target,
  ShoppingCart,
  Settings,
  Bell,
  DollarSign,
  LogOut,
  Menu,
  ChevronLeft, // Ícone adicionado aqui
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ProfileDialog } from "@/components/profile-dialog";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const { notificacoesAtivas } = useData();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const notificacoesNaoLidas = notificacoesAtivas.filter((n) => !n.lida).length;

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: "colaboradores",
      label: "Colaboradores",
      icon: Users,
      show: isAdmin(),
    },
    {
      id: "metas",
      label: "Metas",
      icon: Target,
      show: isAdmin(),
    },
    {
      id: "vendas",
      label: "Vendas",
      icon: ShoppingCart,
      show: true,
    },
    {
      id: "comissoes",
      label: "Comissões",
      icon: DollarSign,
      show: true,
    },
    {
      id: "notificacoes",
      label: "Notificações",
      icon: Bell,
      show: isAdmin(),
      badge: notificacoesNaoLidas > 0 ? notificacoesNaoLidas : undefined,
    },
    {
      id: "configuracoes",
      label: "Configurações",
      icon: Settings,
      show: isAdmin(),
    },
  ];

  const visibleItems = menuItems.filter((item) => item.show);

  return (
    <>
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Meta & Comissões
                </h1>
                <p className="text-sm text-gray-500">Sistema de Gestão</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              {isCollapsed ? (
                <Menu className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* User Info como um DialogTrigger */}
        <Dialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
        >
          <DialogTrigger asChild>
            <div className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" alt={user?.nome} />
                  <AvatarFallback>
                    {user?.nome
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.nome}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.tipo === "admin" ? "Administrador" : "Colaborador"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogTrigger>
          <ProfileDialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}
          />
        </Dialog>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge
                        className="ml-auto bg-red-500 text-white text-xs"
                        variant="secondary"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed && "justify-center px-2"
            )}
            onClick={logout}
          >
            <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
