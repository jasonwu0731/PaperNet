# PaperNet
#### This project is written in nodejs, React, Webpack, mysql

## Description
 - A website to automatically construct a citation and reference tree for your query papers or keywords.
 - Get the tree structure that **References --> Paper --> Citations**
 - Get the information of papers such as titles, authors, links, publishers, etc.
 - Including login funciton to search and store user's own tree.
 
## Demo 
1. Azure URL: 
2. Youtube video: https://www.youtube.com/watch?v=pQctCIoFXV0 

## Instruction
- Login or register for an account
- Search paper by paper title or keywords (or both), you can also set the branch and depth of the tree
- Click "Show Tree" button and wait for your tree
- After the tree showed, you can room in and out, move or drag the tree node
- You can click any nodes on the tree to get node information, or double-click the tree to change tree visualization
- Click "Store Tree" if your want to access the tree information next time (You can see the tree in "My Trees")

## Setup 
#### Install mysql
1. downlaod mysql [here](https://dev.mysql.com/downloads/)
2. `mysql -u root -p` should be successful to login 
3. mysql> `create database YOUR_DATABASE`

#### Run PaperNet Server
1. `git clone https://github.com/jasonwu0731/PaperNet.git` 
2. `cd PaperNet` then `npm install`
3. `cd config` then `cp config.sample.js config.json`
4. edit your username, password, database in config.json
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
5. `sequelize db:migrate` to initialize the tables
6. `npm start` to listen at localhost:3000

## Credicts
 - This is the final project for the course Web Programming (Ric Huang, 2016 Fall), at National Taiwan University
 - Authors: Chien-Sheng Wu, Yuan-Ting Hsieh

