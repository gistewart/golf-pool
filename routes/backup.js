// where: {
//   poolsterId: 1,
//   "$PoolsterPlayers.Player.playerId$": [1, 24],
// Filters as expected
// "$PoolsterPlayers.startDate$": {
//   [Op.lte]: "2020-01-27",

// Filters as expected
// "$PoolsterPlayers.Player.Results.Schedule.tStartDate$": {
//   [Op.lte]: "2020-01-27",

// Error: Unhandled rejection SequelizeDatabaseError: Incorrect DATETIME value: '$PoolsterPlayers.Player.Results.Schedule.tStartDate$'
// "$PoolsterPlayers.startDate$": {
//   [Op.lte]: "$PoolsterPlayers.Player.Results.Schedule.tStartDate$",

// Error: Unhandled rejection SequelizeDatabaseError: Unknown column '$PoolsterPlayers->Player->Results->Schedule.tStartDate$' in 'where clause'
// "$PoolsterPlayers.startDate$": {
//   [Op.lte]: sequelize.col(
//     "$PoolsterPlayers.Player.Results.Schedule.tStartDate$"
//   ),

// Error: Unhandled rejection SequelizeDatabaseError: Unknown column '$PoolsterPlayers->Player->Results->Schedule.tStartDate$' in 'where clause'
// "$PoolsterPlayers.startDate$": {
//   [Op.lte]: sequelize.fn(
//     "date",
//     sequelize.col(
//       "$PoolsterPlayers.Player.Results.Schedule.tStartDate$"
//     )
//   ),

// Error: Unhandled rejection SequelizeDatabaseError: Incorrect DATETIME value: 'Invalid date'
// "$PoolsterPlayers.startDate$": {
//   [Op.lte]: new Date(
//     "$PoolsterPlayers.Player.Results.Schedule.tStartDate$"
//   ),
// },
// },
