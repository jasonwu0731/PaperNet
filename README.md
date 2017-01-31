# PaperNet
#### This project is written in nodejs, React, mysql

## Demo 
1. Azure URL: 
2. Youtube video: https://www.youtube.com/watch?v=pQctCIoFXV0 

## Description
 - A website to automatically construct a citation and reference tree for your query concepts or papers.
 - Get the information of papers such as titles, authors, links, publishers, etc.
 - Including login funciton to search and store user's own tree.

## Setup 
#### Install mysql
1. downlaod mysql from [here](https://dev.mysql.com/downloads/)
2. `mysql -u root -p` should be successful to login 
3. mysql> create database YOUR_DATABASE

#### Run 
1. `git clone https://github.com/jasonwu0731/PaperNet.git` 
2. `cd PaperNet` then `npm install`
3. `cd config` then `cp config.sample.js config.js`
4. edit your username, password, database in config.js
```
{
  "development": {
    "username": "root",
    "password": "YOUR_PASSWORD",
    "database": "YOUR_DATABASE",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```
3. `sequelize db:migrate` to initialize the tables
3. `npm start` to listen at localhost:3000
4. enjoy the service


## Credicts
 - This is the final project for the course Web Programming (2016 Fall), at National Taiwan University
 - Authors: Chien-Sheng Wu, Yuan-Ting Hsieh

