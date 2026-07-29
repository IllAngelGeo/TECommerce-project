import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import SearchBar from "./Navbar/SearchBar";
import LoginButton from "./LoginButton";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <div className="h-130 max-md:h-[31.25rem]">
      <nav className="navbar rounded-box shadow-base-300/20 shadow-sm">
        <Logo />

        <DesktopMenu />

        <div className="navbar-end items-center gap-4">
          <SearchBar />
          <LoginButton />
          <MobileMenu />
        </div>
      </nav>
    </div>
  );
}