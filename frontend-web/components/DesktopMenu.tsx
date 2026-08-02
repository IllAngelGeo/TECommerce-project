import Link from "next/link";
import CategoriasDropdown from "./CategoriasDropdown";

export default function DesktopMenu() {
  return (
    <div className="navbar-center hidden md:flex">
      <ul className="flex items-center gap-8">

        <CategoriasDropdown />

        <li>
          <Link
            href="/ofertas"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Ofertas
          </Link>
        </li>

        <li>
          <Link
            href="/mis-compras"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Mis compras
          </Link>
        </li>

      </ul>
    </div>
  );
} 