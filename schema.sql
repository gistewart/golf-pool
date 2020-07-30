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


-- 7/1: LOCAL

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-07-01', `effDate` = '2020-07-01', `type` = 'regular' WHERE (`id` = '70');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('11', '46', '2020-07-01', '2020-07-01', 'regular');

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-07-01', `effDate` = '2020-07-01', `type` = 'regular' WHERE (`id` = '113');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('17', '45', '2020-07-01', '2020-07-01', 'regular');

UPDATE `golf-pool_db`.`PoolsterPlayers` SET `endDate` = '2020-07-01', `effDate` = '2020-07-01', `type` = 'regular' WHERE (`id` = '95');

INSERT INTO `golf-pool_db`.`PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('14', '6', '2020-07-01', '2020-07-01', 'regular');

-- 7/1: REMOTE

UPDATE `PoolsterPlayers` SET `endDate` = '2020-07-01', `effDate` = '2020-07-01', `type` = 'regular' WHERE (`id` = '70');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('11', '46', '2020-07-01', '2020-07-01', 'regular');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-07-01', `effDate` = '2020-07-01', `type` = 'regular' WHERE (`id` = '113');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('17', '45', '2020-07-01', '2020-07-01', 'regular');

UPDATE `PoolsterPlayers` SET `endDate` = '2020-07-01', `effDate` = '2020-07-01', `type` = 'regular' WHERE (`id` = '95');

INSERT INTO `PoolsterPlayers` (`poolsterId`, `playerId`, `startDate`, `effDate`, `type`) VALUES ('14', '6', '2020-07-01', '2020-07-01', 'regular');

-- 7/29 ScheduleShortName
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155413', 'Sentry');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155418', 'Sony');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155419', 'Amex');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155420', 'Farmers');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155421', 'Waste Man');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155422', 'AT&T Pro-Am');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155423', 'Genesis');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155424', 'WGC-Mexico');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155425', 'Peurto Rico');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155426', 'Honda');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155427', "Arnie's tourney");
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155459', 'Schwab');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155460', 'Rocket Mortgage');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155461', 'Memorial');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155466', 'Travelers');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155472', '3M');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401219498', 'RBC Heritage');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401223849', 'Workday');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155467', 'WGC-FedEx');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155468', 'Barracuda');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401219481', 'PGA Championship');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155473', 'Wyndham');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155474', 'Northern Trust');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155475', 'BMW');
INSERT INTO `golf-pool_db`.`ScheduleShortNames` (`tournamentId`, `shortName`) VALUES ('401155476', 'Tour Championship');
