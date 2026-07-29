import ProductsDropdown from "./ProductsDropdown";

export default function DesktopMenu() {
  return (
    <div className="navbar-center hidden md:flex">
      <ul className="menu menu-horizontal gap-2 p-0">

        <ProductsDropdown />

        <li>
          <a href="#">About</a>
        </li>

        <li>
          <a href="#">Careers</a>
        </li>

      </ul>
    </div>
  );
}