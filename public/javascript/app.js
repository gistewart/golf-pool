$(document).ready(function () {
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

  $.get("api/lastEventDetails", function (result) {
    for (let i = 0; i < result.length; i++) {
      console.log("entering");
      $("#lastEventDetails").append(
        "<p>" +
          result[i].name +
          " (" +
          result[i].tDate +
          ", winner: " +
          result[i].winner +
          ")" +
          "</p>"
      );
    }
  });

  let mainData = [],
    partData = [],
    apiCall = "";

  $("#seasonData").click(function () {
    apiCall = "Season";
    $.get("/api/allEvents", function (data) {
      mainData = data;
    }).then(function () {
      $.get("/api/allExclLastEvent", function (data2) {
        partData = data2;
      }).then(function () {
        let a, b;
        let partResult = [];
        for (let i = 0; i < partData.length; i++) {
          let poolsterSum = 0;
          partResult.push({
            poolster: partData[i].handle,
            Players: [],
          });
          a = partData[i].Players;
          for (let j = 0; j < a.length; j++) {
            partResult[i].Players.push({
              player: a[j].name,
              tournaments: [],
            });

            b = a[j].Tournaments;
            for (let k = 0; k < b.length; k++) {
              poolsterSum += b[k].earnings;
            }
            partResult[i]["poolsterEarnings"] = poolsterSum;
          }
        }
        const sortedPartResult = partResult.sort(
          (a, b) => b.poolsterEarnings - a.poolsterEarnings
        );

        for (let i = 0; i < sortedPartResult.length; i++) {
          sortedPartResult[i].ranking = i + 1;
        }
        console.log(sortedPartResult);
        sumData(mainData, sortedPartResult);
      });
    });
  });

  // $(document).on("click", "#seasonData", function () {
  //   $.get("/api/allEvents", function (data) {
  //     sumData(data);
  //   });
  // });

  $(document).on("click", "#eventData", function () {
    apiCall = "Event";
    $.get("/api/lastEvent", function (data) {
      sumData(data);
    });
  });

  function sumData(data, sortedPartResult) {
    //to sum earnings by player and poolster
    let a, b;
    let result = [];
    for (let i = 0; i < data.length; i++) {
      let poolsterSum = 0;
      let playerCount = 0;
      result.push({
        poolster: data[i].handle,
        name: data[i].name,
        image: data[i].image,
        Players: [],
      });
      a = data[i].Players;
      for (let j = 0; j < a.length; j++) {
        let playerSum = 0;
        result[i].Players.push({
          player: a[j].name,
          tier: a[j].tier,
          startDate: a[j].startDate,
          endDate: a[j].endDate,
          effDate: a[j].effDate,
          type: a[j].type,
          tournaments: [],
        });
        if (a[j].effDate < "2020-06-01" && a[j].type == "regular") {
          playerCount++;
        }
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
        result[i]["playerCount"] = playerCount;
      }
    }
    console.log(result);
    sortData(result, sortedPartResult);
  }

  function sortData(result, sortedPartResult) {
    // to sort all the data passed to function
    const sorted = result.sort(
      (a, b) => b.poolsterEarnings - a.poolsterEarnings
    );

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
    console.log(sorted);
    displayData(sorted, sortedPartResult);
  }

  function displayData(sorted, sortedPartResult) {
    // to display sorted results
    // to add prior ranking data to main arr
    if (apiCall == "Season") {
      for (let f = 0; f < sorted.length; f++) {
        for (let p = 0; p < sortedPartResult.length; p++) {
          if (sorted[f].poolster == sortedPartResult[p].poolster) {
            sorted[f].priorRanking = sortedPartResult[p].ranking;
            sorted[f].rankingChange =
              sorted[f].priorRanking - sorted[f].ranking;
            sorted[f].ranking < sorted[f].priorRanking
              ? (sorted[f].rankingMove = "up")
              : sorted[f].ranking > sorted[f].priorRanking
              ? (sorted[f].rankingMove = "down")
              : "nc";
            sorted[f].rankingChangeAbs = Math.abs(sorted[f].rankingChange);
          }
        }
      }
    }
    console.log(sorted);

    $(".leaderboard-container > tbody").html("");
    for (let i = 0; i < sorted.length; i++) {
      $(".leaderboard-container > tbody").append(
        "<tr data-toggle='collapse' data-target='#demo" +
          i +
          "' class='level1 clickabe'><td class='ranking'>" +
          sorted[i].ranking +
          "</td><td class='rankingChange'>" +
          (sorted[i].rankingMove == "up"
            ? "<i class='fas fa-caret-up' style='color:green'></i>" +
              sorted[i].rankingChangeAbs
            : sorted[i].rankingMove == "down"
            ? "<i class='fas fa-caret-down' style='color:red'></i>" +
              sorted[i].rankingChangeAbs
            : "-") +
          "</td><td class='imageDiv'><img class='poolsterImage' src=" +
          sorted[i].image +
          "></td><td class='poolsterHandle'>" +
          sorted[i].poolster +
          " " +
          (sorted[i].playerCount > 0
            ? "<i class='subIcon2 material-icons md-dark md-inactive md-15'>swap_horizontal_circle</i>"
            : "<i class='subIcon1 material-icons md-15'>swap_horizontal_circle</i>") +
          "<p class='poolsterName'>" +
          sorted[i].name +
          "<p></td><td class='earnings'>" +
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
            "' class='clickable'><td colspan='4' class='level2A'>" +
            "Category " +
            sorted[i].Players[j].tier +
            ": " +
            sorted[i].Players[j].player +
            "   " +
            (sorted[i].Players[j].startDate > "2020-01-01"
              ? "<i class='fas fa-user-plus fa-xs' style='color:green'></i>" +
                "  " +
                new Date(sorted[i].Players[j].startDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : sorted[i].Players[j].endDate < "2020-12-31"
              ? "<i class='fas fa-user-minus fa-xs' style='color:red'></i>" +
                "  " +
                new Date(sorted[i].Players[j].endDate).toLocaleString(
                  "default",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )
              : "") +
            "</td><td class='earnings'>" +
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
              "' ><td class='level3A' colspan='4'>" +
              sorted[i].Players[j].tournaments[k].date +
              " | " +
              sorted[i].Players[j].tournaments[k].name +
              " | " +
              sorted[i].Players[j].tournaments[k].position +
              "</td><td class='earnings'>" +
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
    $(".subIcon1").attr("title", "Sub available for this period");
    $(".subIcon2").attr("title", "Sub already used for this period");

    console.log(sorted);
  }
});
