"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { registerUser } from "../../../firebase/firebase";

// IMPORTANTE:
// Si ya tienes un archivo API_URL para tu web, puedes reemplazar
// esta constante por:
// import { API_URL } from "../../../constants/api_url";

const API_URL = "http://localhost:8080";

export default function RegistroPage() {
  const router = useRouter();

  // =========================================================
  // PASOS
  // =========================================================

  const [step, setStep] = useState(1);

  // =========================================================
  // DATOS PERSONALES
  // =========================================================

  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaTexto, setFechaTexto] = useState("");
  const [telefono, setTelefono] = useState("");

  // =========================================================
  // DATOS DE CUENTA
  // =========================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================================================
  // ESTADOS
  // =========================================================

  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // =========================================================
  // VALIDAR PASO 1
  // =========================================================

  const validarPaso1 = () => {
    const nombreLimpio = nombre.trim();
    const paternoLimpio = apellidoPaterno.trim();
    const maternoLimpio = apellidoMaterno.trim();

    if (
      !nombreLimpio ||
      !paternoLimpio ||
      !maternoLimpio ||
      !fechaTexto ||
      !telefono
    ) {
      setMensaje("Completa todos los campos.");
      return false;
    }

    const telefonoLimpio = telefono.replace(/\D/g, "");

    if (telefonoLimpio.length !== 10) {
      setMensaje(
        "Ingresa un número de teléfono válido de 10 dígitos."
      );
      return false;
    }

    const fechaNacimiento = new Date(
      `${fechaTexto}T00:00:00`
    );

    const hoy = new Date();

    if (
      Number.isNaN(fechaNacimiento.getTime()) ||
      fechaNacimiento > hoy
    ) {
      setMensaje("Ingresa una fecha de nacimiento válida.");
      return false;
    }

    setMensaje("");
    return true;
  };

  // =========================================================
  // VALIDAR PASO 2
  // =========================================================

  const validarPaso2 = () => {
    const correo = email.trim().toLowerCase();

    if (!correo || !password || !confirmPassword) {
      setMensaje("Completa todos los campos.");
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {
      setMensaje(
        "Ingresa un correo electrónico válido."
      );
      return false;
    }

    if (password.length < 6) {
      setMensaje(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return false;
    }

    if (password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden.");
      return false;
    }

    setMensaje("");
    return true;
  };

  // =========================================================
  // NAVEGACIÓN ENTRE PASOS
  // =========================================================

  const handleSiguiente = () => {
    if (!validarPaso1()) return;

    setStep(2);
    setMensaje("");
  };

  const handleAtras = () => {
    setStep(1);
    setMensaje("");
  };

  // =========================================================
  // REGISTRO
  // =========================================================

  const handleRegister = async () => {
    if (isLoading) return;
    if (!validarPaso2()) return;

    try {
      setIsLoading(true);
      setMensaje("");

      const correo = email
        .trim()
        .toLowerCase();

      // =====================================================
      // 1. FIREBASE AUTH
      // =====================================================

      console.log(
        "1. Iniciando registro en Firebase..."
      );

      const result = await registerUser(
        correo,
        password
      );

      const firebaseUser = result.user;

      console.log(
        "2. Usuario creado:",
        firebaseUser.uid
      );

      // =====================================================
      // 2. BACKEND GO
      // =====================================================

      const telefonoLimpio =
        telefono.replace(/\D/g, "");

      const payload = {
        id_firebase: firebaseUser.uid,
        email: firebaseUser.email ?? correo,
        nombre: nombre.trim(),
        apellido_paterno:
          apellidoPaterno.trim(),
        apellido_materno:
          apellidoMaterno.trim(),
        fecha_nacimiento: fechaTexto,
        telefono: telefonoLimpio,
        provider: "firebase",
      };

      console.log(
        "3. Enviando al backend:",
        payload
      );

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log(
        "4. Backend status:",
        response.status
      );

      console.log(
        "5. Backend response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Error del servidor (${response.status})`
        );
      }

      console.log(
        "6. Registro completado correctamente."
      );

      // =====================================================
      // 3. NAVEGAR
      // =====================================================

      router.push(
        "/cap-presentation/Views/home"
      );
    } catch (error: any) {
      console.error(
        "Error registrando usuario:",
        error
      );

      const codigo = error?.code ?? "";
      const mensajeError =
        error?.message ?? "";

      if (
        codigo ===
        "auth/email-already-in-use"
      ) {
        setMensaje(
          "Este correo electrónico ya está registrado."
        );
      } else if (
        codigo === "auth/weak-password"
      ) {
        setMensaje(
          "La contraseña es demasiado débil."
        );
      } else if (
        codigo === "auth/invalid-email"
      ) {
        setMensaje(
          "El correo electrónico no es válido."
        );
      } else if (
        codigo ===
        "auth/network-request-failed"
      ) {
        setMensaje(
          "No fue posible comunicarse con Firebase. Verifica tu conexión."
        );
      } else if (
        mensajeError
          .toLowerCase()
          .includes("fetch")
      ) {
        setMensaje(
          "No se pudo conectar con el servidor de TeCommerce."
        );
      } else {
        setMensaje(
          mensajeError ||
            "No fue posible crear tu cuenta. Intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // TELÉFONO
  // =========================================================

  const formatearTelefono = (
    valor: string
  ) => {
    const soloDigitos =
      valor.replace(/\D/g, "");

    const limitado =
      soloDigitos.slice(0, 10);

    if (limitado.length <= 3) {
      return limitado;
    }

    if (limitado.length <= 6) {
      return `(${limitado.slice(
        0,
        3
      )}) ${limitado.slice(3)}`;
    }

    return `(${limitado.slice(
      0,
      3
    )}) ${limitado.slice(
      3,
      6
    )}-${limitado.slice(6, 10)}`;
  };

  const handleTelefonoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTelefono(
      formatearTelefono(e.target.value)
    );
  };

  // =========================================================
  // CLASE BASE INPUT
  // =========================================================

  const inputClass = `
    h-[54px]
    w-full
    rounded-xl
    border
    border-white/10
    bg-white/[0.045]
    pl-12
    pr-4
    text-[15px]
    text-white
    outline-none
    transition-all
    placeholder:text-white/25
    hover:border-white/20
    focus:border-white/35
    focus:bg-white/[0.065]
    focus:ring-4
    focus:ring-white/[0.035]
  `;

  // =========================================================
  // VISTA
  // =========================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* =====================================================
          FONDO
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            -left-32
            -top-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-white/[0.035]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-40
            right-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-white/[0.025]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,transparent_0%,#050505_75%)]
          "
        />

      </div>

      {/* =====================================================
          CONTENEDOR
      ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-5
          sm:px-6
          lg:px-10
        "
      >

        <section
          className="
            grid
            w-full
            max-w-[1380px]
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.08]
            bg-[#080808]
            shadow-[0_35px_120px_rgba(0,0,0,0.75)]
            lg:min-h-[800px]
            lg:grid-cols-[1.05fr_0.95fr]
          "
        >

          {/* =================================================
              PANEL IZQUIERDO
          ================================================== */}

          <div
            className="
              relative
              hidden
              overflow-hidden
              border-r
              border-white/[0.08]
              bg-[#030303]
              lg:flex
              lg:items-center
              lg:justify-center
            "
          >

            {/* ILUMINACIÓN */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[650px]
                w-[650px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-white/[0.035]
                blur-[100px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -left-40
                -top-40
                h-[420px]
                w-[420px]
                rounded-full
                bg-white/[0.025]
                blur-[90px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-48
                -right-32
                h-[500px]
                w-[500px]
                rounded-full
                bg-white/[0.03]
                blur-[110px]
              "
            />

            {/* CÍRCULOS */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[560px]
                w-[560px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-white/[0.035]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[450px]
                w-[450px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-white/[0.045]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[340px]
                w-[340px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-white/[0.055]
              "
            />

            {/* LOGO */}

            <div
              className="
                relative
                z-10
                flex
                h-[520px]
                w-[520px]
                items-center
                justify-center
                xl:h-[590px]
                xl:w-[590px]
              "
            >

              <div
                className="
                  absolute
                  h-[340px]
                  w-[340px]
                  rounded-full
                  bg-white/[0.025]
                  blur-[50px]
                "
              />

              <Image
                src="/Images/logo_ecommerce.png"
                alt="TeCommerce"
                width={500}
                height={500}
                priority
                className="
                  relative
                  z-10
                  h-auto
                  w-[75%]
                  object-contain
                  drop-shadow-[0_25px_55px_rgba(255,255,255,0.09)]
                "
              />

            </div>

            {/* ESQUINAS */}

            <div className="absolute left-8 top-8 h-8 w-8 border-l border-t border-white/10" />
            <div className="absolute right-8 top-8 h-8 w-8 border-r border-t border-white/10" />
            <div className="absolute bottom-8 left-8 h-8 w-8 border-b border-l border-white/10" />
            <div className="absolute bottom-8 right-8 h-8 w-8 border-b border-r border-white/10" />

          </div>

          {/* =================================================
              PANEL REGISTRO
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-center
              bg-[#080808]
              px-5
              py-8
              sm:px-8
              lg:px-12
              xl:px-16
            "
          >

            <div className="w-full max-w-[480px]">

              {/* LOGO MÓVIL */}

              <div className="mb-5 flex justify-center lg:hidden">

                <Image
                  src="/Images/logo_ecommerce.png"
                  alt="TeCommerce"
                  width={120}
                  height={120}
                  priority
                  className="object-contain"
                />

              </div>

              {/* CABECERA */}

              <div className="mb-6">

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    justify-between
                  "
                >

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.25em]
                      text-white/35
                    "
                  >
                    Crear cuenta
                  </p>

                  <span className="text-xs font-medium text-white/35">
                    Paso {step} de 2
                  </span>

                </div>

                <h1
                  className="
                    text-3xl
                    font-semibold
                    tracking-[-0.04em]
                    sm:text-4xl
                  "
                >
                  Únete a TeCommerce
                </h1>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-white/40
                  "
                >
                  {step === 1
                    ? "Comencemos con tu información personal."
                    : "Ahora crea los datos de acceso para tu cuenta."}
                </p>

              </div>

              {/* =================================================
                  INDICADOR
              ================================================== */}

              <div className="mb-7">

                <div className="mb-2 flex items-center justify-between">

                  <span
                    className={`
                      text-xs
                      font-medium
                      ${
                        step >= 1
                          ? "text-white"
                          : "text-white/30"
                      }
                    `}
                  >
                    Información personal
                  </span>

                  <span
                    className={`
                      text-xs
                      font-medium
                      ${
                        step === 2
                          ? "text-white"
                          : "text-white/30"
                      }
                    `}
                  >
                    Cuenta
                  </span>

                </div>

                <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">

                  <div
                    className={`
                      h-full
                      rounded-full
                      bg-white
                      transition-all
                      duration-500
                      ${
                        step === 1
                          ? "w-1/2"
                          : "w-full"
                      }
                    `}
                  />

                </div>

              </div>

              {/* =================================================
                  MENSAJE
              ================================================== */}

              {mensaje && (

                <div
                  className="
                    mb-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/[0.07]
                    px-4
                    py-3
                    text-sm
                    text-red-300
                  "
                >

                  <div
                    className="
                      mt-[2px]
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-red-400/40
                      text-[11px]
                      font-bold
                    "
                  >
                    !
                  </div>

                  <span>{mensaje}</span>

                </div>

              )}

              {/* =================================================
                  PASO 1
              ================================================== */}

              {step === 1 && (

                <div className="space-y-4">

                  {/* NOMBRE */}

                  <div>

                    <label
                      htmlFor="nombre"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-white/65
                      "
                    >
                      Nombre
                    </label>

                    <div className="relative">

                      <UserIcon />

                      <input
                        id="nombre"
                        type="text"
                        autoComplete="given-name"
                        value={nombre}
                        onChange={(e) =>
                          setNombre(e.target.value)
                        }
                        placeholder="Tu nombre"
                        className={inputClass}
                      />

                    </div>

                  </div>

                  {/* APELLIDOS */}

                  <div
                    className="
                      grid
                      gap-4
                      sm:grid-cols-2
                    "
                  >

                    <div>

                      <label
                        htmlFor="apellidoPaterno"
                        className="
                          mb-2
                          block
                          text-sm
                          font-medium
                          text-white/65
                        "
                      >
                        Apellido paterno
                      </label>

                      <div className="relative">

                        <UserIcon />

                        <input
                          id="apellidoPaterno"
                          type="text"
                          autoComplete="family-name"
                          value={apellidoPaterno}
                          onChange={(e) =>
                            setApellidoPaterno(
                              e.target.value
                            )
                          }
                          placeholder="Paterno"
                          className={inputClass}
                        />

                      </div>

                    </div>

                    <div>

                      <label
                        htmlFor="apellidoMaterno"
                        className="
                          mb-2
                          block
                          text-sm
                          font-medium
                          text-white/65
                        "
                      >
                        Apellido materno
                      </label>

                      <div className="relative">

                        <UserIcon />

                        <input
                          id="apellidoMaterno"
                          type="text"
                          value={apellidoMaterno}
                          onChange={(e) =>
                            setApellidoMaterno(
                              e.target.value
                            )
                          }
                          placeholder="Materno"
                          className={inputClass}
                        />

                      </div>

                    </div>

                  </div>

                  {/* FECHA */}

                  <div>

                    <label
                      htmlFor="fechaNacimiento"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-white/65
                      "
                    >
                      Fecha de nacimiento
                    </label>

                    <div className="relative">

                      <CalendarIcon />

                      <input
                        id="fechaNacimiento"
                        type="date"
                        value={fechaTexto}
                        onChange={(e) =>
                          setFechaTexto(
                            e.target.value
                          )
                        }
                        className={`
                          ${inputClass}
                          [color-scheme:dark]
                        `}
                      />

                    </div>

                  </div>

                  {/* TELÉFONO */}

                  <div>

                    <label
                      htmlFor="telefono"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-white/65
                      "
                    >
                      Teléfono
                    </label>

                    <div className="relative">

                      <PhoneIcon />

                      <input
                        id="telefono"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={telefono}
                        onChange={
                          handleTelefonoChange
                        }
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        className={inputClass}
                      />

                    </div>

                    <p
                      className="
                        mt-2
                        text-[11px]
                        text-white/25
                      "
                    >
                      Ingresa un número de 10 dígitos.
                    </p>

                  </div>

                  {/* SIGUIENTE */}

                  <button
                    type="button"
                    onClick={handleSiguiente}
                    className="
                      mt-2
                      flex
                      h-[54px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-white
                      text-sm
                      font-semibold
                      text-black
                      transition-all
                      hover:bg-neutral-200
                      active:scale-[0.99]
                    "
                  >
                    Continuar

                    <ArrowRightIcon />

                  </button>

                  {/* LOGIN */}

                  <div
                    className="
                      border-t
                      border-white/[0.07]
                      pt-5
                      text-center
                    "
                  >

                    <p className="text-sm text-white/40">
                      ¿Ya tienes una cuenta?{" "}

                      <button
                        type="button"
                        onClick={() =>
                          router.push("/")
                        }
                        className="
                          font-semibold
                          text-white
                          transition
                          hover:text-white/65
                        "
                      >
                        Iniciar sesión
                      </button>

                    </p>

                  </div>

                </div>

              )}

              {/* =================================================
                  PASO 2
              ================================================== */}

              {step === 2 && (

                <div className="space-y-4">

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-white/65
                      "
                    >
                      Correo electrónico
                    </label>

                    <div className="relative">

                      <EmailIcon />

                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="correo@ejemplo.com"
                        className={inputClass}
                      />

                    </div>

                  </div>

                  {/* CONTRASEÑA */}

                  <div>

                    <label
                      htmlFor="password"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-white/65
                      "
                    >
                      Contraseña
                    </label>

                    <div className="relative">

                      <LockIcon />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Mínimo 6 caracteres"
                        className={`
                          ${inputClass}
                          pr-14
                        `}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (actual) => !actual
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1
                          text-white/40
                          transition
                          hover:bg-white/10
                          hover:text-white
                        "
                      >
                        <EyeIcon
                          abierto={showPassword}
                        />
                      </button>

                    </div>

                  </div>

                  {/* CONFIRMAR */}

                  <div>

                    <label
                      htmlFor="confirmPassword"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-white/65
                      "
                    >
                      Confirmar contraseña
                    </label>

                    <div className="relative">

                      <LockIcon />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        placeholder="Repite tu contraseña"
                        className={`
                          ${inputClass}
                          pr-14
                        `}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (actual) => !actual
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1
                          text-white/40
                          transition
                          hover:bg-white/10
                          hover:text-white
                        "
                      >
                        <EyeIcon
                          abierto={
                            showConfirmPassword
                          }
                        />
                      </button>

                    </div>

                  </div>

                  {/* BOTONES */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      pt-2
                    "
                  >

                    <button
                      type="button"
                      onClick={handleAtras}
                      disabled={isLoading}
                      className="
                        flex
                        h-[54px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-white/[0.08]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <ArrowLeftIcon />

                      Atrás
                    </button>

                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="
                        flex
                        h-[54px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-white
                        text-sm
                        font-semibold
                        text-black
                        transition
                        hover:bg-neutral-200
                        active:scale-[0.99]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >

                      {isLoading ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-black/20
                              border-t-black
                            "
                          />

                          Creando...
                        </>
                      ) : (
                        <>
                          Crear cuenta

                          <CheckIcon />
                        </>
                      )}

                    </button>

                  </div>

                  {/* VOLVER AL LOGIN */}

                  <div
                    className="
                      border-t
                      border-white/[0.07]
                      pt-5
                      text-center
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/")
                      }
                      className="
                        text-sm
                        text-white/40
                        transition
                        hover:text-white
                      "
                    >
                      Ya tengo una cuenta
                    </button>

                  </div>

                </div>

              )}

              {/* FOOTER */}

              <p
                className="
                  mt-6
                  text-center
                  text-[11px]
                  leading-5
                  text-white/20
                "
              >
                Al crear una cuenta aceptas los términos y
                condiciones y el aviso de privacidad de
                TeCommerce.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

// =========================================================
// ICONOS
// =========================================================

function UserIcon() {
  return (
    <svg
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-white/35
      "
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-white/35
      "
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
      />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-white/35
      "
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-white/35
      "
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
      />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="
        pointer-events-none
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-white/35
      "
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
      />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({
  abierto,
}: {
  abierto: boolean;
}) {
  if (!abierto) {
    return (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </svg>
    );
  }

  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.24A9.77 9.77 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M6.61 6.61C3.83 8.47 2 12 2 12s3.5 8 10 8a9.7 9.7 0 0 0 4.01-.87" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}