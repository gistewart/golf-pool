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

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'regular' WHERE (`id` = '22');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('4', '46', '2020-06-24', '2020-06-24', 'regular');


-- 6/24 changes (REMOTE)

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'no-cost' WHERE (`id` = '76');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('12', '46', '2020-06-24', '2020-06-24', 'no-cost');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'no-cost' WHERE (`id` = '47');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('7', '5', '2020-06-24', '2020-06-24', 'no-cost');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'regular' WHERE (`id` = '48');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('7', '6', '2020-06-24', '2020-06-24', 'regular');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-06-24', `effDate` = '2020-06-24', `type` = 'regular' WHERE (`id` = '22');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('4', '46', '2020-06-24', '2020-06-24', 'regular');

-- 6/29: LOCAL reload of 5 tournaments for Seung-yul Noh spelling issue

DELETE FROM `golf-pool_db`.`Results` WHERE (`tournamentId` = '401155419');
DELETE FROM `golf-pool_db`.`Results` WHERE (`tournamentId` = '401155420');
DELETE FROM `golf-pool_db`.`Results` WHERE (`tournamentId` = '401155421');
DELETE FROM `golf-pool_db`.`Results` WHERE (`tournamentId` = '401155426');
DELETE FROM `golf-pool_db`.`Results` WHERE (`tournamentId` = '401155466');

-- 6/29: REMOTE reload of 5 tournaments for Seung-yul Noh spelling issue

DELETE FROM `Results` WHERE (`tournamentId` = '401155419');
DELETE FROM `Results` WHERE (`tournamentId` = '401155420');
DELETE FROM `Results` WHERE (`tournamentId` = '401155421');
DELETE FROM `Results` WHERE (`tournamentId` = '401155426');
DELETE FROM `Results` WHERE (`tournamentId` = '401155466');



