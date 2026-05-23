import { supabase } from "./supabase";

type RegistrarEventoProps = {
  modulo: string;
  accion: string;
  descripcion: string;
  referencia_id?: string | null;
  referencia_tabla?: string | null;
};

export async function registrarEvento({
  modulo,
  accion,
  descripcion,
  referencia_id = null,
  referencia_tabla = null,
}: RegistrarEventoProps) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let usuarioNombre = "Usuario no identificado";
    let usuarioRol = "SIN ROL";

    if (typeof window !== "undefined") {
      const usuarioGuardado = localStorage.getItem("usuarioSistema");

      if (usuarioGuardado) {
        try {
          const usuario = JSON.parse(usuarioGuardado);

          usuarioNombre =
            usuario.nombre || usuario.email || "Usuario no identificado";

          usuarioRol = usuario.rol || "SIN ROL";
        } catch {
          usuarioNombre = "Usuario no identificado";
          usuarioRol = "SIN ROL";
        }
      }
    }

    const { data, error } = await supabase
      .from("registro_sistema")
      .insert({
        modulo,
        accion,
        descripcion,
        usuario_id: user?.id || null,
        usuario_nombre: usuarioNombre,
        usuario_rol: usuarioRol,
        referencia_id,
        referencia_tabla,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error al registrar evento:", error);
      alert(`Error al registrar evento: ${error.message}`);
      return null;
    }

    console.log("Evento registrado correctamente:", data);
    return data;
  } catch (error) {
    console.error("Error inesperado al registrar evento:", error);
    alert("Error inesperado al registrar evento.");
    return null;
  }
}