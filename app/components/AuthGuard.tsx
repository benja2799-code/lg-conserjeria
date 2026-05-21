"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && pathname !== "/login") {
        router.replace("/login");
        return;
      }

      if (session && pathname === "/login") {
        router.replace("/");
        return;
      }

      setCargando(false);
    };

    verificarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== "/login") {
        router.replace("/login");
      }

      if (session && pathname === "/login") {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (cargando && pathname !== "/login") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-[#0B1F3A]">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}