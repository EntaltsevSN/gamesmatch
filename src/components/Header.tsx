import React from "react";
import { Link } from "react-router-dom";

type HeaderProps = {
  title: string;
  subtitle: string;
  showHomeLink?: boolean;
};

function Header({ title, subtitle, showHomeLink = false }: HeaderProps) {
  return (
    <header className="app-header">
      {showHomeLink && (
        <div className="app-header-top">
          <Link className="back-home-link" to="/">
            Вернуться на главную
          </Link>
        </div>
      )}
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

export default Header;
