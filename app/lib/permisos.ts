export type RolUsuario = "ADMINISTRADOR" | "SUPERVISOR" | "CONSERJE";

export function obtenerUsuarioSistema() {
  if (typeof window === "undefined") return null;

  const usuarioGuardado = localStorage.getItem("usuarioSistema");

  if (!usuarioGuardado) return null;

  try {
    return JSON.parse(usuarioGuardado);
  } catch {
    return null;
  }
}

export function obtenerRol(): RolUsuario | null {
  const usuario = obtenerUsuarioSistema();

  return usuario?.rol || null;
}

export function esAdministrador() {
  return obtenerRol() === "ADMINISTRADOR";
}

export function esSupervisor() {
  return obtenerRol() === "SUPERVISOR";
}

export function esConserje() {
  return obtenerRol() === "CONSERJE";
}

export function puedeEliminar() {
  return esAdministrador();
}

export function puedeEditarConfiguracion() {
  const rol = obtenerRol();

  return rol === "ADMINISTRADOR" || rol === "SUPERVISOR";
}

export function puedeGestionarMaestros() {
  const rol = obtenerRol();

  return rol === "ADMINISTRADOR" || rol === "SUPERVISOR";
}