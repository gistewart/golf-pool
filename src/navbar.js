"use strict";

const today = new Date();
const year = today.getFullYear();

function NavBar() {
  return (
    <div>
      <nav className="navbar bg-dark">
        <a
          className="navbar-toggler collapsed border-0 mr-md-auto"
          data-toggle="collapse"
          data-target="#collapsingNavbar"
        >
          <span> </span>
          <span> </span>
          <span> </span>
        </a>

        <div className="d-flex d-inline-block flex-row mx-auto">
          <a href="/" className="chief">
            The Chief's Golf Pool
          </a>
        </div>
        <div
          className="d-md-flex d-block flex-row ml-md-auto mx-0 justify-content-center"
          id="edition"
        >
          #{year - 2004}
        </div>
        <div className="collapse navbar-collapse" id="collapsingNavbar">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="index.html">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="rules.html">
                Rules
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="players.html">
                Player Categories
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="//espn.com/golf" target="_blank">
                espn.com/golf
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="//pgatour.com" target="_blank">
                pgatour.com
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

let domContainer = document.querySelector("#navbar-container");
ReactDOM.render(<NavBar />, domContainer);
