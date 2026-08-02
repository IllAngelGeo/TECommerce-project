import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import SearchBar from "./Navbar/SearchBar";
import LoginButton from "./LoginButton";
import MobileMenu from "./MobileMenu";
import CartButton from "./CartButton";

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