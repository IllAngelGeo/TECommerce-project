export default function VendorDropdown() {
  return (
    <li className="dropdown relative [--auto-close:inside] [--offset:10] [--placement:right-start]">

      <button
        id="dropdown-vendor"
        className="dropdown-toggle dropdown-item dropdown-open:bg-base-content/10 dropdown-open:text-base-content justify-between"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        Vendor
        <span className="icon-[tabler--chevron-right] size-4"></span>
      </button>

      <ul
        className="dropdown-menu dropdown-open:opacity-100 hidden w-48"
        role="menu"
        aria-labelledby="dropdown-vendor"
      >

        <li>
          <a className="dropdown-item" href="#">
            Data Tables
            <span className="badge badge-sm badge-soft badge-primary rounded-full">
              Pro
            </span>
          </a>
        </li>

        <li>
          <a className="dropdown-item" href="#">
            Apex Charts
            <span className="badge badge-sm badge-soft badge-primary rounded-full">
              Pro
            </span>
          </a>
        </li>

        <li>
          <a className="dropdown-item" href="#">
            Clipboard
          </a>
        </li>

      </ul>

    </li>
  );
}