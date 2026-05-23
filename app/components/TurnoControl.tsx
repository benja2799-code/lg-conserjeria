"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

type Turno = {
  id: string;
  usuario_id: string | null;
  nombre_conserje: string;
  rol: string | null;
  tipo_turno: string;
  hora_inicio: string;
  hora_termino: string | null;
  estado: string;
  created_at: string;
};

type UsuarioSistema = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
};

export default function TurnoControl() {
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);
  const [nombreConserje, setNombreConserje] = useState("");
  const [tipoTurno, setTipoTurno] = useState("08:00 - 20:00");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const obtenerUsuarioSistema = (): UsuarioSistema | null => {
    if (typeof window === "undefined") return null;

    const usuarioGuardado = localStorage.getItem("usuarioSistema");

    if (!usuarioGuardado) return null;

    try {
      return JSON.parse(usuarioGuardado);
    } catch {
      return null;
    }
  };

  const cargarTurnoActivo = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("turnos")
      .select("*")
      .eq("estado", "ACTIVO")
      .order("hora_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error al cargar turno activo:", error);
      setCargando(false);
      return;
    }

    if (data) {
      setTurnoActivo(data as Turno);

      localStorage.setItem(
        "turnoActivo",
        JSON.stringify({
          id: data.id,
          nombre_conserje: data.nombre_conserje,
          tipo_turno: data.tipo_turno,
          hora_inicio: data.hora_inicio,
          estado: data.estado,
        })
      );
    } else {
      setTurnoActivo(null);
      localStorage.removeItem("turnoActivo");
    }

    window.dispatchEvent(new Event("storage"));
    setCargando(false);
  };

  useEffect(() => {
    const usuario = obtenerUsuarioSistema();

    if (usuario?.nombre) {
      setNombreConserje(usuario.nombre);
    }

    cargarTurnoActivo();
  }, []);

  const iniciarTurno = async () => {
    if (!nombreConserje.trim()) {
      alert("Debes ingresar el nombre del conserje.");
      return;
    }

    if (turnoActivo) {
      alert("Ya existe un turno activo. Debes finalizarlo antes de iniciar otro.");
      return;
    }

    setGuardando(true);

    const usuario = obtenerUsuarioSistema();

    const { data: authData } = await supabase.auth.getUser();

    const usuarioId = authData.user?.id || usuario?.id || null;
    const rolUsuario = usuario?.rol || "CONSERJE";

    const { data, error } = await supabase
      .from("turnos")
      .insert({
        usuario_id: usuarioId,
        nombre_conserje: nombreConserje.trim(),
        rol: rolUsuario,
        tipo_turno: tipoTurno,
        hora_inicio: new Date().toISOString(),
        hora_termino: null,
        estado: "ACTIVO",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error al iniciar turno:", error);
      alert(`Error al iniciar turno: ${error.message}`);
      setGuardando(false);
      return;
    }

    await registrarEvento({
      modulo: "Asistencia",
      accion: "Iniciar turno",
      descripcion: `Se inició el turno de ${nombreConserje.trim()} en horario ${tipoTurno}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "turnos",
    });

    setTurnoActivo(data as Turno);

    localStorage.setItem(
      "turnoActivo",
      JSON.stringify({
        id: data.id,
        nombre_conserje: data.nombre_conserje,
        tipo_turno: data.tipo_turno,
        hora_inicio: data.hora_inicio,
        estado: data.estado,
      })
    );

    window.dispatchEvent(new Event("storage"));

    setGuardando(false);

    alert("Turno iniciado correctamente.");
  };

  const finalizarTurno = async () => {
    if (!turnoActivo) {
      alert("No existe un turno activo para finalizar.");
      return;
    }

    const confirmar = confirm(
      `¿Deseas finalizar el turno de ${turnoActivo.nombre_conserje}?`
    );

    if (!confirmar) return;

    setGuardando(true);

    const horaTermino = new Date().toISOString();

    const { error } = await supabase
      .from("turnos")
      .update({
        estado: "FINALIZADO",
        hora_termino: horaTermino,
      })
      .eq("id", turnoActivo.id);

    if (error) {
      console.error("Error al finalizar turno:", error);
      alert(`Error al finalizar turno: ${error.message}`);
      setGuardando(false);
      return;
    }

    await registrarEvento({
      modulo: "Asistencia",
      accion: "Finalizar turno",
      descripcion: `Se finalizó el turno de ${turnoActivo.nombre_conserje}.`,
      referencia_id: turnoActivo.id,
      referencia_tabla: "turnos",
    });

    setTurnoActivo(null);
    localStorage.removeItem("turnoActivo");
    window.dispatchEvent(new Event("storage"));

    setGuardando(false);

    alert("Turno finalizado correctamente.");
  };

  const formatearFechaHora = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-[#0B1F3A]">
          Cargando control de turno...
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-[#D9A520]">
            Control de turno
          </p>

          <h2 className="text-xl font-black text-[#0B1F3A]">
            {turnoActivo ? "Turno activo" : "Ingreso de turno"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {turnoActivo
              ? `Conserje: ${turnoActivo.nombre_conserje} · ${turnoActivo.tipo_turno}`
              : "Registra el inicio del turno del personal de conserjería."}
          </p>
        </div>

        {turnoActivo ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
              <p className="text-xs font-bold uppercase text-slate-400">
                Inicio
              </p>
              <p className="text-sm font-bold text-[#0B1F3A]">
                {formatearFechaHora(turnoActivo.hora_inicio)}
              </p>
            </div>

            <button
              onClick={finalizarTurno}
              disabled={guardando}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Finalizando..." : "Finalizar turno"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[240px_180px_160px]">
            <input
              value={nombreConserje}
              onChange={(e) => setNombreConserje(e.target.value)}
              placeholder="Nombre del conserje"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
            />

            <select
              value={tipoTurno}
              onChange={(e) => setTipoTurno(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
            >
              <option value="08:00 - 20:00">08:00 - 20:00</option>
              <option value="20:00 - 08:00">20:00 - 08:00</option>
            </select>

            <button
              onClick={iniciarTurno}
              disabled={guardando}
              className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Iniciando..." : "Iniciar turno"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}