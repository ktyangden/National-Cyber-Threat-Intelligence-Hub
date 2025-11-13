import React from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggle } from "@/components/menu-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNavigate, Link } from "react-router-dom";

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const links = [
    {
      label: "About",
      href: "/about",
    }
  ];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/home">
          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dykzzd9sy/image/upload/v1763040855/logo_cykuw9.png"
              className="size-6"
            />
            <p className="font-inter text-lg font-bold">THREAT VISTA</p>
          </div>
        </Link>
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <a
              className={buttonVariants({ variant: "ghost" })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
          <Button variant="outline" onClick={() => {
            navigate("/honeypage");
            // Scroll to features after navigation
            setTimeout(() => {
              const element = document.getElementById("features");
              element?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}>
            Honeypage
          </Button>
            <div className="flex items-center gap-2">
              <Link to="/threat-feeds">
                <Button variant="outline">Threat Feeds</Button>
              </Link>
            </div>
          <ThemeToggle />
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
                >
                  Home
                </Link>
                <Link to="/threat-feeds"
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                  >
                    Threat Feeds
                  </Link>
                  <Link to="/honeypage"
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                  >
                    Honeypage
                  </Link>
                {links.map((link) => (
                  <a
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            </div>
            <SheetFooter>
              <div className="flex">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex w-full items-center gap-2">
                    <div className="flex items-center">
                      <ThemeToggle/>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-3xl text-white font-light dark:text-neutral-800 pb-2">|</p>
                      <div className="flex items-center justify-center">
                        <p className="text-lg text-black font-bold dark:text-neutral-400">THREAT VISTA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
