import React from 'react';

export default function Hero() {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
      <div className="space-y-4 text-center md:text-left">
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Oferta Especial</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
          HASTA 30% <br /> 
          <span className="text-zinc-300 font-medium text-2xl md:text-3xl">DE DESCUENTO</span>
        </h1>
        <button className="mt-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all mx-auto md:mx-0">
          Comprar ahora <span>→</span>
        </button>
      </div>
      
      <div className="text-zinc-800 text-7xl md:text-9xl font-light pr-4 select-none hidden sm:block">
        👜
      </div>
    </section>
  );
}
