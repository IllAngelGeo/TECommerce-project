import Link from "next/link";

export default function CartButton() {
  return (
    <Link
      href="/carrito"
      className="relative flex items-center justify-center rounded-xl p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
      aria-label="Carrito de compras"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </Link>
  );
}