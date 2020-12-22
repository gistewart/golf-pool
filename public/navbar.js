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
          "data-target": "#collapsingNavbar",
        },
        React.createElement("span", null, " "),
        React.createElement("span", null, " "),
        React.createElement("span", null, " ")
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
          className:
            "d-md-flex d-block flex-row ml-md-auto mx-0 justify-content-center",
          id: "edition",
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
              { className: "nav-link", href: "index.html" },
              "Home"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "rules.html" },
              "Rules"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              { className: "nav-link", href: "players.html" },
              "Player Categories"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              {
                className: "nav-link",
                href: "//espn.com/golf",
                target: "_blank",
              },
              "espn.com/golf"
            )
          ),
          React.createElement(
            "li",
            { className: "nav-item" },
            React.createElement(
              "a",
              {
                className: "nav-link",
                href: "//pgatour.com",
                target: "_blank",
              },
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
