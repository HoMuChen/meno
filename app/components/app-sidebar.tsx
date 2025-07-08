import { User2, Clock } from "lucide-react"
import { useAuth } from "./auth"
import { useNavigate, Link } from "react-router-dom"
import { signOut } from "../firebase/auth"
import { useState, useEffect, useCallback } from "react"
import { getMonthlyUsageSum, getCurrentMonth } from "../services/usage"
import { Progress } from "./ui/progress"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./ui/sidebar"

export function AppSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);
  const monthlyLimit = 300;

  const loadMonthlyUsage = useCallback(async () => {
    if (!user) return;
    try {
      const currentMonth = getCurrentMonth();
      const usage = await getMonthlyUsageSum(user.uid, currentMonth);
      setMonthlyUsage(usage);
    } catch (error) {
      console.error("Error loading monthly usage:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMonthlyUsage();
    }
  }, [user, loadMonthlyUsage]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="text-xl md:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
          Meno
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <Link to="/meetings">
                    <span>Meetings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <Link to="/projects">
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-4">
        {user && (
          <div className="flex flex-col gap-3 w-full">
            {/* Monthly Usage Display */}
            <div className="p-3 rounded-md bg-muted/40">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Usage This Month</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{monthlyUsage} / {monthlyLimit} minutes</span>
                  <span className="text-muted-foreground">{getCurrentMonth()}</span>
                </div>
                <Progress 
                  value={(monthlyUsage / monthlyLimit) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/40">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-full object-cover border" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {user.displayName ? user.displayName[0] : <User2 className="h-5 w-5" />}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">{user.displayName || "User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              Log out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
