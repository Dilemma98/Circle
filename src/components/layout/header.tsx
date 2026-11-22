import "./header.css";
import logo from "../../assets/header-logo.svg";

export default function Header() {
  return (
    <header className="app-header">
      <a className="logo" href="/">
        <img className="logo-icon" src={logo} alt="" />
        <span>Circle</span>
      </a>
    </header>
  );
}