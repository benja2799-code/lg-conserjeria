"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const limpiarRol = (rol: string | null | undefined) => {
    return String(rol || "CONSERJE")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const normalizarRol = (rol: string | null | undefined) => {
    const rolLimpio = limpiarRol(rol);

    if (
      rolLimpio === "ADMIN" ||
      rolLimpio === "ADMINISTRADOR" ||
      rolLimpio === "ADMINISTRACION" ||
      rolLimpio === "ADMINISTRADOR(A)"
    ) {
      return "ADMINISTRADOR";
    }

    if (rolLimpio === "SUPERVISOR" || rolLimpio === "SUPERVISORA") {
      return "SUPERVISOR";
    }

    if (
      rolLimpio === "CONSERJE" ||
      rolLimpio === "PORTERO" ||
      rolLimpio === "GUARDIA" ||
      rolLimpio === "OPERADOR"
    ) {
      return "CONSERJE";
    }

    return "CONSERJE";
  };

  const iniciarSesion = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Debes ingresar correo y contraseña.");
      return;
    }

    setCargando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setCargando(false);
      alert(`Error al iniciar sesión: ${error.message}`);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setCargando(false);
      alert("No se pudo obtener el ID del usuario.");
      return;
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from("usuarios")
      .select("id, nombre, rol, activo")
      .eq("id", userId)
      .single();

    setCargando(false);

    if (errorPerfil || !perfil) {
      console.error("Error perfil:", errorPerfil);
      alert("Este usuario no tiene rol asignado en la tabla usuarios.");
      await supabase.auth.signOut();
      return;
    }

    if (!perfil.activo) {
      alert("Este usuario está desactivado.");
      await supabase.auth.signOut();
      return;
    }

    const rolNormalizado = normalizarRol(perfil.rol);
    const nombreUsuario = perfil.nombre || email.trim();

    const usuarioGuardado = {
      id: perfil.id,
      nombre: nombreUsuario,
      email: email.trim(),
      rol: rolNormalizado,
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioGuardado));
    localStorage.setItem("usuarioSistema", JSON.stringify(usuarioGuardado));
    localStorage.setItem("rol", rolNormalizado);

    sessionStorage.setItem("usuario", JSON.stringify(usuarioGuardado));
    sessionStorage.setItem("usuarioSistema", JSON.stringify(usuarioGuardado));
    sessionStorage.setItem("rol", rolNormalizado);

    console.log("USUARIO GUARDADO LOGIN:", usuarioGuardado);

    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#0B1F3A] text-white">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 text-[#0B1220] shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-4 ring-[#0B1F3A]/10">
              <img
                src="/logo_LG.png"
                alt="Logo LG"
                className="h-full w-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
              Control Conserjería
            </p>

            <h1 className="mt-2 text-4xl font-black text-[#0B1F3A]">
              Iniciar sesión
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Ingresa con tu cuenta autorizada para acceder al sistema.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                Correo electrónico
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.cl"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    iniciarSesion();
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={iniciarSesion}
              disabled={cargando}
              className="w-full rounded-xl bg-[#0B1F3A] px-5 py-3 font-bold text-white shadow-md transition hover:bg-[#163B73] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? "Ingresando..." : "Ingresar al sistema"}
            </button>
          </div>

          <div className="mt-6 rounded-xl bg-[#F8FAFC] p-4 text-center text-sm text-slate-500">
            Sistema privado de control operacional.
          </div>
        </div>
      </div>
    </main>
  );
}