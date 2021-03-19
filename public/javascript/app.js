$(document).ready(function () {
  // window.onload = () => {
  //   "use strict";
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker.register("./sw.js");
  //   }
  // };

  let mcPos = 99,
    round = 0,
    noCut = false,
    resultsRefresh = false,
    liveExit = false,
    liveTC = false,
    lastEventCount = 0,
    liveStatus = [],
    week0 = false,
    week1 = false,
    fieldName = "",
    fieldDate = "",
    lastEventName = "",
    roundStatus = "",
    idx = 0,
    primaryTournamentId = "";

  const today = moment().format();
  console.log("today: ", today);
  const Year = moment(today).year();
  // const today = moment("2020-02-28");
  // const Year = 2020;

  $("#liveScoring").hide();
  $("#onTheRange").hide();
  $(".onTheRange-container").hide();
  $("#lastEventTitle").hide();
  $("#tcCalcTableLink").hide();
  $(".refreshContainer").hide();
  $("#footnotes").hide();
  $("footer").hide();
  $("#seasonData .spinner").addClass("lds-hourglass");

  thisYearsEvents();
  pageLoad();

  async function pageLoad() {
    await poolsterProfileImage();
    await eventCheck();
    await missingResults();
    lastEventDetails();
    await displayLiveTab();
    setTimeout(async function () {
      seasonData();
      // liveEvent();
    }, 1000);
  }

  // function to seed current images in db table
  async function poolsterProfileImage() {
    await $.get("api/poolsterProfileImage", function (result) {
      let poolsterImage = result;
      console.log(poolsterImage);
    });
  }

  async function displayLiveTab() {
    console.log("running displayLiveTab");
    await $.get("api/liveTourneyStatus", function (result) {
      console.log(result);
      if (result.length >= 1) {
        primaryTournamentId = result[0].tournamentId;
        fieldDate = result[0].tDate;
        if (result.length === 2) {
          fieldName = result[0].name + "; " + result[1].name;
        } else if (/the players championship/i.test(result[0].name)) {
          fieldName = "The Alan D. Schneider Collars-Up Players Championship";
        } else {
          fieldName = result[0].name;
        }
        console.log(fieldName, fieldDate);
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
    $(".main-container").show();
    $(".leaderboard-container").hide();
    $("#lastEventDetails").show();
    $("#lastEventTitle").text(`${fieldDate} | ${fieldName}`);
    $("#lastEventDetails").text("");
    $("#footnotes").hide();
    $("#seasonData").removeClass("is-active");
    $("#eventData").removeClass("is-active");

    // Uncomment this section to load results to PRODUCTION from fall season events (check notes and test on local version first)
    // Start of block 1
    // await $.get("api/seedScheduleOther", function (result) {
    //   eventDetails = result;
    //   console.log(eventDetails);
    // });
    // await $.get("api/seedResultsAll", function (result) {
    //   results = result;
    //   console.log(results);
    // });
    // End of block 1

    // For any tournaments which ESPN don't record results, but PGA does
    // Start of block 2
    // await $.get("api/seedResultsPGA", function (result) {
    //   results = result;
    //   console.log(results);
    // });
    // End of block 2

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

    fieldData = fieldData.sort((a, b) => {
      if (a.poolsterEarnings > b.poolsterEarnings) return -1;
      if (a.poolsterEarnings < b.poolsterEarnings) return 1;
      if (a.handle > b.handle) return 1;
      if (a.handle < b.handle) return -1;
    });
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
        fieldData[i].Players[j].name = fieldData[i].Players[j].name
          .replace(" III", "")
          .split(" ")
          .pop();

        let a = fieldData[i].Players[j];

        if (fieldData[i].Players[j].tournamentId !== primaryTournamentId) {
          a.tourney = "secondary";
        } else {
          a.tourney = "primary";
        }

        a.form = "";
        for (let k = 0; k < fieldData[i].Players[j].Results.length; k++) {
          // a.form += a.Results[k].pos + "," + "<span class='hide'>&shy;</span>";
          a.form += a.Results[k].pos + ",&#8203;";
          // a.form += a.Results[k].pos + ",&thinsp;";
          // a.form += a.Results[k].pos + ",";
        }
        // console.log(a.form);
        a.form = a.form.split(",").slice(0, -1).join(",");
      }
    }
    await addRanking(fieldData);
    console.log(fieldData);

    // to display data
    $(".onTheRange-container > tbody").html("");
    for (let i = 0; i < fieldData.length; i++) {
      var tr1 = $(
        "<tr><td style='max-width:1.25em' class='rankingField'>" +
          fieldData[i].rankingDisplay +
          "</td><td style='max-width:3.75em' class = 'poolsterHandleField'>" +
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
          // player.form = player.form.replace(
          //   /\b(T?[1-5])\b/gm,
          // (el) => "<b class='yellow'>" + el + "</b>"
          //   (el) => $(el).addClass("yellow")
          // );

          // .replace(/MC|WD/gm, (el) => el.fontcolor("red"));
          var tr1b = $(
            "<td class='imageDiv'>" +
              (player.tourney === "primary"
                ? "<img class ='playerImage playing primary'"
                : "<img class = 'playerImage playing secondary'") +
              " src=" +
              player.image +
              ">" +
              "<p class='playerName'>" +
              player.name +
              "</p></td>"
          );
          var tr2b = $("<td class='teeTime'>" + player.teeTime + "</td>");
          var tr3b = $(
            "<td class='form' style='padding: 0 0.25em;'>" +
              player.form +
              "</td>"
          );
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
    $(".refreshContainer").show();
    $(".onTheRange-container").hide();
    $("#footnotes").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Current tournament details:");
    apiCall = "Live";
    $("#liveScoring").addClass("is-active");
    $(".text-danger").removeClass("Blink");
    $("#eventData").removeClass("is-active");
    $("#seasonData").removeClass("is-active");
    $("#onTheRange").removeClass("is-active");

    console.log("liveEvent function");

    let livePositions = [];

    //new code for liveFreeze/liveExit functionality
    await $.get("api/liveTourneyStatus", function (result) {
      liveStatus = result;
      console.log(liveStatus);
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
    let ams = [];

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
    // END OF 'IF STATEMENT' FOR LIVE TC

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

    roundStatus = liveSchedule[0].status;
    console.log(/Round [1-3] - Play Complete/i.test(roundStatus));
    console.log(roundStatus);
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
    // for Masters 10-shot rule
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
    // End of Masters 10-shot rule code

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
    // End of US Open only

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

    //filter livePlayers for players who are playing in the tournament and add tournament performance data
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

    addRanking(partResult);

    // add priorRanking and priorEarnings to livePlayers array
    for (let i = 0; i < livePlayers.length; i++) {
      for (let j = 0; j < partResult.length; j++) {
        if (livePlayers[i].id === partResult[j].id) {
          livePlayers[i]["livePriorRanking"] = partResult[j].ranking;
          livePlayers[i]["livePriorRankingDisplay"] =
            partResult[j].rankingDisplay;
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
    // for (let i = 0; i < livePlayers.length; i++) {
    //   livePlayers[i].liveNewRanking = i + 1;
    // }

    // add ranking
    livePlayers[0].liveNewRanking = 1;
    let ties = 0;
    for (let i = 1; i < livePlayers.length; i++) {
      if (
        livePlayers[i].liveNewEarnings !== livePlayers[i - 1].liveNewEarnings
      ) {
        livePlayers[i].liveNewRanking = i + 1;
        ties = 0;
      } else {
        ties++;
        livePlayers[i].liveNewRanking = i + 1 - ties;
      }
    }
    // now add "T" for ties to liveNewRanking
    for (let i = 0; i < livePlayers.length; i++) {
      if (
        i === 0 &&
        livePlayers[0].liveNewRanking === livePlayers[1].liveNewRanking
      ) {
        livePlayers[0].liveNewRankingDisplay =
          "T" + livePlayers[i].liveNewRanking;
      } else if (
        i > 0 &&
        i < livePlayers.length - 1 &&
        (livePlayers[i].liveNewRanking === livePlayers[i - 1].liveNewRanking ||
          livePlayers[i].liveNewRanking === livePlayers[i + 1].liveNewRanking)
      ) {
        livePlayers[i].liveNewRankingDisplay =
          "T" + livePlayers[i].liveNewRanking;
      } else if (
        i === livePlayers.length - 1 &&
        livePlayers[i].liveNewRanking === livePlayers[i - 1].liveNewRanking
      ) {
        livePlayers[i].liveNewRankingDisplay =
          "T" + livePlayers[i].liveNewRanking;
      } else {
        livePlayers[i].liveNewRankingDisplay = livePlayers[i].liveNewRanking;
      }
    }

    // add liveRankingChange (and related) to LivePlayers array
    for (let i = 0; i < livePlayers.length; i++) {
      livePlayers[i].liveRankingChange =
        livePlayers[i].livePriorRanking - livePlayers[i].liveNewRanking;
      let l = livePlayers[i].liveRankingChange;
      livePlayers[i].liveRankingMove = l > 0 ? "up" : l < 0 ? "down" : "nc";
      livePlayers[i].liveRankingChangeAbs = Math.abs(l);
      livePlayers[i].liveZeroPlayersText = "";
      if (livePlayers[i].Players.length === 0) {
        livePlayers[i]["liveZeroPlayersText"] = "(0 players)";
      }
    }

    console.log(livePlayers);

    $.get("api/liveSchedule", function (result) {
      if (/the players championship/i.test(result[0].name)) {
        console.log("Players name change here for Live Scoring");
        result[0].name =
          "The Alan D. Schneider Collars-Up Players Championship";
      }
      $("#lastEventDetails").html("");
      for (let i = 0; i < result.length; i++) {
        $("#lastEventDetails").append(
          "<p>" +
            result[i].tDate +
            " | " +
            result[i].name +
            " | " +
            `${
              result[i].status || "NOTE: projected earnings not included below"
            }` +
            "</p>"
        );
      }
    });

    $("#lastUpdate").html("");
    let now = moment().format("LT");
    // for local time
    // let now = moment.utc(obj.created_on).local().format("LT")
    $("#lastUpdate").append("last update: " + now);

    sortData(livePlayers);
    $("#seasonData .spinner").removeClass("lds-hourglass");
  }

  async function thisYearsEvents() {
    await $.get("api/thisYearsEvents", function (result) {
      console.log(result);
      if (result.length == 0) {
        week0 = true;
      }
      if (result.length == 0 || result.length == 1) {
        week1 = true;
      }
      console.log(week0, week1);
      if (week0) {
        $("#eventData").hide();
        $("#lastEventTitle").html("");
        $("#lastEventDetails").html("");
        $("#lastEventTitle").text(
          `Welcome to the first event of the ${Year} Season!`
        );
      }
    });
  }

  //for the section at the top of the leaderboard
  function lastEventDetails() {
    console.log("entering lastEventDetails function");
    $.get("api/lastEventDetails", function (result) {
      lastEventCount = result.length;
      if (/the players championship/i.test(result[0].name)) {
        result[0].name =
          "The Alan D. Schneider Collars-Up Players Championship";
      }
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
        lastEventName = result[i].name;
      }
    });
    console.log("exiting lastEventDetails function");
  }

  let mainData = [],
    partData = [];

  // $("#seasonData").on("click",seasonData);
  $(document).on("click", "#seasonData", seasonData);

  function seasonData() {
    $("#seasonData .spinner").addClass("lds-hourglass");
    $(".onTheRange-container").hide();
    $(".main-container").show();
    $(".leaderboard-container").show();
    $("#footnotes").show(2000);
    // $("#playerRatingsLang").show();
    console.log("entering seasonData function");
    $("#seasonData").addClass("is-loading");
    $("#lastEventTitle").show();
    if (week0) {
      $("#eventData").hide();
      $("#lastEventTitle").html("");
      $("#lastEventDetails").html("");
      $("#lastEventTitle").text(
        `Welcome to the first event of the ${Year} Season!`
      );
    } else {
      $("#lastEventTitle").text("Results reflect all tournaments through:");
      lastEventDetails();
    }

    $(".refreshContainer").hide();
    apiCall = "Season";
    liveTC = false;
    $("#eventData").removeClass("is-active");
    $("#liveScoring").removeClass("is-active");
    $("#onTheRange").removeClass("is-active");
    $("#seasonData").addClass("is-active");

    const promise1 = $.get("api/allEvents");
    const promise2 = $.get("/api/allExclLastEvent");
    const promise3 = $.get("api/playerRatings");

    Promise.all([promise1, promise2, promise3]).then(function (values) {
      console.log(values);
      const mainData = values[0];
      const partData = values[1];
      const playerRatings = values[2];
      restofSeason(mainData, partData, playerRatings);
    });
  }

  function restofSeason(mainData, partData, playerRatings) {
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

    sortedPartResult[0].ranking = 1;
    for (let i = 1; i < sortedPartResult.length; i++) {
      let a = sortedPartResult[i - 1];
      let b = sortedPartResult[i];
      if (a.poolsterEarnings !== b.poolsterEarnings) {
        b.ranking = i + 1;
      } else {
        b.ranking = a.ranking;
      }
    }
    console.log(sortedPartResult);
    sumData(mainData, sortedPartResult, playerRatings);
  }

  $(document).on("click", "#eventData", eventData);

  function eventData() {
    $("#eventData .spinner").addClass("lds-hourglass");
    $(".main-container").show();
    $(".leaderboard-container").show();
    $(".onTheRange-container").hide();
    $("#footnotes").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text("Tournament details:");
    lastEventDetails();
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
    });
  }

  $(document).on("click", "#subH1Pool", subData);

  function subData() {
    $("#footnotes").hide();
    $("#lastEventTitle").show();
    $("#lastEventTitle").text(
      "First Half Substitution Mini-Pool - results through:"
    );
    apiCall = "Sub";
    liveTC = false;
    $.get("/api/allEvents", function (data) {
      sumData(data);
      $("#seasonData").removeClass("is-active");
      $(".leaderboard-container tbody tr.level1").removeAttr("data-toggle");
      $(
        ".leaderboard-container tbody tr.level1 .poolsterImage,.poolsterHandle,.poolsterName"
      ).addClass("noPointer");
      $(".leaderboard-container tbody tr.level2").removeClass("collapse");
    });
  }

  const Jan01 = moment([Year, 0, 2]).format();
  const Dec31 = moment([Year, 11, 30]).format();
  // console.log(Jan01, Dec31);
  // make subDay the day of the first round of the midway event
  const subDay = moment([Year, 6, 5]).format();
  // const subDay = moment([Year, 3, 29]).format();
  if (today > subDay) {
    $(".subHalfLang").text((i, t) => t.replace(/First/, "Second"));
  }

  function sumData(data, sortedPartResult, playerRatings) {
    console.log(data);
    //to sum earnings by player and poolster
    let a, b, c;
    let result = [];
    let subPeriod = today < subDay ? "H1" : "H2";
    //temp
    // subPeriod = "H2";
    // console.log(subPeriod, subDay);
    // iAdj below accounts for inactive players being the ONLY players on a poolster's team (it handles an empty array issue)
    let iAdj = 0;
    let jAdj = 0;
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

        jAdj = 0;
        for (let j = 0; j < a.length; j++) {
          let playerSum = 0;

          if (apiCall === "Sub") {
            // console.log(subPeriod, a[j].startDate, Jan01, subDay);
            if (
              !(
                (subPeriod === "H1" &&
                  a[j].startDate > Jan01 &&
                  a[j].startDate < subDay) ||
                (subPeriod === "H2" && a[j].startDate > subDay)
              )
            ) {
              jAdj++;
              continue;
            }
          }
          // console.log("Subs: ", result[i - iAdj].poolster, a[j].name);
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
            // subPoolEligible: "no",
            tournaments: [],
          });

          // console.log(a[j].startDate, Jan01, a[j].endDate, Dec31);
          if (a[j - jAdj].endDate < Dec31 && !a[j - jAdj].reStartDate) {
            result[i - iAdj].Players[j - jAdj].active = "no";
          }
          if (today < subDay) {
            if (
              a[j - jAdj].effDate < subDay &&
              a[j - jAdj].type !== "no-cost"
            ) {
              playerCount++;
            }
          } else {
            if (
              a[j - jAdj].effDate > subDay &&
              a[j - jAdj].type !== "no-cost"
            ) {
              playerCount++;
            }
          }

          b = a[j].Tournaments;
          for (let k = 0; k < b.length; k++) {
            if (apiCall === "Sub") {
              if (
                !(
                  (subPeriod === "H1" && b[k].start < subDay) ||
                  (subPeriod === "H2" && b[k].start > subDay)
                )
              ) {
                continue;
              }
            }

            playerSum += b[k].earnings;
            // poolsterSum += b[k].earnings;

            result[i - iAdj].Players[j - jAdj].tournaments.push({
              name: b[k].name,
              shortName: b[k].shortName,
              date: b[k].date,
              start: b[k].start,
              position: b[k].position,
              earnings: b[k].earnings,
              toPar: b[k].toPar,
              thru: b[k].thru,
              subPoolTourneyEligible: "no",
            });
          }
          poolsterSum += playerSum;

          result[i - iAdj].Players[j - jAdj]["playerEarnings"] = playerSum;
          result[i - iAdj]["poolsterEarnings"] = poolsterSum;
          result[i - iAdj]["playerCount"] = playerCount;
        }
      }
    }

    if (apiCall === "Sub") {
      result = result.filter((el) => el.Players.length > 0);
    }

    console.log(result);
    sortData(result, sortedPartResult, playerRatings);
  }

  function addRanking(sorted) {
    // add ranking
    sorted[0].ranking = 1;
    let ties = 0;
    console.log(sorted);
    if (sorted.length > 1) {
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
    } else {
      sorted[0].rankingDisplay = "1";
    }
  }

  function sortData(result, sortedPartResult, playerRatings) {
    // to sort all the data passed to function
    if (apiCall != "Live") {
      sorted = result.sort((a, b) => {
        if (a.poolsterEarnings > b.poolsterEarnings) return -1;
        if (a.poolsterEarnings < b.poolsterEarnings) return 1;
        if (a.poolster > b.poolster) return 1;
        if (a.poolster < b.poolster) return -1;
      });
    } else {
      // for Live only
      // first, sort by Players.length, DESC
      sorted = result.sort((a, b) => b.Players.length - a.Players.length);
      idx = sorted.length;

      // then, find index of first player with Players.length === 0
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].Players.length === 0) {
          idx = i;
          break;
        }
      }
      console.log(idx);

      // sort top half by poolsterEarnings, by poolster
      const top = sorted.slice(0, idx).sort((a, b) => {
        if (a.poolsterEarnings > b.poolsterEarnings) return -1;
        if (a.poolsterEarnings < b.poolsterEarnings) return 1;
        if (a.poolster > b.poolster) return 1;
        if (a.poolster < b.poolster) return -1;
      });
      // sort bottom half by poolster
      const bottom = sorted.slice(idx, sorted.length).sort((a, b) => {
        if (a.poolster < b.poolster) return -1;
        if (a.poolster > b.poolster) return 1;
      });
      // rejoin array
      sorted = top.concat(bottom);
    }

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
    console.log(sorted, playerRatings);
    displayData(sorted, sortedPartResult, playerRatings);
  }

  async function displayData(sorted, sortedPartResult, playerRatings) {
    //for hard-coding round and other variables
    // round = 2;
    // to display sorted results
    // to add prior ranking data to main arr
    if (apiCall === "Event" && lastEventName === "Tour Championship") {
      $("#tcCalcTableLink").show();
    } else {
      $("#tcCalcTableLink").hide();
    }

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
        for (let j = 0; j < playerRatings.length; j++)
          if (sorted[i].name == playerRatings[j].name) {
            for (let k = 0; k < sorted[i].Players.length; k++) {
              if (sorted[i].Players[k].active == "yes") {
                for (let l = 0; l < playerRatings[j].tier.length; l++) {
                  if (
                    sorted[i].Players[k].tier == playerRatings[j].tier[l].number
                  ) {
                    sorted[i].Players[k]["grade"] =
                      playerRatings[j].tier[l].grade;
                    sorted[i].Players[k]["poolAverage"] =
                      playerRatings[j].tier[l].average;
                    sorted[i].Players[k]["gradePercent"] =
                      playerRatings[j].tier[l].gradePercent;
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
          "' class='level1'><td class='ranking'>" +
          "<span>" +
          sorted[i].rankingDisplay +
          (apiCall == "Season" && !week1
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
            ? "<i class='fas fa-ribbon'></i>" +
              " " +
              sorted[i].poolster +
              " " +
              "<i class='fas fa-ribbon'></i>" +
              " "
            : sorted[i].poolster) +
          " " +
          (sorted[i].playerCount > 0 &&
          apiCall == "Season" &&
          sorted[i].poolster !== "The Trader"
            ? "<i title='Sub already used for this period' class='subIcon2 material-icons md-dark md-inactive md-15'>swap_horizontal_circle</i>"
            : sorted[i].playerCount == 0 &&
              apiCall == "Season" &&
              sorted[i].poolster !== "The Trader"
            ? "<i title='Sub available for this period' class='subIcon1 material-icons md-15'>swap_horizontal_circle</i>"
            : "") +
          "</span>" +
          "<p class='poolsterName'>" +
          sorted[i].name +
          (sorted[i].poolster === "The Snake" && apiCall == "Season"
            ? " " +
              "<span id='winnerTrophy'>" +
              "2020 " +
              "<i class='fas fa-trophy fa-sm'></i>" +
              "</span>"
            : "") +
          (apiCall == "Live" && sorted[i].liveZeroPlayersText
            ? "<p class='liveZeroPlayersText'><small>" +
              sorted[i].liveZeroPlayersText +
              "</small></p>"
            : "") +
          "</td><td class='earnings'>" +
          sorted[i].poolsterEarnings.toLocaleString("us-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) +
          // to add Start Proj table for Live version
          (apiCall == "Live" && !week0
            ? "<table class='liveProjTable'><tr><th>" +
              "Proj." +
              "</th><th>" +
              "Start" +
              "</th><th style='padding-left: 0.5em; padding-right: 0.5em'>" +
              "<i class='fas fa-long-arrow-alt-up'></i>" +
              "<i class='fas fa-long-arrow-alt-down'></i>" +
              "</th></tr><tr><td>" +
              sorted[i].liveNewRankingDisplay +
              "</td><td>" +
              sorted[i].livePriorRankingDisplay +
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
      if (apiCall === "Season" && !week0 && i === 6) {
        $("table > tbody > tr[data-target='#demo5']").addClass("podiumBreak");
        $("table > tbody > tr[data-target='#demo5'] > td:nth-child(3").addClass(
          "transparentBorder"
        );
      }
      if (apiCall === "Live" && i === idx) {
        $("table > tbody > tr[data-target='#demo" + i + "']").addClass(
          "liveZeroPlayersBreak"
        );
      }

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
          "<tr class='level2 collapse' id='demo" +
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
            (apiCall === "Live"
              ? /^Round 1 - [^Play Complete]/i.test(roundStatus) &&
                /am|pm/i.test(sorted[i].Players[j].Tournaments[0].thru)
                ? " | To Par " +
                  sorted[i].Players[j].Tournaments[0].toPar +
                  " | " +
                  sorted[i].Players[j].Tournaments[0].thru
                : // (apiCall === "Live" &&
                  // /Round [1-4] - Play Complete/i.test(roundStatus)
                  //   ? " | " +
                  //     "<span class='posHighlite'>" +
                  //     "Pos " +
                  //     sorted[i].Players[j].Tournaments[0].position +
                  //     "</span>" +
                  //     " | To Par " +
                  //     sorted[i].Players[j].Tournaments[0].toPar +
                  //     "<span class='todaysScore'>" +
                  //     " (" +
                  //     sorted[i].Players[j].Tournaments[0].thru +
                  //     ")" +
                  //     "</span"
                  //   : "") +
                  " | " +
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
                    : /^F$/i.test(sorted[i].Players[j].Tournaments[0].thru)
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
                "  "
              : "") +
            (apiCall === "Season" || apiCall === "Sub"
              ? (sorted[i].Players[j].active == "yes" &&
                (sorted[i].Players[j].startDate > Jan01 ||
                  sorted[i].Players[j].endDate < Dec31)
                  ? " | "
                  : "") +
                (sorted[i].Players[j].startDate > Jan01
                  ? " " +
                    "<i class='fas fa-user-plus fa-s' style='color:green'></i>" +
                    "  " +
                    moment(sorted[i].Players[j].startDate).format("MMM D")
                  : sorted[i].Players[j].endDate < Dec31
                  ? "<i class='fas fa-user-minus fa-s' style='color:grey'></i>" +
                    " " +
                    moment(sorted[i].Players[j].endDate).format("MMM D")
                  : "") +
                (sorted[i].Players[j].startDate > Jan01 &&
                sorted[i].Players[j].endDate < Dec31
                  ? " | " +
                    "<i class='fas fa-user-minus fa-s' style='color:grey'></i>" +
                    "  " +
                    moment(sorted[i].Players[j].endDate).format("MMM D")
                  : "") +
                (sorted[i].Players[j].reStartDate > Jan01
                  ? " | " +
                    "<i class='fas fa-user-plus fa-s' style='color:green'></i>" +
                    "  " +
                    moment(sorted[i].Players[j].reStartDate).format("MMM D")
                  : "")
              : "") +
            (apiCall === "Event" && lastEventCount > 1
              ? " | " + sorted[i].Players[j].tournaments[0].shortName
              : "") +
            (apiCall === "Event"
              ? " | " + sorted[i].Players[j].tournaments[0].position
              : "") +
            "</td><td class='earnings'>" +
            (apiCall !== "Sub"
              ? sorted[i].Players[j].playerEarnings.toLocaleString("us-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "") +
            "</td></tr>"
        );

        if (apiCall === "Season" || apiCall === "Sub") {
          $(".level2").addClass("pointer");
        } else {
          $(".level2").removeClass("pointer");
        }

        //to include this layer only if apiCall === "Season" or "Sub"
        if (apiCall === "Season" || apiCall === "Sub") {
          for (let k = 0; k < sorted[i].Players[j].tournaments.length; k++) {
            $(".leaderboard-container").append(
              "<tr class='level3 collapse' id='demo-" +
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
          resizeRanking();
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
    // to add inactive team note
    if (apiCall === "Event") {
      let inactiveTeams = [];
      $.get("api/poolsters", function (result) {
        inactiveTeams = result.filter(
          ({ handle: id1 }) => !sorted.some(({ poolster: id2 }) => id2 === id1)
        );
        inactiveTeams = inactiveTeams.sort((a, b) => {
          if (a.handle < b.handle) return -1;
          else return 1;
        });

        let row = "";
        // $(".leaderboard-container > tbody > tr:last").html("");
        if (inactiveTeams.length) {
          for (let i = 0; i < inactiveTeams.length; i++) {
            row += inactiveTeams[i].handle + ", ";
          }
          row = row.replace(/, $/, ".");
          if (inactiveTeams.length > 1) {
            console.log(row);
            let idx = row.lastIndexOf(",");
            row = row.split("");
            row.splice(idx, 1, " and");
            row = row.join("");
          }

          $(".leaderboard-container > tbody").append(
            "<tr><td colspan='5' scope='col' class='inactiveRow'>" +
              `All 6 players on the following ` +
              (inactiveTeams.length > 1
                ? `${inactiveTeams.length} teams`
                : `team`) +
              ` were idle: ` +
              row +
              "</td></tr>"
          );
        }
      });
    }

    // to resize poolsterHandle
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

    function resizeRanking() {
      $(".ranking").each(function () {
        var fitWidth = $(".ranking").innerWidth();
        var $div = $(this);
        $(this)
          .find("span")
          .each(function () {
            var c = 0;
            var spanWidth = parseInt($(this).width());
            while (fitWidth < spanWidth) {
              $div.find("span").each(function () {
                var fontSize = parseFloat($(this).css("font-size"));
                fontSize = fontSize - 0.5 + "px";
                $(this).css("font-size", fontSize);
              });
              spanWidth = parseInt($(this).width());
              c++;
              if (c > 20) {
                $div.css("background", "red");
                break;
              }
            }
          });
      });
    }

    $("footer").show(2000);

    console.log(sorted);
  }
});
