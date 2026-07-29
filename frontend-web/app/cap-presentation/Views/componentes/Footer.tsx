import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-950 bg-black py-6 mt-12 text-center text-xs text-zinc-600 w-full">
      &copy; {new Date().getFullYear()} TeCommerce. Todos los derechos reservados.
    </footer>
  );
}
