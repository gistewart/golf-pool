DROP DATABASE IF EXISTS golf-pool_db;
CREATE DATABASE golf-pool_db;

SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

SET FOREIGN_KEY_CHECKS = 0;

-- 6/24 changes (LOCAL)

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'no-cost' WHERE (`id` = '76');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('12', '46', '2020-06-24', '2020-06-24', 'no-cost');

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'no-cost' WHERE (`id` = '47');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('7', '5', '2020-06-24', '2020-06-24', 'no-cost');

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'regular' WHERE (`id` = '48');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('7', '6', '2020-06-24', '2020-06-24', 'regular');

-- 6/24 changes (REMOTE)

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'no-cost' WHERE (`id` = '76');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('12', '46', '2020-06-24', '2020-06-24', 'no-cost');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'no-cost' WHERE (`id` = '47');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('7', '5', '2020-06-24', '2020-06-24', 'no-cost');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'regular' WHERE (`id` = '48');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('7', '6', '2020-06-24', '2020-06-24', 'regular');





