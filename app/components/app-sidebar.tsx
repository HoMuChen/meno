import { Calendar, Home, Inbox, Search, Settings, User2 } from "lucide-react"
import { useAuth } from "./auth"
import { useNavigate } from "@remix-run/react"
import { auth } from "../firebase"
import { signOut } from "../firebase/auth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Calendar,
  },
]

export function AppSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Meno</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-sm md:text-base">
                    <a href={item.url}>
                      <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-4">
        {user && (
          <div className="flex flex-col gap-2 w-full">
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
              className="mt-2 w-full py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              Log out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
