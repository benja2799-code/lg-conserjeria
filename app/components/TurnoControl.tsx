"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type UsuarioSistema = {
  id: string;
  nombre: string;
  rol: string;
  email: string;
};

type Turno = {
  id: string;
  usuario_id: string | null;
  nombre_conserje: string;
  rol: string | null;
  tipo_turno: string;
  hora_inicio: string;
  hora_termino: string | null;
  estado: string;
};

export default function TurnoControl() {
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);
  const [nombreConserje, setNombreConserje] = useState("");
  const [cargando, setCargando] = useState(true);

  const obtenerTipoTurnoAutomatico = () => {
    const hora = new Date().getHours();

    if (hora >= 8 && hora < 20) {
      return "08:00 - 20:00";
    }

    return "20:00 - 08:00";
  };

  const cargarDatos = async () => {
    setCargando(true);

    const {
      data: { user },
      error: errorUser,
    } = await supabase.auth.getUser();

    if (errorUser || !user) {
      setCargando(false);
      return;
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from("usuarios")
      .select("id, nombre, rol, activo")
      .eq("id", user.id)
      .single();

    if (errorPerfil || !perfil || !perfil.activo) {
      setCargando(false);
      return;
    }

    const usuarioSistema = {
      id: perfil.id,
      nombre: perfil.nombre,
      rol: perfil.rol,
      email: user.email || "",
    };

    setUsuario(usuarioSistema);

    const { data: turno, error: errorTurno } = await supabase
      .from("turnos")
      .select("*")
      .eq("usuario_id", user.id)
      .eq("estado", "ACTIVO")
      .order("hora_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorTurno) {
      console.error(errorTurno);
      setCargando(false);
      return;
    }

    setTurnoActivo(turno || null);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const iniciarTurno = async () => {
    if (!usuario) {
      alert("No se encontró usuario conectado.");
      return;
    }

    if (!nombreConserje.trim()) {
      alert("Debes ingresar el nombre del conserje que toma el turno.");
      return;
    }

    const { error } = await supabase.from("turnos").insert({
      usuario_id: usuario.id,
      nombre_conserje: nombreConserje.trim(),
      rol: usuario.rol,
      tipo_turno: obtenerTipoTurnoAutomatico(),
      estado: "ACTIVO",
      hora_inicio: new Date().toISOString(),
    });

    if (error) {
      alert(`Error al iniciar turno: ${error.message}`);
      return;
    }

    setNombreConserje("");
    await cargarDatos();
    window.location.reload();
  };

  const finalizarTurno = async () => {
    if (!turnoActivo) return;

    const confirmar = confirm("¿Deseas finalizar el turno activo?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("turnos")
      .update({
        estado: "FINALIZADO",
        hora_termino: new Date().toISOString(),
      })
      .eq("id", turnoActivo.id);

    if (error) {
      alert(`Error al finalizar turno: ${error.message}`);
      return;
    }

    await cargarDatos();
    window.location.reload();
  };

  if (cargando) {
    return (
      <div className="border-b border-slate-200 bg-white px-8 py-3">
        <p className="text-sm font-bold text-[#0B1F3A]">
          Cargando turno...
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200 bg-white px-8 py-3">
      {turnoActivo ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
              TURNO ACTIVO
            </span>

            <p className="text-sm font-black text-[#0B1F3A]">
              {turnoActivo.nombre_conserje}
            </p>

            <span className="text-sm text-slate-300">|</span>

            <p className="text-sm font-bold text-slate-600">
              {turnoActivo.tipo_turno}
            </p>

            <span className="text-sm text-slate-300">|</span>

            <p className="text-sm text-slate-500">
              Inicio:{" "}
              {new Date(turnoActivo.hora_inicio).toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <button
            onClick={finalizarTurno}
            className="w-fit rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            Finalizar turno
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
              SIN TURNO
            </span>

            <input
              type="text"
              value={nombreConserje}
              onChange={(e) => setNombreConserje(e.target.value)}
              placeholder="Nombre del conserje de turno"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-[#D9A520] md:w-72"
            />

            <div className="w-fit rounded-xl bg-[#F8FAFC] px-4 py-2 text-sm font-bold text-[#0B1F3A]">
              {obtenerTipoTurnoAutomatico()}
            </div>
          </div>

          <button
            onClick={iniciarTurno}
            className="w-fit rounded-xl bg-[#0B1F3A] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#163B73]"
          >
            Iniciar turno
          </button>
        </div>
      )}
    </div>
  );
}