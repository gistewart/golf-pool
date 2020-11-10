$(document).ready(function () {
  let mcPos = 99,
    round = 0,
    noCut = false,
    resultsRefresh = false,
    liveExit = false,
    liveTC = false,
    lastEventCount = 0,
    liveStatus = [];

  $("#liveScoring").hide();
  $("#onTheRange").hide();
  $(".onTheRange-container").hide();
  $("#lastEventTitle").hide();
  $("#tcCalcTableLink").hide();
  $(".refreshContainer").hide();
  $("#subIconLang").hide();
  $("#footnotes").hide();
  $("footer").hide();
  $(".comments-container").hide();

  $("#seasonData .spinner").addClass("lds-hourglass");

  pageLoad();

  async function pageLoad() {
    await eventCheck();
    await missingResults();
    lastEventDetails();
    await displayLiveTab();
    setTimeout(function () {
      seasonData();
      // liveEvent();
    }, 1000);
  }

  async function displayLiveTab() {
    console.log("running displayLiveTab");
    await $.get("api/liveTourneyStatus", function (result) {
      console.log(result);
      if (result.length === 1) {
        if (result[0].status === "Tournament Field") {
          console.log("field check");
          $("#onTheRange").show();
          $("#liveScoring").hide();
        } else {
          $("#liveScoring").show();
          $(".text-danger").addClass("Blink");
          $("#onTheRange").hide();
        }
      } else {
        $("#liveScoring").hide();
        $("#ontheRange").hide();
      }
    });
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

  $(document).on("click", "#onTheRange", onTheRange);
  $(document).on("click", "#liveScoring", liveEvent);
  $(document).on("click", "#refreshButton", refreshLiveButton);

  let refreshRunning = false;
  async function refreshLiveButton() {
    refreshRunning = true;
    $("#refreshButton").addClass("is-loading");
    await liveEvent();
    $("#refreshButton").removeClass("is-loading");
    refreshRunning = false;
  }

  let apiCall = "";

  async function onTheRange() {
    $("#onTheRange .spinner").addClass("lds-hourglass");
    $("#onTheRange").addClass("is-active");
    $(".onTheRange-container").show();

    $(".main-container").hide();
    $("#footnotes").hide();
    $(".comments-container").hide();
    $("#seasonData").removeClass("is-active");
    $("#eventData").removeClass("is-active");
    $("#commentsPage").removeClass("is-active");

    // Uncomment this section to load results from fall season events (check notes first)
    // await $.get("api/seedScheduleOther", function (result) {
    //   eventDetails = result;
    //   console.log(eventDetails);
    // });
    // await $.get("api/seedResultsAll", function (result) {
    //   results = result;
    //   console.log(results);
    // });
    await $.get("api/liveField", function (result) {
      field = result;
      console.log(field);
    });
    await $.get("api/fieldData", function (result) {
      fieldData = result;
      console.log(fieldData);
    });
    await $.get("api/liveAllEvents", function (result) {
      leaderboard = result;
      console.log(leaderboard);
    });
    // add leaderboard data to fieldData data
    for (let i = 0; i < fieldData.length; i++) {
      for (let j = 0; j < leaderboard.length; j++) {
        if (fieldData[i].name === leaderboard[j].name) {
          fieldData[i].poolsterEarnings = leaderboard[j].poolsterEarnings;
          break;
        }
      }
    }

    fieldData = fieldData.sort(
      (a, b) => b.poolsterEarnings - a.poolsterEarnings
    );
    for (let i = 0; i < fieldData.length; i++) {
      fieldData[i].Players.sort((a, b) => a.tier - b.tier);
      for (let j = 0; j < fieldData[i].Players.length; j++) {
        fieldData[i].Players[j].Results.sort(function (a, b) {
          if (a.startDate > b.startDate) return -1;
          else return 1;
        });
        fieldData[i].Players[j].Results = fieldData[i].Players[j].Results.slice(
          0,
          5
        );
        fieldData[i].Players[j].name = fieldData[i].Players[j].name.split(
          " "
        )[1];

        let a = fieldData[i].Players[j];
        a.form = "";
        for (let k = 0; k < fieldData[i].Players[j].Results.length; k++) {
          a.form += a.Results[k].pos + ",&shy;";
          // a.form += a.Results[k].pos + ",&#8203;";
          // a.form += a.Results[k].pos + ",";
        }
        a.form = a.form.split(",").slice(0, -1).join(",");
      }
    }
    await addRanking(fieldData);
    console.log(fieldData);

    // to display data
    $(".onTheRange-container > tbody").html("");
    for (let i = 0; i < fieldData.length; i++) {
      var tr1 = $(
        "<tr><td class='rankingField'>" +
          fieldData[i].rankingDisplay +
          "</td><td class = 'poolsterHandleField'>" +
          fieldData[i].handle +
          "<p class='poolsterNameField'>" +
          fieldData[i].name +
          "</td>"
      );
      var tr2 = $(
        "<tr class='addRows'><td></td><td class='teeTimeLabel'>" +
          "Tee-time" +
          "</td></tr>"
      );
      var tr3 = $(
        "<tr class='addRows lastRow'><td></td><td class='formLabel'>" +
          "Form" +
          "</td></tr>"
      );

      for (let j = 0; j < fieldData[i].Players.length; j++) {
        let player = fieldData[i].Players[j];
        if (player.teeTime != 0) {
          player.form = player.form
            .replace(
              /\b(T?[1-5])\b/gm,
              (el) => "<b class='yellow'>" + el + "</b>"
            )
            .replace(/MC|WD/gm, (el) => el.fontcolor("red"));
          var tr1b = $(
            "<td class='imageDiv'><img class='playerImage playing' src=" +
              player.image +
              ">" +
              "<p class='playerName'>" +
              player.name +
              "</p></td>"
          );
          var tr2b = $("<td class='teeTime'>" + player.teeTime + "</td>");
          var tr3b = $("<td class='form'>" + player.form + "</td>");
        } else {
          var tr1b = $(
            "<td class='imageDiv'><img class='playerImage imageNP' src=" +
              player.image +
              "><p class='playerName nameNP'>" +
              player.name +
              "</p></td></tr>"
          );
          var tr2b = $("<td></td>");
          var tr3b = $("<td></td>");
        }
        $(tr1).append(tr1b);
        $(tr2).append(tr2b);
        $(tr3).append(tr3b);
      }
      $(".onTheRange-container > tbody").append(tr1).append(tr2).append(tr3);
    }
    $("#onTheRange .spinner").removeClass("lds-hourglass");
  }

  async function liveEvent() {
    if (refreshRunning === false) {
      $("#liveScoring .spinner").addClass("lds-hourglass");
    }
    $(".main-container").show();
    $(".tapToReveal").hide();
    $(".refreshContainer").show();
    $(".onTheRange-container").hide();
    $(".comments-container").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Current tournament details:");
    apiCall = "Live";
    $("#liveScoring").addClass("is-active");
    $(".text-danger").removeClass("Blink");
    $("#eventData").removeClass("is-active");
    $("#seasonData").removeClass("is-active");
    $("#onTheRange").removeClass("is-active");
    $("#commentsPage").removeClass("is-active");

    console.log("liveEvent function");

    let livePositions = [];

    //new code for liveFreeze/liveExit functionality
    await $.get("api/liveTourneyStatus", function (result) {
      liveStatus = result;
    });

    // test for Final -> exit
    if (liveStatus.length === 0) {
      liveExit = true;
      console.log("empty liveStatus array indicating new Final status");
    }
    // freeze test for Final && Round 1/2/3 combo, indicated by asterisk
    else if (/\*/.test(liveStatus[0].status)) {
      console.log("freeze test passed");
      await $.get("api/livePositionsFreeze", function (result) {
        livePositions = result;
      });
    } else {
      console.log("freeze test not passed");
      await $.get("api/livePositions", function (result) {
        livePositions = result;
      });
    }
    console.log(livePositions);

    if (liveExit) {
      $("#liveScoring").hide();
      seasonData();
      return;
    }

    //list of amateurs playing in tournament; required if '(a)' not appended to name on ESPN leaderboard
    let ams = ["Davis Thompson", "Chun An Yu"];

    for (let i = 0; i < ams.length; i++) {
      for (let j = 0; j < livePositions.length; j++) {
        if (ams[i] == livePositions[j].playerName) {
          livePositions[j].playerName = livePositions[j].playerName + " (a)";
          // console.log(livePositions[j].playerName);
          break;
        }
      }
    }

    // START OF IF STATEMENT FOR LIVE TC
    if (liveStatus[0].name === "Tour Championship") {
      liveTC = true;
      let hCapTbl = [];
      console.log("reranking TC");
      await $.get("api/liveTCHandicap", function (result) {
        hCapTbl = result;
      });

      // calculate gross scores for LIVE TC
      for (let i in hCapTbl) {
        for (let j = 0; j < livePositions.length; j++) {
          if (hCapTbl[i].playerName === livePositions[j].playerName) {
            hCapTbl[i].gross = livePositions[j].toParAdj - hCapTbl[i].handicap;
            break;
          }
        }
      }
      // sort TC live based on gross scores
      hCapTbl = hCapTbl.sort((a, b) => a.gross - b.gross);
      // now rank TC live
      addRanking(hCapTbl);

      // edits livePositions with live TC position data
      for (let i = 0; i < livePositions.length; i++) {
        for (let j = 0; j < hCapTbl.length; j++) {
          if (livePositions[i].playerName === hCapTbl[j].playerName) {
            livePositions[i].fecPos = livePositions[i].pos;
            livePositions[i].pos = hCapTbl[j].rankingDisplay;
            livePositions[i].posAdj = hCapTbl[j].ranking;
            livePositions[i].net = livePositions[i].toPar;
            livePositions[i].toPar = hCapTbl[j].gross
              .toString()
              .replace(/^0$/, "E")
              .replace(/(^\d)/, "+$1");
            livePositions[i].handicap = hCapTbl[j].handicap;
            break;
          }
        }
      }
      livePositions = livePositions.sort((a, b) => a.posAdj - b.posAdj);
      console.log(hCapTbl);
      console.log(livePositions);
    }
    // END OF IF STATEMENT FOR LIVE TC

    await $.get("api/livePlayers", function (result) {
      livePlayers = result;
      console.log(livePlayers);
    });
    await $.get("api/liveAllEvents", function (result) {
      partResult = result;
      console.log(partResult);
    });
    await $.get("api/liveSchedule", function (result) {
      liveSchedule = result;
      console.log(liveSchedule);
    });
    await $.get("api/livePurseSplit", function (result) {
      livePurseSplit = result;
      console.log(livePurseSplit);
    });
    await $.get("api/liveMCLine", function (result) {
      mcTop = Number(result[0].tMCLine);
      tenShotRule = Number(result[0].tTenShotRule);
    });

    let roundStatus = liveSchedule[0].status;
    round = roundStatus.match(/\d/)[0];
    console.log("round: ", round);

    let livePositionsLen = livePositions.length;
    console.log(
      "field size: ",
      livePositionsLen,
      "cut line (top): ",
      mcTop,
      "10-shot rule: ",
      tenShotRule
    );
    // for Masters 10-short rule
    if (tenShotRule) {
      let within10shotsPos = 999;
      console.log("10 shotter rule applies this week");
      let leaderScore = livePositions[0].toPar.replace("E", 0).replace("+", "");
      let leaderScorePlus10 = +leaderScore + 10;
      console.log(
        "leaderScore: ",
        leaderScore,
        "leaderScorePlus10: ",
        leaderScorePlus10
      );
      for (let i in livePositions) {
        if (
          livePositions[i].toPar.replace("E", 0).replace("+", "") >
          leaderScorePlus10
        ) {
          within10shotsPos = livePositions[i - 1].posAdj;
          console.log("within 10 shots POSITION: ", within10shotsPos);
          break;
        }
      }
      if (within10shotsPos > mcTop) {
        console.log("10-shot rule in play");
        mcTop = Math.max(mcTop, within10shotsPos);
      } else {
        console.log("10-shot rule not in play");
      }
      console.log("mcTop post 10-shot code: ", mcTop);
    }

    // to determine if tournament has a cut or not
    if (livePositionsLen <= mcTop) {
      noCut = true;
      console.log("noCut value", noCut);
    }

    // creates purseArr and counts the number of players (and amateurs) at each position for the entire field
    let purseArr = [];
    for (let i in livePositions) {
      let match = false;
      let am = /\(a\)$/im.test(livePositions[i].playerName);

      for (let j in purseArr) {
        if (purseArr[j].pos === livePositions[i].posAdj) {
          purseArr[j].data[0].count += 1;
          if (am) {
            purseArr[j].data[0].amCount += 1;
          }
          match = true;
          break;
        }
      }
      if (!match && am) {
        purseArr.push({
          pos: livePositions[i].posAdj,
          data: [{ count: 1, amCount: 1 }],
        });
      } else if (!match) {
        purseArr.push({
          pos: livePositions[i].posAdj,
          data: [{ count: 1, amCount: 0 }],
        });
      }
    }

    console.log(purseArr);

    let purseSum = 0;
    let purseSumComp = "";

    // calculate rounds 1 & 2 in progress cut-line from purseArr
    for (let i = 0; i < purseArr.length - 1; i++) {
      if (round < 3 && Number(purseArr[i + 1].pos) > mcTop) {
        mcPos = Number(purseArr[i].pos);
        console.log("mcPos: ", mcPos);
        break;
      }
    }

    //for US Open only
    // purse split values in table based on 80 players making cut
    // if only 60 players make cut, earnings for positions 3 and lower are 3.7% higher; code provides prorated adjustment for 60 to 79 players making cut
    let usOpenPurseAdjFactor = 1.0;
    if (liveSchedule[0].name == "The U.S. Open") {
      let playersMakingCut = 99;
      for (let i = 0; i < livePositions.length - 1; i++) {
        if (
          (round < 3 && Number(livePositions[i + 1].posAdj) > mcTop) ||
          (round > 2 && Number(livePositions[i + 1].posAdj) === 0)
        ) {
          playersMakingCut = Number(livePositions[i].id);
          console.log("playersMakingCut: ", playersMakingCut);
          break;
        }
      }
      usOpenPurseAdjFactor = 1 + ((80 - playersMakingCut) / 20) * 0.037;
      console.log("usOpenPurseAdjFactor: ", usOpenPurseAdjFactor);
    }

    //calculates purse values for each position in purseArr
    let amTotal = 0;
    for (let i = 0; i < purseArr.length; i++) {
      if (purseArr[i].pos > 0) {
        if (purseArr[i].data[0].count === 1) {
          purseArr[i].data[0].avgPercent =
            typeof livePurseSplit[purseArr[i].pos - 1 - amTotal] === "undefined"
              ? 0
              : purseArr[i].pos < 3
              ? Number(livePurseSplit[purseArr[i].pos - 1 - amTotal].percent)
              : Number(livePurseSplit[purseArr[i].pos - 1 - amTotal].percent) *
                usOpenPurseAdjFactor;
          purseArr[i].data[0].dollars =
            (purseArr[i].data[0].avgPercent * liveSchedule[0].purse) / 100;
          if (purseArr[i].data[0].amCount === 1) {
            amTotal++;
          }
        } else {
          purseSum = 0;
          purseSumComp = "";
          let posAmCount = purseArr[i].data[0].amCount;

          for (let j = 0; j < purseArr[i].data[0].count - posAmCount; j++) {
            purseSum +=
              typeof livePurseSplit[
                Number(purseArr[i].pos) + j - 1 - amTotal
              ] === "undefined"
                ? 0.183
                : +purseArr[i].pos + j < 3
                ? Number(
                    livePurseSplit[Number(purseArr[i].pos) + j - 1 - amTotal]
                      .percent
                  )
                : Number(
                    livePurseSplit[Number(purseArr[i].pos) + j - 1 - amTotal]
                      .percent
                  ) * usOpenPurseAdjFactor;
            purseSumComp +=
              typeof livePurseSplit[
                Number(purseArr[i].pos) + j - 1 - amTotal
              ] === "undefined"
                ? 0.183 + ", "
                : livePurseSplit[Number(purseArr[i].pos) + j - 1 - amTotal]
                    .percent + ", ";
          }
          amTotal += purseArr[i].data[0].amCount;
          purseSumComp = purseSumComp.replace(/, $/, "");
          purseArr[i].data[0].comp = purseSumComp;
          purseArr[i].data[0].totPercent = purseSum;
          purseArr[i].data[0].avgPercent =
            purseSum / (purseArr[i].data[0].count - posAmCount);
          purseArr[i].data[0].dollars =
            (purseArr[i].data[0].avgPercent * liveSchedule[0].purse) / 100;
        }
      }
      if (
        (round < 3 && Number(purseArr[i].pos) > mcTop) ||
        Number(purseArr[i].pos) == 0
      ) {
        purseArr[i].data[0].comp = "";
        purseArr[i].data[0].totPercent = 0;
        purseArr[i].data[0].avgPercent = 0;
        purseArr[i].data[0].dollars = 0;
      }
    }
    console.log("amTotal: ", amTotal);
    console.log(purseArr);

    // add purse info to livePositions array
    let totalDollars = 0;
    for (let i in livePositions) {
      for (let j in purseArr) {
        if (livePositions[i].posAdj === purseArr[j].pos) {
          livePositions[i].avgPercent = purseArr[j].data[0].avgPercent;
          livePositions[i].dollars = purseArr[j].data[0].dollars;
          if (/\(a\)$/im.test(livePositions[i].playerName)) {
            livePositions[i].avgPercent = 0;
            livePositions[i].dollars = 0;
          }
          if (livePositions[i].posAdj < mcTop) {
            totalDollars += livePositions[i].dollars;
          }
          break;
        }
      }
    }
    console.log(totalDollars);
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
            a[j].Tournaments[0].net = livePositions[k].net;
            a[j].Tournaments[0].handicap = livePositions[k].handicap;
            a[j].Tournaments[0].fecPos = livePositions[k].fecPos;
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
      livePlayers[i]["poolsterEarnings"] = Math.round(poolsterSum);
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

    $("#lastUpdate").html("");
    let now = moment().format("LT");
    $("#lastUpdate").append("last update: " + now);

    sortData(livePlayers);
    $("#seasonData .spinner").removeClass("lds-hourglass");
  }

  //for the section at the top of the leaderboard
  function lastEventDetails() {
    console.log("entering lastEventDetails function");
    $.get("api/lastEventDetails", function (result) {
      lastEventCount = result.length;
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
    console.log("exiting lastEventDetails function");
  }

  let mainData = [],
    partData = [];

  $(document).on("click", "#seasonData", seasonData);

  function seasonData() {
    $("#seasonData .spinner").addClass("lds-hourglass");
    $(".comments-container").hide();
    $(".onTheRange-container").hide();
    $(".main-container").show();
    $("#footnotes").show(4000);
    console.log("entering seasonData function");
    $("#seasonData").addClass("is-loading");
    $("#lastEventTitle").show();
    $("#lastEventTitle").text(
      "Results reflect all tournaments up to and including:"
    );
    lastEventDetails();
    $(".tapToReveal").show();
    $(".refreshContainer").hide();
    apiCall = "Season";
    liveTC = false;
    $("#eventData").removeClass("is-active");
    $("#liveScoring").removeClass("is-active");
    $("#onTheRange").removeClass("is-active");
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
  }

  $(document).on("click", "#eventData", eventData);

  function eventData() {
    $("#eventData .spinner").addClass("lds-hourglass");
    $(".main-container").show();
    $(".comments-container").hide();
    $(".onTheRange-container").hide();
    $("#footnotes").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Tournament details:");
    lastEventDetails();
    $(".tapToReveal").show();
    $(".refreshContainer").hide();
    apiCall = "Event";
    liveTC = false;
    $("#eventData").addClass("is-loading");
    $.get("/api/lastEvent", function (data) {
      sumData(data);
      $("#eventData").addClass("is-active");
      $("#seasonData").removeClass("is-active");
      $("#liveScoring").removeClass("is-active");
      $("#onTheRange").removeClass("is-active");
      $("#commentsPage").removeClass("is-active");
    });
  }

  function sumData(data, sortedPartResult, playerRankings) {
    //to sum earnings by player and poolster
    let a, b;
    let result = [];
    // iAdj below accounts for inactive players being the ONLY players on a poolster's team (it handles an empty array issue)
    let iAdj = 0;
    console.log(data);
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
              shortName: b[k].shortName,
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

  function addRanking(sorted) {
    // add ranking
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
    // now add "T" for ties to ranking
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
  }

  function sortData(result, sortedPartResult, playerRankings) {
    // to sort all the data passed to function
    const sorted = result.sort(
      (a, b) =>
        b.poolsterEarnings - a.poolsterEarnings ||
        b.Players.length - a.Players.length
    );

    addRanking(sorted);

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
    //for hard-coding round and other variables
    // round = 2;
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
          "<span>" +
          (sorted[i].poolster === "The Trader"
            ? "<i class='fas fa-ribbon'></i>" + " "
            : "") +
          sorted[i].poolster +
          (apiCall == "Live"
            ? "<small>" + sorted[i].liveZeroPlayersText + "</small>"
            : "") +
          " " +
          (sorted[i].poolster === "The Trader"
            ? "<i class='fas fa-ribbon'></i>"
            : sorted[i].playerCount > 0 &&
              apiCall == "Season" &&
              sorted[i].poolster !== "The Trader"
            ? "<i class='subIcon2 material-icons md-dark md-inactive md-15'>swap_horizontal_circle</i>"
            : sorted[i].playerCount == 0 && apiCall == "Season"
            ? "<i class='subIcon1 material-icons md-15'>swap_horizontal_circle</i>"
            : "") +
          "</span>" +
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
        // if (apiCall === "Live") {
        //   console.log(
        //     noCut,
        //     round,
        //     sorted[i].Players[j].Tournaments[0].posAdj,
        //     mcPos
        //   );
        // }
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
            // to add Live data to this layer
            (liveTC ? "<p class = 'poolVersion'>" + "Pool: " : "") +
            (apiCall === "Live" &&
            round == 1 &&
            /am|pm/i.test(sorted[i].Players[j].Tournaments[0].thru)
              ? " | To Par " +
                sorted[i].Players[j].Tournaments[0].toPar +
                " | " +
                sorted[i].Players[j].Tournaments[0].thru
              : "") +
            (apiCall === "Live" &&
            !(
              round == 1 &&
              /am|pm/i.test(sorted[i].Players[j].Tournaments[0].thru)
            )
              ? " | " +
                "<span class='posHighlite'>" +
                "Pos " +
                sorted[i].Players[j].Tournaments[0].position +
                "</span>" +
                (/am|pm/i.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? " | To Par " +
                    sorted[i].Players[j].Tournaments[0].toPar +
                    "<span class='todaysScore'>" +
                    " (" +
                    sorted[i].Players[j].Tournaments[0].thru +
                    ")" +
                    "</span>"
                  : /^\d+$/.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? " | To Par " +
                    sorted[i].Players[j].Tournaments[0].toPar +
                    "<span class='todaysScore'>" +
                    " (today: " +
                    sorted[i].Players[j].Tournaments[0].today +
                    " thru " +
                    sorted[i].Players[j].Tournaments[0].thru +
                    ")" +
                    "</span>"
                  : /F/i.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? " | To Par " +
                    sorted[i].Players[j].Tournaments[0].toPar +
                    "<span class='todaysScore'>" +
                    " (today: " +
                    sorted[i].Players[j].Tournaments[0].today +
                    " thru 18)" +
                    "</span>"
                  : "") +
                (noCut === false &&
                round == 2 &&
                !/Play Complete/i.test(liveStatus[0].status)
                  ? sorted[i].Players[j].Tournaments[0].posAdj > mcPos
                    ? " " +
                      "<i class='fas fa-exclamation-circle fa-s' style='color:red'></i>"
                    : sorted[i].Players[j].Tournaments[0].posAdj == mcPos
                    ? " " +
                      "<i class='fas fa-exclamation-triangle fa-s' style='color:orange'></i>"
                    : ""
                  : "")
              : "") +
            (liveTC
              ? "</p>" +
                "<p class='fecVersion'>" +
                (round == 1 &&
                /am|pm/i.test(sorted[i].Players[j].Tournaments[0].thru)
                  ? "FedEx Cup: To Par " +
                    sorted[i].Players[j].Tournaments[0].net +
                    " (handicap: " +
                    sorted[i].Players[j].Tournaments[0].handicap +
                    ")"
                  : "FedEx Cup: Pos " +
                    sorted[i].Players[j].Tournaments[0].fecPos +
                    " | To Par " +
                    sorted[i].Players[j].Tournaments[0].net +
                    " (handicap: " +
                    sorted[i].Players[j].Tournaments[0].handicap +
                    ")" +
                    "</p>")
              : "") +
            " " +
            (apiCall === "Season"
              ? "<i title = 'Category earnings (including any subs) are " +
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
                  : "")
              : "") +
            (apiCall === "Event" && lastEventCount > 1
              ? " | " + sorted[i].Players[j].tournaments[0].shortName
              : "") +
            (apiCall === "Event"
              ? " | " + sorted[i].Players[j].tournaments[0].position
              : "") +
            "</td><td class='earnings'>" +
            sorted[i].Players[j].playerEarnings.toLocaleString("us-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) +
            "</td></tr>"
        );

        if (apiCall === "Season") {
          $(".level2").addClass("pointer");
        } else {
          $(".level2").removeClass("pointer");
        }

        //to include this layer only if apiCall === "Season"
        if (apiCall === "Season") {
          for (let k = 0; k < sorted[i].Players[j].tournaments.length; k++) {
            $(".leaderboard-container").append(
              "<tr class='level3 hiddenRow collapse' id='demo-" +
                i +
                "-" +
                j +
                "' ><td class='level3A' colspan='4'>" +
                sorted[i].Players[j].tournaments[k].date +
                " | " +
                sorted[i].Players[j].tournaments[k].shortName +
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
      if (apiCall === "Season") {
        $("#seasonData .spinner").removeClass("lds-hourglass");
      }
      if (apiCall === "Event") {
        $("#eventData .spinner").removeClass("lds-hourglass");
      }
      if (apiCall === "Live") {
        $("#liveScoring .spinner").removeClass("lds-hourglass");
      }
    }

    if (apiCall === "Event") {
      $("#tcCalcTableLink").show();
    } else {
      $("#tcCalcTableLink").hide();
    }

    $(function () {
      $(".poolsterHandle").each(function () {
        var fitWidth = $(".poolsterHandle").innerWidth();
        var $div = $(this);
        $(this)
          .find("span")
          .each(function () {
            var c = 0;
            var spanWidth = parseInt($(this).width());
            while (fitWidth < 1.1 * spanWidth) {
              $div.find("span").each(function () {
                var fontSize = parseFloat($(this).css("font-size"));
                fontSize = fontSize - 0.5 + "px";
                $(this).css("font-size", fontSize);
              });
              spanWidth = parseInt($(this).width());
              c++;
              if (c > 10) {
                $div.css("background", "red");
                break;
              }
            }
          });
      });
    });
    // $(function () {
    //   $(".level2").each(function () {
    //     // var fitWidth = $(".level2").innerWidth() - $(".earnings").innerWidth();
    //     var fitWidth = $(".level2A").actual("width");
    //     console.log("fitWidth ", fitWidth);
    //     var $div = $(this);
    //     $(this)
    //       .find("td:first-child")
    //       .each(function () {
    //         var c = 0;
    //         var spanWidth = parseInt($(this).width());
    //         console.log(
    //           "spanWidth prior to while loop ",
    //           (spanWidth * 1.1).toFixed(1)
    //         );
    //         while (fitWidth < 1.2 * spanWidth) {
    //           $div.find("span").each(function () {
    //             var fontSize = parseFloat($(this).css("font-size"));
    //             console.log("fontSize 1", fontSize);
    //             fontSize = fontSize - 0.5 + "px";
    //             console.log("fontSize 2 ", fontSize);
    //             $(this).css("font-size", fontSize);
    //           });
    //           spanWidth = parseInt($(this).width());
    //           console.log("spanWidth ", (spanWidth * 1.1).toFixed(1));
    //           c++;
    //           console.log("c ", c);
    //           if (c > 3) {
    //             $div.css("background", "red");
    //             break;
    //           }
    //         }
    //       });
    //   });
    // });

    // var temp = $(".logo").actual("width");
    // console.log(temp);

    $("footer").show(4000);

    console.log(sorted);
  }

  // ---------COMMENTS PAGE SECTION-------------

  $(document).on("click", "#commentsPage", commentsPage);

  function commentsPage() {
    $(".main-container").hide();
    $("#footnotes").hide();
    $("#seasonData").removeClass("is-active");
    $("#eventData").removeClass("is-active");
    $("#liveScoring").removeClass("is-active");
    $("#onTheRange").removeClass("is-active");
    $("#commentsPage").addClass("is-active");

    $(".comments-container").show();
    $(".tabs-container").show();
    $(".submit-comments-container").show();
    $("#submitComments").addClass("is-active");
    $(".display-comments-container").hide();
    $(".onTheRange-container").hide();
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
