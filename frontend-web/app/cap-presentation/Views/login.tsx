"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "../../firebase/firebase";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setErrorMessage("");

    try {
      setIsLoading(true);

      const result = await loginUser(
        username.trim(),
        password
      );

      console.log("Login correcto:", result.user);

      router.push("/cap-presentation/Views/home");
    } catch (error) {
      console.error("ERROR LOGIN:", error);

      setErrorMessage(
        "No pudimos iniciar sesión. Verifica tu correo y contraseña."
      );
    } finally {
      setIsLoading(false);
    }
  };


  // =========================================================
  // VISTA
  // =========================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* =====================================================
          DECORACIÓN DE FONDO
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
            bg-white/[0.04]
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
            bg-white/[0.035]
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
          py-6
          sm:px-6
          lg:px-10
        "
      >

        <section
          className="
            grid
            w-full
            max-w-[1450px]
            overflow-hidden
            rounded-[32px]
            border
            border-white/10
            bg-[#0a0a0a]
            shadow-[0_30px_100px_rgba(0,0,0,0.65)]
            lg:min-h-[850px]
            lg:grid-cols-[1.08fr_0.92fr]
          "
        >

          {/* =================================================
              PANEL IZQUIERDO
          ================================================== */}
{/* =================================================
    PANEL IZQUIERDO - VISUAL TECOMMERCE
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
  {/* Iluminación central */}
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

  {/* Iluminación superior */}
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

  {/* Iluminación inferior */}
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

  {/* Círculo exterior */}
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

  {/* Círculo intermedio */}
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

  {/* Círculo interior */}
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

  {/* Línea superior */}
  <div
    className="
      absolute
      left-10
      right-10
      top-10
      flex
      items-center
      gap-3
    "
  >
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    <div className="h-1.5 w-1.5 rounded-full bg-white/25" />

    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>

  {/* Logo */}
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
    {/* Halo detrás del logo */}
    <div
      className="
        absolute
        h-[340px]
        w-[340px]
        rounded-full
        bg-white/[0.025]
        blur-[50px]
        xl:h-[390px]
        xl:w-[390px]
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
        transition-transform
        duration-700
        hover:scale-[1.025]
      "
    />
  </div>

  {/* Decoración esquina superior izquierda */}
  <div className="absolute left-8 top-8 h-8 w-8 border-l border-t border-white/10" />

  {/* Decoración esquina superior derecha */}
  <div className="absolute right-8 top-8 h-8 w-8 border-r border-t border-white/10" />

  {/* Decoración esquina inferior izquierda */}
  <div className="absolute bottom-8 left-8 h-8 w-8 border-b border-l border-white/10" />

  {/* Decoración esquina inferior derecha */}
  <div className="absolute bottom-8 right-8 h-8 w-8 border-b border-r border-white/10" />

  {/* Línea inferior */}
  <div
    className="
      absolute
      bottom-10
      left-10
      right-10
      h-[1px]
      bg-gradient-to-r
      from-transparent
      via-white/[0.08]
      to-transparent
    "
  />
</div>
          {/* =================================================
              PANEL LOGIN
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-center
              bg-[#080808]
              px-6
              py-12
              sm:px-10
              lg:px-14
              xl:px-20
            "
          >

            <div className="w-full max-w-[460px]">

              {/* Logo móvil */}

              <div className="mb-9 flex justify-center lg:hidden">

                <Image
                  src="/Images/logo_ecommerce.png"
                  alt="TeCommerce"
                  width={150}
                  height={150}
                  priority
                  className="object-contain"
                />

              </div>

              {/* Encabezado */}

              <div className="mb-9">

                <p
                  className="
                    mb-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-white/35
                  "
                >
                  Bienvenido de nuevo
                </p>

                <h1
                  className="
                    text-4xl
                    font-semibold
                    tracking-[-0.04em]
                    text-white
                    sm:text-5xl
                  "
                >
                  Iniciar sesión
                </h1>

                <p className="mt-4 text-sm leading-6 text-white/40">
                  Ingresa a tu cuenta para continuar comprando
                  en TeCommerce.
                </p>

              </div>

              {/* =================================================
                  ERROR
              ================================================== */}

              {errorMessage && (

                <div
                  className="
                    mb-6
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

                  <span className="mt-[2px]">
                    !
                  </span>

                  <span>
                    {errorMessage}
                  </span>

                </div>

              )}

              {/* =================================================
                  FORMULARIO
              ================================================== */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-white/70
                    "
                  >
                    Correo electrónico
                  </label>

                  <div className="group relative">

                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                      "
                    >
                      <Image
                        src="https://res.cloudinary.com/demobew9m/image/upload/v1782205178/usuario_vs8oyo.png"
                        alt=""
                        width={18}
                        height={18}
                        className="opacity-55"
                      />
                    </div>

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      placeholder="correo@ejemplo.com"
                      required
                      className="
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
                      "
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="
                        text-sm
                        font-medium
                        text-white/70
                      "
                    >
                      Contraseña
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        console.log("Recuperar contraseña")
                      }
                      className="
                        text-xs
                        font-medium
                        text-white/40
                        transition
                        hover:text-white
                      "
                    >
                      ¿Olvidaste tu contraseña?
                    </button>

                  </div>

                  <div className="relative">

                    <Image
                      src="https://res.cloudinary.com/demobew9m/image/upload/v1782205176/candado_iplsp7.png"
                      alt=""
                      width={18}
                      height={18}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        opacity-55
                      "
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Ingresa tu contraseña"
                      required
                      className="
                        h-[54px]
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.045]
                        pl-12
                        pr-14
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
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
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
                        opacity-55
                        transition
                        hover:bg-white/10
                        hover:opacity-100
                      "
                    >

                      <Image
                        src={
                          showPassword
                            ? "https://res.cloudinary.com/demobew9m/image/upload/v1782205176/ojoabierto_jzqvxk.png"
                            : "https://res.cloudinary.com/demobew9m/image/upload/v1782205177/ojocerrado_vlkzkj.png"
                        }
                        alt=""
                        width={19}
                        height={19}
                      />

                    </button>

                  </div>

                </div>

                {/* LOGIN */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    flex
                    h-[54px]
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-sm
                    font-semibold
                    text-black
                    transition-all
                    hover:bg-neutral-200
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">

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

                      Iniciando sesión...

                    </span>
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>

              </form>

              {/* REGISTRO */}

              <div
                className="
                  mt-9
                  border-t
                  border-white/[0.07]
                  pt-7
                  text-center
                "
              >

                <p className="text-sm text-white/40">

                  ¿Aún no tienes una cuenta?{" "}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/cap-presentation/Views/registrate"
                      )
                    }
                    className="
                      font-semibold
                      text-white
                      transition
                      hover:text-white/65
                    "
                  >
                    Crear cuenta
                  </button>

                </p>

              </div>

              {/* FOOTER */}

              <p
                className="
                  mt-10
                  text-center
                  text-[11px]
                  leading-5
                  text-white/20
                "
              >
                Al continuar aceptas los términos y condiciones
                y el aviso de privacidad de TeCommerce.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}