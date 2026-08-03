import Logo from "./Navbar/Logo";
import DesktopMenu from "./Navbar/DesktopMenu";
import SearchBar from "./Navbar/SearchBar";
import LoginButton from "./Navbar/LoginButton";
import MobileMenu from "./MobileMenu";
import CartButton from "./Navbar/CartButton";

export default function Navbar() {
  return (
    <nav className="navbar bg-black rounded-box shadow-base-300 shadow-sm">
      <Logo />

      <DesktopMenu />

      <div className="navbar-end items-center gap-4">
        <SearchBar />
        <CartButton />
        <LoginButton />
        <MobileMenu />
      </div>
    </nav>
  );
}