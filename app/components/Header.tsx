"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MenuIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 21V3h12v18" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"
      />
    </svg>
  );
}

type PerfilUsuario = {
  id: string;
  nombre: string;
  rol: string;
  activo: boolean;
};

type TurnoActivo = {
  id: string;
  tipo_turno: string;
  hora_inicio: string;
  estado: string;
};

export default function Header() {
  const [nombre, setNombre] = useState("Usuario");
  const [rol, setRol] = useState("Cargando...");
  const [turno, setTurno] = useState("Sin turno activo");

  useEffect(() => {
    const cargarDatos = async () => {
      const {
        data: { user },
        error: errorUser,
      } = await supabase.auth.getUser();

      if (errorUser || !user) {
        setNombre("Usuario");
        setRol("SIN SESIÓN");
        setTurno("Sin turno activo");
        return;
      }

      const { data: perfil, error: errorPerfil } = await supabase
        .from("usuarios")
        .select("id, nombre, rol, activo")
        .eq("id", user.id)
        .single();

      if (errorPerfil || !perfil) {
        console.error("Error perfil usuario:", errorPerfil);
        setNombre(user.email || "Usuario");
        setRol("SIN ROL");
        setTurno("Sin turno activo");
        return;
      }

      const perfilUsuario = perfil as PerfilUsuario;

      if (!perfilUsuario.activo) {
        setNombre(perfilUsuario.nombre || "Usuario");
        setRol("USUARIO INACTIVO");
        setTurno("Sin turno activo");
        return;
      }

      setNombre(perfilUsuario.nombre || "Usuario");
      setRol(perfilUsuario.rol || "SIN ROL");

      localStorage.setItem(
        "usuarioSistema",
        JSON.stringify({
          id: perfilUsuario.id,
          nombre: perfilUsuario.nombre,
          rol: perfilUsuario.rol,
          email: user.email,
        })
      );

      const { data: turnoActivo, error: errorTurno } = await supabase
  .from("turnos")
  .select("id, nombre_conserje, tipo_turno, hora_inicio, estado")
        .eq("usuario_id", user.id)
        .eq("estado", "ACTIVO")
        .order("hora_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errorTurno) {
        console.error("Error turno activo:", errorTurno);
        setTurno("Sin turno activo");
        return;
      }

      if (turnoActivo) {
  const turnoData = turnoActivo as TurnoActivo & {
    nombre_conserje: string;
  };

  setNombre(turnoData.nombre_conserje || perfilUsuario.nombre || "Usuario");
  setTurno(turnoData.tipo_turno);
} else {
  setTurno("Sin turno activo");
}
    };

    cargarDatos();
  }, []);

  const cerrarSesion = async () => {
    const confirmar = confirm("¿Deseas cerrar sesión?");

    if (!confirmar) return;

    localStorage.removeItem("usuarioSistema");

    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  const inicial = nombre.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-8 py-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#0B1F3A] transition hover:bg-slate-100"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF7E0] text-[#D9A520] shadow-sm">
              <BuildingIcon />
            </div>

            <div>
              <h2 className="text-xl font-black leading-tight text-[#0B1F3A]">
                Conserjería
              </h2>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Control operacional
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="font-black leading-tight text-[#0B1F3A]">
              {nombre}
            </p>

            <p className="text-sm font-bold text-[#D9A520]">{rol}</p>

            <p
              className={`text-xs font-semibold ${
                turno === "Sin turno activo"
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {turno === "Sin turno activo"
                ? "Sin turno activo"
                : `Turno activo ${turno}`}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1F3A] text-lg font-black text-white shadow-md">
            {inicial}
          </div>

          <button
            onClick={cerrarSesion}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-50"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}