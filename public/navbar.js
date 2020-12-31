"use strict";

var today = new Date();
var year = today.getFullYear();

function NavBar() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "nav",
      { className: "navbar bg-dark" },
      React.createElement(
        "a",
        {
          className: "navbar-toggler collapsed border-0 mr-md-auto",
          "data-toggle": "collapse",
          "data-target": "#collapsingNavbar"
        },
        React.createElement(
          "span",
          null,
          " "
        ),
        React.createElement(
          "span",
          null,
          " "
        ),
        React.createElement(
          "span",
          null,
          " "
        )
      ),
      React.createElement(
        "div",
        { className: "d-flex d-inline-block flex-row mx-auto" },
        React.createElement(
          "a",
          { href: "/", className: "chief" },
          "The Chief's Golf Pool"
        )
      ),
      React.createElement(
        "div",
        {
          className: "d-md-flex d-block flex-row ml-md-auto mx-0 justify-content-center",
          id: "edition"
        },
        "#",
        year - 2004
      ),
      React.createElement(
        "div",
        { className: "collapse navbar-collapse", id: "collapsingNavbar" },
        React.createElement(
          "ul",
          { className: "nav navbar-nav" },
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "../index.html" },
              React.createElement("i", { className: "fas fa-home fa-fw" }),
              "Home"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "../rules.html" },
              React.createElement("i", { className: "fas fa-file-alt fa-fw" }),
              "Rules"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "../players.html" },
              React.createElement("i", { className: "fas fa-user-friends fa-fw" }),
              "Player Categories"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "../comments.html" },
              React.createElement("i", { className: "fas fa-comment-dots fa-fw" }),
              "Comments"
            )
          ),
          React.createElement("hr", null),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "//espn.com/golf", target: "_blank" },
              "espn.com/golf"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "//pgatour.com", target: "_blank" },
              "pgatour.com"
            )
          )
        )
      )
    )
  );
}

var domContainer = document.querySelector("#navbar-container");
ReactDOM.render(React.createElement(NavBar, null), domContainer);

function Footer() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "footer",
      { className: "footer text-center" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "a",
          {
            className: "text-light",
            target: "_blank",
            href: "https://gistewart.github.io/Portfolio"
          },
          "\xA9 ",
          year,
          " Graeme Stewart"
        )
      )
    )
  );
}

var footerContainer = document.querySelector("#footer");
ReactDOM.render(React.createElement(Footer, null), footerContainer);

var element = React.createElement;

function PageTitle(props) {
  var param = document.querySelector("#page-title").getAttribute("param");
  console.log("param:", param);

  return React.createElement(
    "div",
    { className: "card" },
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement(
        "h5",
        null,
        param
      )
    )
  );
}

var pageTitle = document.querySelector("#page-title");
ReactDOM.render(element(PageTitle), pageTitle);