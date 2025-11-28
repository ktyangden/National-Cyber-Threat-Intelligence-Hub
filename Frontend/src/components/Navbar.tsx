import React, { useEffect } from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggle } from "@/components/menu-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        await login(codeResponse.code);
        navigate('/');
      } catch (error) {
        console.error("Login failed", error);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
    },
    flow: 'auth-code',
    ux_mode: 'popup',
  });

  const getAvatarUrl = (username: string) => {
    const displayName = username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128&bold=true`;
  };

  const links = [
    {
      label: "About",
      href: "/about",
    },
    { label: "Threat Feeds", 
      href: "/threat-feeds" 
    }
  ];

  // useEffect(() => {
  //   if (user) {
  //     console.log(user);
  //   }
  // },);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/home">
          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dykzzd9sy/image/upload/v1763040855/logo_cykuw9.png"
              className="size-6"
              alt="ThreatVista Logo"
            />
            <p className="font-inter text-lg font-bold">ThreatVista</p>
          </div>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              className={buttonVariants({ variant: "ghost" })}
              to={link.href}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/honeypage">
                <Button variant="outline">Honeypage</Button>
              </Link>
              <Button variant="outline" className="hover:bg-red-400 dark:hover:bg-red-900 hover:text-white" onClick={logout}>Logout</Button>
              <div className="flex items-center gap-2 pl-2 border-l group relative">
                <img
                  src={user.avatar ? (user.avatar) : getAvatarUrl(user.username)}
                  alt={user.username}
                  referrerPolicy="no-referrer"
                  className="border-2 border-neutral-300 dark:border-neutral-800 w-9 h-9 rounded-md cursor-pointer object-cover"
                />
                <span className="absolute top-10 bg-white dark:bg-black text-black dark:text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {user.username}
                </span>
              </div>
            </div>
          ) : (
            <Button onClick={() => googleLogin()} className="hover:cursor-pointer ml-4">Login with Google</Button>
          )}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <Button size="icon" variant="outline" className="lg:hidden">
            <MenuToggle
              strokeWidth={2.5}
              open={open}
              onOpenChange={setOpen}
              className="size-6"
            />
          </Button>
          <SheetContent
            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
            showClose={false}
            side="left"
          >
            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
              <>
                <Link to="/home"
                  className={buttonVariants({
                    variant: "ghost",
                    className: "justify-start",
                  })}
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                
                {links.map((link) => (
                  <Link
                    key={link.href}
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    to={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {user && (
                  <Link to="/dashboard"
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </>
              
            </div>
            <SheetFooter>
              <div className="flex w-full">
              {user ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex w-full items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <ThemeToggle/>
                    </div>
                    <div className="flex">
                      <p className="text-3xl text-white font-light dark:text-neutral-800 pb-2">|</p>
                    </div>
                    <span className="flex text-sm gap-3 items-center">
                      <img
                        src={user.avatar 
                              ? `${import.meta.env.VITE_AUTH_SERVICE_URL}/api/auth/avatar-proxy/?url=${encodeURIComponent(user.avatar)}`
                              : getAvatarUrl(user.username)
                            }
                        alt={user.username}
                        className="border-2 border-neutral-200 dark:border-neutral-800 w-9 h-9 rounded-md cursor-pointer object-cover"
                      />
                      <div className="flex items-center w-full">
                        <p className="text-black dark:text-neutral-300 text-lg font-inter">{user.username}</p>
                      </div>
                    </span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { logout(); setOpen(false); }}>Logout</Button>
                </div>
                
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex justify-start mb-2">
                    <ThemeToggle/>
                  </div>
                  <Button onClick={() => { googleLogin(); setOpen(false); }} className="flex w-full">Login with Google</Button>
                </div>
              )}
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}