"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [conserje, setConserje] = useState("Giovanny Troncoso");
  const [turno, setTurno] = useState("08:00 - 20:00");

  useEffect(() => {
    const configuracionGuardada = localStorage.getItem("configuracion");

    if (configuracionGuardada) {
      const configuracion = JSON.parse(configuracionGuardada);

      setConserje(configuracion.conserje || "Giovanny Troncoso");
      setTurno(configuracion.turno || "08:00 - 20:00");
    }
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h2 className="text-xl font-bold">Conserjería</h2>
        <p className="text-sm text-slate-500">Control operacional del edificio</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">{conserje}</p>
          <p className="text-sm text-slate-500">Turno {turno}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#061A33] font-semibold text-white">
          {conserje.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}