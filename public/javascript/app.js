$(document).ready(function () {
  function getEarningsByPoolster2() {
    $.get("/api/temp4", function (data) {
      const sorted = data.sort(
        (a, b) => b.Players[0].total_earnings - a.Players[0].total_earnings
      );
    });
  }

  function getEarningsByPoolster(sortEbyP) {
    $.get("/api/dataset", function (data) {
      let a, b;
      let result = [];
      for (let i = 0; i < data.length; i++) {
        let poolsterSum = 0;
        a = data[i].Players;
        for (let j = 0; j < a.length; j++) {
          b = a[j].Tournaments;
          for (let k = 0; k < b.length; k++) {
            poolsterSum += b[k].earnings;
          }
        }
        result.push({
          poolster: data[i].handle,
          earnings: poolsterSum,
        });
      }
      sortEbyP(result);
    });
  }

  function sortEbyP(result) {
    const sorted = result.sort((a, b) => b.earnings - a.earnings);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].ranking = i + 1;
    }
    console.log(sorted);
    for (var i = 0; i < sorted.length; i++) {
      $("#article-container").append(
        "<tr><td>" +
          sorted[i].ranking +
          "</td><td>" +
          sorted[i].poolster +
          "</td><td>" +
          sorted[i].earnings +
          "</td></tr>"
      );
    }
  }
  // getEarningsByPoolster(sortEbyP);

  function getEarningsByPxP(sortExPxP) {
    $.get("/api/dataset", function (data) {
      //to sum earnings by player and poolster
      let a, b;
      let result = [];
      for (let i = 0; i < data.length; i++) {
        let poolsterSum = 0;
        a = data[i].Players;
        result.push({
          poolster: data[i].handle,
          name: data[i].name,
          Players: [],
        });
        for (let j = 0; j < a.length; j++) {
          let playerSum = 0;
          result[i].Players.push({
            player: a[j].name,
            tier: a[j].tier,
            startDate: a[j].startDate,
            endDate: a[j].endDate,
            tournaments: [],
          });
          b = a[j].Tournaments;
          for (let k = 0; k < b.length; k++) {
            playerSum += b[k].earnings;
            poolsterSum += b[k].earnings;
            result[i].Players[j].tournaments.push({
              name: b[k].name,
              date: b[k].date,
              start: b[k].start,
              position: b[k].position,
              earnings: b[k].earnings,
            });
          }
          result[i].Players[j]["playerEarnings"] = playerSum;
          result[i]["poolsterEarnings"] = poolsterSum;
        }
      }
      console.log(result);
      sortExPxP(result);
    });
  }

  function sortExPxP(result) {
    // to sort all the data passed to function
    const sorted = result.sort(
      (a, b) => b.poolsterEarnings - a.poolsterEarnings
    );
    console.log(sorted);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].ranking = i + 1;
    }
    //sorting by Players on each team by Tier then their Start Date
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].Players.sort(function (a, b) {
        if (a.tier < b.tier) return -1;
        if (a.tier > b.tier) return 1;
        if (a.startDate < b.startDate) return -1;
        if (a.startDate > b.startDate) return 1;
      });
    }
    //sorting each Player's results based on tournament Start Date
    for (let i = 0; i < sorted.length; i++) {
      for (let j = 0; j < sorted[i].Players.length; j++) {
        sorted[i].Players[j].tournaments.sort((a, b) => a.start - b.start);
      }
    }
    displayExPxP(sorted);
  }

  function displayExPxP(sorted) {
    // to display sorted results

    for (let i = 0; i < sorted.length; i++) {
      var temp = sorted[i].poolster;
      $(".leaderboard-container").append(
        "<tr data-toggle='collapse' data-target='#demo" +
          i +
          "' class='clickabe'><td>" +
          sorted[i].ranking +
          "</td><td><h5>" +
          sorted[i].poolster +
          "</h5><h6>" +
          sorted[i].name +
          "</h6></td><td>" +
          "</td><td>" +
          sorted[i].poolsterEarnings.toLocaleString("us-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          }) +
          "</td></tr>"
      );

      for (let j = 0; j < sorted[i].Players.length; j++) {
        $(".leaderboard-container").append(
          "<tr class='level2 hiddenRow collapse' id='demo" +
            i +
            "' data-toggle='collapse' data-target='#demo-" +
            i +
            "-" +
            j +
            "' class='clickable'><td>" +
            sorted[i].Players[j].tier +
            "</td><td>" +
            sorted[i].Players[j].player +
            "</td><td>" +
            (sorted[i].Players[j].startDate > "2020-01-02"
              ? "In: " +
                new Date(sorted[i].Players[j].startDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : sorted[i].Players[j].endDate < "2020-12-31"
              ? "Out: " +
                new Date(sorted[i].Players[j].endDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : "") +
            "</td><td>" +
            sorted[i].Players[j].playerEarnings.toLocaleString("us-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }) +
            "</td></tr>"
        );

        for (let k = 0; k < sorted[i].Players[j].tournaments.length; k++) {
          $(".leaderboard-container").append(
            "<tr class='level3 hiddenRow collapse' id='demo-" +
              i +
              "-" +
              j +
              "' ><td>" +
              sorted[i].Players[j].tournaments[k].date +
              "</td><td>" +
              sorted[i].Players[j].tournaments[k].name +
              "</td><td>" +
              sorted[i].Players[j].tournaments[k].position +
              "</td><td>" +
              sorted[i].Players[j].tournaments[k].earnings.toLocaleString(
                "us-US",
                {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                }
              ) +
              "</td></tr>"
          );
        }
      }
    }
  }
  getEarningsByPxP(sortExPxP);

  // $(".collapse").on("show.bs.collapse", function () {
  //   $(".collapse.in").collapse("hide");
  // });

  // $("#article-container").on("click", "tr.level1", function () {
  //   $(this).nextUntil("tr.level3").slideToggle(200);
  // });

  // $("#article-container").on("click", "tr.level2", function () {
  //   $(this).nextUntil("tr.level3").slideToggle(200);
  // });

  // var shown = false;
  // $("#article-container").on("click", "tr.level1", function () {
  //   console.log("I've been clicked");
  //   console.log(shown);
  //   if (!shown) {
  //     $(".hidden_row td").slideDown();
  //   } else {
  //     $(".hidden_row td").slideUp();
  //   }
  //   shown = !shown;
  // });
});
