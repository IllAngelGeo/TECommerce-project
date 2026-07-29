export default function MobileMenu() {
  return (
    <div className="dropdown relative inline-flex md:hidden [--placement:bottom-end]">

      <button
        id="mobile-menu"
        type="button"
        className="dropdown-toggle btn btn-text btn-secondary btn-square"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Menú"
      >
        <span className="icon-[tabler--menu-2] dropdown-open:hidden size-5"></span>
        <span className="icon-[tabler--x] dropdown-open:block hidden size-5"></span>
      </button>

      <ul
        className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60"
        role="menu"
        aria-labelledby="mobile-menu"
      >
        <li>
          <a className="dropdown-item" href="#">
            Products
          </a>
        </li>

        <li>
          <a className="dropdown-item" href="#">
            About
          </a>
        </li>

        <li>
          <a className="dropdown-item" href="#">
            Careers
          </a>
        </li>

        <li>
          <hr className="my-1" />
        </li>

        <li>
          <a className="dropdown-item" href="#">
            Login
          </a>
        </li>
      </ul>

    </div>
  );
}