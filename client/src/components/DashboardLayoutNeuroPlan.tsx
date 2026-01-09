import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OfflineIndicator, OfflineBanner, InstallPWAPrompt } from "@/components/OfflineIndicator";
import { 
  Brain, 
  ChevronDown, 
  FolderKanban, 
  Home, 
  Lightbulb, 
  LogOut, 
  Menu, 
  Plus, 
  Settings, 
  Timer, 
  User,
  CreditCard,
  BarChart3,
  Award
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/projects", label: "Projetos", icon: FolderKanban },
  { href: "/dashboard/focus", label: "Timer de Foco", icon: Timer },
  { href: "/dashboard/ideas", label: "Quick Ideas", icon: Lightbulb },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Perfil", icon: Award },
];

export default function DashboardLayoutNeuroPlan({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Brain className="h-7 w-7 text-[#22C55E]" />
            <span className="text-xl font-bold text-foreground">NeuroPlan</span>
          </div>

          {/* New Project Button */}
          <div className="p-4">
            <Link href="/dashboard/projects/new">
              <Button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white">
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* Offline Indicator */}
          <div className="px-4 py-2">
            <OfflineIndicator className="w-full justify-center" />
          </div>

          <Separator />

          {/* User Menu */}
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#22C55E]/10 text-[#22C55E]">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                      {user?.name || "Usuário"}
                    </span>
                    <span className="text-xs text-muted-foreground">Plano Gratuito</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Upgrade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-[#22C55E]" />
          <span className="text-lg font-bold text-foreground">NeuroPlan</span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <Brain className="h-7 w-7 text-[#22C55E]" />
                <span className="text-xl font-bold text-foreground">NeuroPlan</span>
              </div>

              <div className="p-4">
                <Link href="/dashboard/projects/new">
                  <Button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Projeto
                  </Button>
                </Link>
              </div>

              <ScrollArea className="flex-1 px-3">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location === item.href || 
                      (item.href !== "/dashboard" && location.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              <Separator />

              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#22C55E]/10 text-[#22C55E]">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">Plano Gratuito</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          {children}
        </div>
      </main>

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Install PWA Prompt */}
      <InstallPWAPrompt />
    </div>
  );
}
