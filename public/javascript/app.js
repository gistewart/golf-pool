$(document).ready(function () {
  let mcLine = 0,
    round = 0;
  let resultsRefresh = false;
  $("#lastEventTitle").hide();
  $("#subIconLang").hide();
  $(".comments-container").hide();

  $("#seasonData").addClass("is-loading");

  pageLoad();

  async function pageLoad() {
    await eventCheck();
    await missingResults();
    lastEventDetails();
    setTimeout(function () {
      seasonData();
    }, 1000);
  }

  async function eventCheck() {
    let appScheduleArr,
      webScheduleArr,
      diffScheduleArr = [],
      newTournament = {},
      newTournamentArr = [];
    await $.get("api/appSchedule", function (result) {
      appScheduleArr = result;
      console.log("appSchedule: ", appScheduleArr);
    });
    await $.get("api/webSchedule", function (result) {
      webScheduleArr = result;
      console.log("webSchedule: ", webScheduleArr);
    }).then(function (result) {
      console.log("wait");
      diffScheduleArr = webScheduleArr.filter(
        ({ tournamentId: id1 }) =>
          !appScheduleArr.some(({ tournamentId: id2 }) => id2 === id1)
      );
      console.log("diffSchedule: ", diffScheduleArr);
      if (diffScheduleArr.length) {
        console.log("ready to post new event details");
        for (let i = 0; i < diffScheduleArr.length; i++) {
          console.log("in loop");
          newTournament = {
            tournamentId: diffScheduleArr[i].tournamentId,
            tDate: diffScheduleArr[i].tDate,
            tStartDate: diffScheduleArr[i].tStartDate,
            tEndDate: diffScheduleArr[i].tEndDate,
            name: diffScheduleArr[i].name,
            winner: diffScheduleArr[i].winner,
          };
          newTournamentArr.push(newTournament);
        }
        resultsRefresh = true;
        console.log(resultsRefresh);
        submitTournament(newTournamentArr);
      } else {
        console.log("no new events to post");
      }
    });
    return;
  }

  async function submitTournament(newPost) {
    await $.ajax({
      type: "POST",
      url: "api/submitTournament",
      data: JSON.stringify(newPost),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      error: function () {
        alert("Error");
      },
    });
    console.log("new event posted");
    return;
    // missingResults();
  }

  async function missingResults() {
    let diffResultsArr = [];
    await $.get("api/resultsPosted", function (result) {
      resultsPosted = result;
      console.log("resultsPosted: ", resultsPosted);
    });
    await $.get("api/appSchedule", function (list) {
      completedEvents = list;
      console.log("completedEvents: ", completedEvents);
    });
    diffResultsArr = completedEvents.filter(
      ({ tournamentId: id1 }) =>
        !resultsPosted.some(({ tournamentId: id2 }) => id2 === id1)
    );
    console.log("diffResultsArr: ", diffResultsArr);
    if (diffResultsArr.length) {
      // Production start
      // getMissingResults(diffResultsArr);
      // Production end
    } else {
      console.log("skipping getMissingResults function");
    }
    return;
  }

  function getMissingResults(results) {
    console.log("calling missingResults api");
    $.ajax({
      type: "POST",
      url: "api/missingResults",
      data: JSON.stringify(results),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      // error: function () {
      //   alert("Error");
      // },
    });
    return;
  }

  $(document).on("click", "#liveData", liveEvent);

  let apiCall = "";

  async function liveEvent() {
    $(".main-container").show();
    $(".comments-container").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Current tournament details:");
    apiCall = "Live";
    $("#liveData").addClass("is-active");
    $("#eventData").removeClass("is-active");
    $("#seasonData").removeClass("is-active");
    $("#commentsPage").removeClass("is-active");

    console.log("liveEvent function");

    await $.get("api/liveSchedule", function (result) {
      liveSchedule = result;
    });
    await $.get("api/livePositions", function (result) {
      livePositions = result;
    });
    await $.get("api/livePlayers", function (result) {
      livePlayers = result;
    });
    await $.get("api/liveAllEvents", function (result) {
      partResult = result;
      console.log(partResult);
    });
    await $.get("api/livePurseSplit", function (result) {
      livePurseSplit = result;
    });

    console.log(liveSchedule);

    // creates purseArr and counts the number of players at each position for the entire field
    let purseArr = [];
    for (let i in livePositions) {
      let match = false;
      for (let j in purseArr) {
        if (purseArr[j].pos === livePositions[i].posAdj) {
          purseArr[j].data[0].count += 1;
          match = true;
          break;
        }
      }
      if (!match) {
        purseArr.push({ pos: livePositions[i].posAdj, data: [{ count: 1 }] });
      }
    }

    console.log(purseArr);

    let roundStatus = liveSchedule[0].status;
    round = roundStatus.match(/\d/)[0];
    let purseSum = 0;

    //calculates purse values for each position in purseArr
    for (let i in purseArr) {
      if (purseArr[i].pos > 0) {
        if (purseArr[i].data[0].count === 1) {
          purseArr[i].data[0].avgPercent =
            typeof livePurseSplit[purseArr[i].pos - 1] === "undefined"
              ? 0
              : Number(livePurseSplit[purseArr[i].pos - 1].percent);
          purseArr[i].data[0].dollars =
            (purseArr[i].data[0].avgPercent * liveSchedule[0].purse) / 100;
        } else {
          purseSum = 0;
          for (let j = 0; j < purseArr[i].data[0].count; j++) {
            purseSum +=
              typeof livePurseSplit[Number(purseArr[i].pos) + j - 1] ===
              "undefined"
                ? 0.183
                : Number(
                    livePurseSplit[Number(purseArr[i].pos) + j - 1].percent
                  );
          }
          purseArr[i].data[0].totPercent = purseSum;
          purseArr[i].data[0].avgPercent = purseSum / purseArr[i].data[0].count;
          purseArr[i].data[0].dollars =
            (purseArr[i].data[0].avgPercent * liveSchedule[0].purse) / 100;
        }
      }
      if ((round < 3 && purseArr[i].pos > 65) || purseArr[i].pos == 0) {
        purseArr[i].data[0].totPercent = 0;
        purseArr[i].data[0].avgPercent = 0;
        purseArr[i].data[0].dollars = 0;
      }
    }
    console.log(purseArr);

    // calculate cut-line from purseArr
    for (let i = 0; i < purseArr.length - 1; i++) {
      if (round == 2 && purseArr[i + 1].pos > 65) {
        mcLine = purseArr[i].pos;
        break;
      }
    }
    console.log(mcLine);

    // add purse info to livePositions array
    for (let i in livePositions) {
      for (let j in purseArr) {
        if (livePositions[i].posAdj === purseArr[j].pos) {
          livePositions[i].avgPercent = purseArr[j].data[0].avgPercent;
          livePositions[i].dollars = purseArr[j].data[0].dollars;
          break;
        }
      }
    }
    console.log(livePositions);

    // filter livePlayers for active players only
    for (let i in livePlayers) {
      let a = livePlayers[i].Players,
        tStart = liveSchedule[0].tStartDate;
      for (let j = 0; j < a.length; j++) {
        if (
          (a[j].endDate > tStart && a[j].startDate < tStart) ||
          (a[j].reEndDate > tStart && a[j].reStartDate < tStart)
        ) {
          a[j].Tournaments.push({
            name: liveSchedule[0].name,
            date: liveSchedule[0].tDate,
            start: liveSchedule[0].tStartDate,
          });
        } else {
          a.splice(j, 1);
          j--;
        }
      }
    }

    //filter livePlayers for players who played in the tournament and add tournament performance data
    for (let i = 0; i < livePlayers.length; i++) {
      for (let j = 0; j < livePlayers[i].Players.length; j++) {
        let a = livePlayers[i].Players;
        let match = false;
        for (let k = 0; k < livePositions.length; k++) {
          if (a[j].player === livePositions[k].playerName) {
            match = true;
            a[j].Tournaments[0].position = livePositions[k].pos;
            a[j].Tournaments[0].posAdj = livePositions[k].posAdj;
            a[j].Tournaments[0].earnings = livePositions[k].dollars;
            a[j].Tournaments[0].toPar = livePositions[k].toPar;
            a[j].Tournaments[0].today = livePositions[k].today;
            a[j].Tournaments[0].thru = livePositions[k].thru;
            a[j].Tournaments[0].percent = livePositions[k].avgPercent;
            break;
          }
        }
        if (match === false) {
          a.splice(j, 1);
          j--;
        }
      }
    }

    // add priorRanking and priorEarnings to livePlayers array
    for (let i = 0; i < livePlayers.length; i++) {
      for (let j = 0; j < partResult.length; j++) {
        if (livePlayers[i].id === partResult[j].id) {
          livePlayers[i]["livePriorRanking"] = partResult[j].ranking;
          livePlayers[i]["livePriorEarnings"] = partResult[j].poolsterEarnings;
          break;
        }
      }
    }

    // calculate poolsterEarnings (for the live tourney), add to livePlayers array
    for (let i = 0; i < livePlayers.length; i++) {
      let poolsterSum = 0;
      for (let j = 0; j < livePlayers[i].Players.length; j++) {
        let playerSum = 0;
        for (let k = 0; k < livePlayers[i].Players[j].Tournaments.length; k++) {
          playerSum += livePlayers[i].Players[j].Tournaments[k].earnings;
        }
        poolsterSum += playerSum;
        livePlayers[i].Players[j].playerEarnings = playerSum;
      }
      livePlayers[i]["poolsterEarnings"] = poolsterSum;
    }

    // add liveNewEarnings to livePlayers array
    for (let i in livePlayers) {
      livePlayers[i].liveNewEarnings =
        livePlayers[i].livePriorEarnings + livePlayers[i].poolsterEarnings;
    }

    // sort livePlayers array based on liveNewEarnings
    livePlayers = livePlayers.sort(
      (a, b) => b.liveNewEarnings - a.liveNewEarnings
    );

    // add liveNewRanking to livePlayers array
    for (let i = 0; i < livePlayers.length; i++) {
      livePlayers[i].liveNewRanking = i + 1;
    }

    // add liveRankingChange (and related) to LivePlayers array
    for (let i = 0; i < livePlayers.length; i++) {
      livePlayers[i].liveRankingChange =
        livePlayers[i].livePriorRanking - livePlayers[i].liveNewRanking;
      let l = livePlayers[i].liveRankingChange;
      l > 0
        ? (livePlayers[i].liveRankingMove = "up")
        : l < 0
        ? (livePlayers[i].liveRankingMove = "down")
        : "nc";
      livePlayers[i].liveRankingChangeAbs = Math.abs(l);
      livePlayers[i].liveZeroPlayersText = "";
      if (livePlayers[i].Players.length === 0) {
        livePlayers[i]["liveZeroPlayersText"] = " (0 players)";
      }
    }

    console.log(livePlayers);

    $.get("api/liveSchedule", function (result) {
      $("#lastEventDetails").html("");
      for (let i = 0; i < result.length; i++) {
        $("#lastEventDetails").append(
          "<p>" +
            result[i].tDate +
            " | " +
            result[i].name +
            " | " +
            result[i].status +
            "</p>"
        );
      }
    });
    sortData(livePlayers);
  }

  //for the section at the top of the leaderboard
  function lastEventDetails() {
    console.log("entering lastEventDetails function");
    $.get("api/lastEventDetails", function (result) {
      $("#lastEventDetails").html("");
      for (let i = 0; i < result.length; i++) {
        $("#lastEventDetails").append(
          "<p>" +
            result[i].name +
            " (" +
            "winner: " +
            result[i].winner +
            ", " +
            result[i].tDate +
            ")" +
            "</p>"
        );
      }
    });
    console.log("exiting lastEventDeails function");
  }

  let mainData = [],
    partData = [];

  $(document).on("click", "#seasonData", seasonData);

  function seasonData() {
    $(".main-container").show();
    console.log("entering seasonData function");
    $("#seasonData").addClass("is-loading");
    $("#lastEventTitle").show();
    $("#lastEventTitle").text(
      "Results reflect all tournaments up to and including:"
    );
    lastEventDetails();
    apiCall = "Season";
    $("#eventData").removeClass("is-active");
    $("#liveData").removeClass("is-active");
    $("#commentsPage").removeClass("is-active");
    $("#seasonData").addClass("is-active");
    $.get("/api/allEvents", function (data) {
      mainData = data;
    }).then(function () {
      $.get("/api/allExclLastEvent", function (data2) {
        partData = data2;
      }).then(function () {
        $.get("/api/playerRankings", function (data3) {
          playerRankings = data3;
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
          sumData(mainData, sortedPartResult, playerRankings);
        });
      });
    });
    $("#seasonData").removeClass("is-loading");
  }

  $(document).on("click", "#eventData", eventData);

  function eventData() {
    $(".main-container").show();
    $(".comments-container").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Tournament details:");
    lastEventDetails();
    apiCall = "Event";
    $("#eventData").addClass("is-loading");
    $.get("/api/lastEvent", function (data) {
      sumData(data);
      $("#eventData").addClass("is-active");
      $("#seasonData").removeClass("is-active");
      $("#liveData").removeClass("is-active");
      $("#commentsPage").removeClass("is-active");
    });
    $("#eventData").removeClass("is-loading");
  }

  function sumData(data, sortedPartResult, playerRankings) {
    //to sum earnings by player and poolster
    let a, b;
    let result = [];
    let iAdj = 0;
    for (let i = 0; i < data.length; i++) {
      if (!(data[i].Players && data[i].Players.length)) {
        iAdj++;
      } else {
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
          result[i - iAdj].Players.push({
            player: a[j].name,
            tier: a[j].tier,
            startDate: a[j].startDate,
            active: "yes",
            endDate: a[j].endDate,
            reStartDate: a[j].reStartDate,
            reEndDate: a[j].reEndDate,
            effDate: a[j].effDate,
            type: a[j].type,
            tournaments: [],
          });
          if (a[j].endDate < "2020-12-31" && !a[j].reStartDate) {
            result[i].Players[j].active = "no";
          }
          if (a[j].effDate > "2020-07-05" && a[j].type == "regular") {
            playerCount++;
          }

          b = a[j].Tournaments;
          for (let k = 0; k < b.length; k++) {
            playerSum += b[k].earnings;
            poolsterSum += b[k].earnings;
            result[i - iAdj].Players[j].tournaments.push({
              name: b[k].name,
              date: b[k].date,
              start: b[k].start,
              position: b[k].position,
              earnings: b[k].earnings,
              toPar: b[k].toPar,
              thru: b[k].thru,
            });
          }
          result[i - iAdj].Players[j]["playerEarnings"] = playerSum;
          result[i - iAdj]["poolsterEarnings"] = poolsterSum;
          result[i - iAdj]["playerCount"] = playerCount;
        }
      }
    }
    console.log(result);
    sortData(result, sortedPartResult, playerRankings);
  }

  function sortData(result, sortedPartResult, playerRankings) {
    // to sort all the data passed to function
    const sorted = result.sort(
      (a, b) => b.poolsterEarnings - a.poolsterEarnings
    );

    sorted[0].ranking = 1;
    let ties = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].poolsterEarnings !== sorted[i - 1].poolsterEarnings) {
        sorted[i].ranking = i + 1;
        ties = 0;
      } else {
        ties++;
        sorted[i].ranking = i + 1 - ties;
      }
    }
    // adds "T" for ties
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 && sorted[0].ranking === sorted[1].ranking) {
        sorted[0].rankingDisplay = "T" + sorted[i].ranking;
      } else if (
        i > 0 &&
        i < sorted.length - 1 &&
        (sorted[i].ranking === sorted[i - 1].ranking ||
          sorted[i].ranking === sorted[i + 1].ranking)
      ) {
        sorted[i].rankingDisplay = "T" + sorted[i].ranking;
      } else if (
        i === sorted.length - 1 &&
        sorted[i].ranking === sorted[i - 1].ranking
      ) {
        sorted[i].rankingDisplay = "T" + sorted[i].ranking;
      } else {
        sorted[i].rankingDisplay = sorted[i].ranking;
      }
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
    //excluding apiCall = "Live"
    if (apiCall !== "Live") {
      for (let i = 0; i < sorted.length; i++) {
        for (let j = 0; j < sorted[i].Players.length; j++) {
          sorted[i].Players[j].tournaments.sort(function (a, b) {
            if (a.start < b.start) return -1;
            if (a.start > b.start) return 1;
          });
        }
      }
    }
    console.log(sorted, playerRankings);
    displayData(sorted, sortedPartResult, playerRankings);
  }

  async function displayData(sorted, sortedPartResult, playerRankings) {
    // let round = 0;
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
      console.log("inserting new grade code here");
      for (let i = 0; i < sorted.length; i++) {
        for (let j = 0; j < playerRankings.length; j++)
          if (sorted[i].name == playerRankings[j].name) {
            for (let k = 0; k < sorted[i].Players.length; k++) {
              if (sorted[i].Players[k].active == "yes") {
                for (let l = 0; l < playerRankings[j].tier.length; l++) {
                  if (
                    sorted[i].Players[k].tier ==
                    playerRankings[j].tier[l].number
                  ) {
                    sorted[i].Players[k]["grade"] =
                      playerRankings[j].tier[l].grade;
                    sorted[i].Players[k]["poolAverage"] =
                      playerRankings[j].tier[l].average;
                    sorted[i].Players[k]["gradePercent"] =
                      playerRankings[j].tier[l].gradePercent;
                  }
                }
              }
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
          sorted[i].rankingDisplay +
          (apiCall == "Season"
            ? "</td><td class='rankingChange'>" +
              (sorted[i].rankingMove == "up"
                ? "<i class='fas fa-caret-up' style='color:green'></i>" +
                  sorted[i].rankingChangeAbs
                : sorted[i].rankingMove == "down"
                ? "<i class='fas fa-caret-down' style='color:red'></i>" +
                  sorted[i].rankingChangeAbs
                : " -")
            : "</td><td>") +
          "</td><td class='imageDiv'><img class='poolsterImage' src=" +
          sorted[i].image +
          "></td><td class='poolsterHandle'>" +
          sorted[i].poolster +
          (apiCall == "Live"
            ? "<small>" + sorted[i].liveZeroPlayersText + "</small>"
            : "") +
          " " +
          (sorted[i].playerCount > 0 && apiCall == "Season"
            ? "<i class='subIcon2 material-icons md-dark md-inactive md-15'>swap_horizontal_circle</i>"
            : sorted[i].playerCount == 0 && apiCall == "Season"
            ? "<i class='subIcon1 material-icons md-15'>swap_horizontal_circle</i>"
            : "") +
          "<p class='poolsterName'>" +
          sorted[i].name +
          "</p></td><td class='earnings'>" +
          sorted[i].poolsterEarnings.toLocaleString("us-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) +
          // to add Start Proj table for Live version
          (apiCall == "Live"
            ? "<table class='liveProjTable'><tr><th>" +
              "Proj." +
              "</th><th>" +
              "Start" +
              "</th><th style='padding-left: 0.5em; padding-right: 0.5em'>" +
              "<i class='fas fa-long-arrow-alt-up'></i>" +
              "<i class='fas fa-long-arrow-alt-down'></i>" +
              "</th></tr><tr><td>" +
              sorted[i].liveNewRanking +
              "</td><td>" +
              sorted[i].livePriorRanking +
              "</td><td>" +
              (sorted[i].liveRankingMove == "up"
                ? "<i class='fas fa-arrow-up' style='color:green;'></i>" +
                  sorted[i].liveRankingChangeAbs
                : sorted[i].liveRankingMove == "down"
                ? "<i class='fas fa-arrow-down' style='color:red;'></i>" +
                  sorted[i].liveRankingChangeAbs
                : "-") +
              "</td></tr></table>"
            : "") +
          "</td></tr>"
      );

      for (let j = 0; j < sorted[i].Players.length; j++) {
        // temp only; for Live section here
        if (apiCall === "Live") {
          console.log(mcLine);
        }
        $(".leaderboard-container").append(
          "<tr class='level2 hiddenRow collapse' id='demo" +
            i +
            "' data-toggle='collapse' data-target='#demo-" +
            i +
            "-" +
            j +
            "' class='clickable'><td colspan='4' class='level2A'>" +
            "Cat " +
            sorted[i].Players[j].tier +
            ": " +
            sorted[i].Players[j].player +
            // " " +
            // to add Live data to this layer
            (apiCall === "Live"
              ? ": " +
                sorted[i].Players[j].Tournaments[0].position +
                (round == 1 &&
                /am|pm/i.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? " | " + sorted[i].Players[j].Tournaments[0].thru
                  : /^\d+$/.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? " | " +
                    sorted[i].Players[j].Tournaments[0].toPar +
                    " | thru " +
                    sorted[i].Players[j].Tournaments[0].thru
                  : /am|pm|F/i.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? " | " +
                    sorted[i].Players[j].Tournaments[0].toPar +
                    " | " +
                    sorted[i].Players[j].Tournaments[0].thru
                  : "") +
                (round == 2 && sorted[i].Players[j].Tournaments[0].posAdj > 65
                  ? " " +
                    "<i class='fas fa-exclamation-circle fa-s' style='color:red'></i>"
                  : round == 2 &&
                    sorted[i].Players[j].Tournaments[0].posAdj == mcLine
                  ? " " +
                    "<i class='fas fa-exclamation-triangle fa-s' style='color:orange'></i>"
                  : "")
              : " " +
                "<i title = 'Category earnings (including any subs) are " +
                ((sorted[i].Players[j].gradePercent * 100).toFixed(0) + "%") +
                " of pool average of " +
                Number(sorted[i].Players[j].poolAverage).toLocaleString(
                  "us-US",
                  {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }
                ) +
                "'" +
                (sorted[i].Players[j].grade == "A"
                  ? "class='gradeIcon fas fa-angle-double-up fa-s'></i>"
                  : sorted[i].Players[j].grade == "B"
                  ? "class='gradeIcon fas fa-angle-up fa-s'></i>"
                  : sorted[i].Players[j].grade == "C"
                  ? "class='gradeIcon fas fa-arrows-alt-v fa-s'></i>"
                  : sorted[i].Players[j].grade == "D"
                  ? "class='gradeIcon fas fa-angle-down fa-s'></i>"
                  : sorted[i].Players[j].grade == "E"
                  ? "class='gradeIcon fas fa-angle-double-down fa-s'></i>"
                  : "") +
                "  " +
                (sorted[i].Players[j].active == "yes" &&
                (sorted[i].Players[j].startDate > "2020-01-01" ||
                  sorted[i].Players[j].endDate < "2020-12-31")
                  ? " | "
                  : "") +
                (sorted[i].Players[j].startDate > "2020-01-01"
                  ? " " +
                    "<i class='fas fa-user-plus fa-s' style='color:green'></i>" +
                    "  " +
                    new Date(sorted[i].Players[j].startDate).toLocaleString(
                      "default",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : sorted[i].Players[j].endDate < "2020-12-31"
                  ? "<i class='fas fa-user-minus fa-s' style='color:grey'></i>" +
                    " " +
                    new Date(sorted[i].Players[j].endDate).toLocaleString(
                      "default",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "") +
                (sorted[i].Players[j].startDate > "2020-01-01" &&
                sorted[i].Players[j].endDate < "2020-12-31"
                  ? " | " +
                    "<i class='fas fa-user-minus fa-s' style='color:grey'></i>" +
                    "  " +
                    new Date(sorted[i].Players[j].endDate).toLocaleString(
                      "default",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "") +
                (sorted[i].Players[j].reStartDate > "2020-01-01"
                  ? " | " +
                    "<i class='fas fa-user-plus fa-s' style='color:green'></i>" +
                    "  " +
                    new Date(sorted[i].Players[j].reStartDate).toLocaleString(
                      "default",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "")) +
            "</td><td class='earnings'>" +
            sorted[i].Players[j].playerEarnings.toLocaleString("us-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) +
            "</td></tr>"
        );

        //to exclude this layer if apiCall === "Live"
        if (apiCall !== "Live") {
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
                    maximumFractionDigits: 0,
                  }
                ) +
                "</td></tr>"
            );
          }
        }
      }
    }
    $(".subIcon1").attr("title", "Sub available for this period");
    $(".subIcon2").attr("title", "Sub already used for this period");

    $("#subIconLang").show(3000);

    console.log(sorted);
  }

  // ---------COMMENTS PAGE SECTION-------------

  $(document).on("click", "#commentsPage", commentsPage);

  function commentsPage() {
    $(".main-container").hide();
    $("#seasonData").removeClass("is-active");
    $("#eventData").removeClass("is-active");
    $("#commentsPage").addClass("is-active");

    $(".comments-container").show();
    $(".tabs-container").show();
    $(".submit-comments-container").show();
    $("#submitComments").addClass("is-active");
    $(".display-comments-container").hide();
  }

  // ---------SUBMIT COMMENT SECTION--------------

  $(document).on("click", "#submitComments", submitComments);

  function submitComments() {
    $(".submit-comments-container").show();
    $(".display-comments-container").hide();
    $("#submitComments").addClass("is-active");
    $("#displayComments").removeClass("is-active");
  }
  var bodyInput = $("#body");
  var categoryInput = $("#category");
  var cmsForm = $("#cms");
  var poolsterSelect = $("#poolster");
  // Adding an event listener for when the form is submitted
  $(cmsForm).on("submit", handleFormSubmit);
  var poolsterId;

  getPoolsters();

  // A function for handling what happens when the form to create a new post is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    if (
      !categoryInput.val().trim() ||
      !bodyInput.val().trim() ||
      !poolsterSelect.val()
    ) {
      alert("All fields must be completed");
      return;
    }
    // Constructing a newPost object to hand to the database
    var newPost = {
      category: categoryInput.val().trim(),
      body: bodyInput.val().trim(),
      handle: poolsterSelect.val(),
    };

    console.log(newPost);

    // If we're updating a post run updatePost to update a post
    // Otherwise run submitPost to create a whole new post
    // if (updating) {
    //   newPost.id = postId;
    //   updatePost(newPost);
    // } else {
    submitPost(newPost);
    // }
  }

  // Submits a new post
  function submitPost(post) {
    $.post("/api/posts", post, function () {
      displayComments();
      getPosts();
      $("#cms")[0].reset();
    });
  }

  // function to get Poolsters and render list of them
  function getPoolsters() {
    $.get("api/poolsters", renderPoolsterList);
  }

  // function to render list of poolsters
  function renderPoolsterList(data) {
    // console.log(data);
    const sortedData = data.sort((a, b) => a.handle.localeCompare(b.handle));
    var rowstoAdd = [
      "<option value='' disabled selected>" + "Select Poolster" + "</option",
    ];
    for (let i = 0; i < sortedData.length; i++) {
      rowstoAdd.push(createPoolsterRow(sortedData[i]));
    }
    poolsterSelect.empty();
    // console.log(rowstoAdd);
    // console.log(poolsterSelect);
    poolsterSelect.append(rowstoAdd);
    // poolsterSelect.val(poolsterId);
  }

  // Creates the poolster options in the dropdown
  function createPoolsterRow(poolster) {
    var listOption = $("<option>");
    // listOption.attr("value", poolster.poolsterId);
    listOption.attr("value", poolster.handle);
    listOption.text(poolster.handle);
    return listOption;
  }
  // ---------DISPLAY COMMENTS SECTION--------------

  $(document).on("click", "#displayComments", displayComments);

  function displayComments() {
    $(".submit-comments-container").hide();
    $(".display-comments-container").show();
    $("#submitComments").removeClass("is-active");
    $("#displayComments").addClass("is-active");
  }

  // blogContainer holds all of our posts
  var blogContainer = $(".blog-container");
  var posts;

  getPosts();

  function getPosts() {
    $.get("api/posts", function (data) {
      // console.log("Posts", data);
      posts = data;
      if (!posts || !posts.length) {
        displayEmpty(author);
      } else {
        initializeRows();
      }
    });
  }

  function initializeRows() {
    blogContainer.empty();
    var postsToAdd = [];
    for (var i = 0; i < posts.length; i++) {
      postsToAdd.unshift(createNewRow(posts[i]));
    }
    blogContainer.append(postsToAdd);
    // console.log(postsToAdd);
  }

  // This function constructs a post's HTML
  function createNewRow(post) {
    var newPostCard = $("<div>");
    newPostCard.addClass("card");

    var newPostCardHeading = $("<div>");
    newPostCardHeading.addClass("card-header");
    newPostCardHeading.css({
      padding: "0.25em 1.25em",
    });

    var newPostCardBody = $("<div>");
    newPostCardBody.addClass("card-body");
    newPostCardBody.css({
      padding: "0.25em 1.25em",
      "margin-bottom": "0.5em",
    });
    var newPostBody = $("<p>");

    var newPostTitle = $("<p>");

    var formattedDate = new Date(post.createdAt);
    formattedDate = moment(formattedDate).format("MMM DD, YYYY");
    var newPostDate = $("<span>");
    newPostDate.text(formattedDate);

    newPostTitle.append(post.handle + " | ");
    newPostTitle.append(post.category + " | ");
    newPostTitle.append(newPostDate);
    newPostCardHeading.append(newPostTitle);
    newPostCard.append(newPostCardHeading);

    newPostBody.text(post.body);
    newPostBody.css({
      color: "black",
      "font-size": "1.15em",
    });
    newPostCardBody.append(newPostBody);
    newPostCard.append(newPostCardBody);
    newPostCard.data("post", post);

    return newPostCard;
  }
});
