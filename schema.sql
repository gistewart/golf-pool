DROP DATABASE IF EXISTS golf-pool_db;
CREATE DATABASE golf-pool_db;

SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));