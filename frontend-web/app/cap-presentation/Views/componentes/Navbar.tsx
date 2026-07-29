interface NavbarProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
  mostrarFiltros: boolean;
  setMostrarFiltros: (value: boolean) => void;
}

export default function Navbar({ busqueda, setBusqueda, mostrarFiltros, setMostrarFiltros }: NavbarProps) {
  return (
    <input 
      type="text" 
      placeholder="Buscar productos..." 
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-zinc-500"
    />
  );
}
