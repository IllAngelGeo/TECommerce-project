import ComponentsDropdown from "./ComponentsDropdown";

export default function ProductsDropdown() {
  return (
    <li className="dropdown relative inline-flex [--auto-close:inside] [--offset:9]">

      <button
        id="dropdown-products"
        type="button"
        className="dropdown-toggle dropdown-open:bg-base-content/10 dropdown-open:text-base-content"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        Products
        <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4"></span>
      </button>

      <ul
        className="dropdown-menu dropdown-open:opacity-100 hidden w-48"
        role="menu"
        aria-labelledby="dropdown-products"
      >
        <li>
          <a className="dropdown-item" href="#">
            Templates
          </a>
        </li>

        <li>
          <a className="dropdown-item" href="#">
            UI Kits
          </a>
        </li>

        <ComponentsDropdown />

      </ul>

    </li>
  );
}