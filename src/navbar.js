"use strict";

const today = moment().format();
const year = moment(today).year();

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
              <a className="nav-link" href="../index.html">
                <i className="fas fa-home fa-fw"></i>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="../rules.html">
                <i className="fas fa-file-alt fa-fw"></i>
                Rules
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="../players.html">
                <i className="fas fa-user-friends fa-fw"></i>
                Player Categories
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="../comments.html">
                <i className="fas fa-comment-dots fa-fw"></i>
                Comments
              </a>
            </li>
            <hr></hr>
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

function Footer() {
  return (
    <div>
      <footer className="footer text-center">
        <div>
          <a
            className="text-light"
            target="_blank"
            href="https://gistewart.github.io/Portfolio"
          >
            © {year} Graeme Stewart
          </a>
        </div>
      </footer>
    </div>
  );
}

let footerContainer = document.querySelector("#footer");
ReactDOM.render(<Footer />, footerContainer);

const element = React.createElement;

function PageTitle(props) {
  const param = document.querySelector("#page-title").getAttribute("param");
  console.log("param:", param);

  return (
    <div className="card">
      <div className="card-body">
        <h5>{param}</h5>
      </div>
    </div>
  );
}

let pageTitle = document.querySelector("#page-title");
ReactDOM.render(element(PageTitle), pageTitle);
