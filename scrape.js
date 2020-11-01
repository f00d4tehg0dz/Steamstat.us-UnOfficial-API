const puppeteer = require("puppeteer");
const chalk = require("chalk");
var fs = require("fs");

// Colorful Logging
const error = chalk.bold.red;
const success = chalk.keyword("green");

const mysql = require('mysql');
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'steamstatdb'
});

let scrape = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1366, height: 768 }) 
    // enter url in page
    await page.goto(`https://steamstat.us/`, {timeout: 0, waitUntil: 'networkidle0'});
    await page.waitFor('.container');
    await page.screenshot({ path: ('screencap.png') })
    console.log('test');
    var result = await page.evaluate(() => {
      var steamNameId = document.querySelectorAll('.container > .services-container > .services');
      var onlineSteam = document.querySelectorAll('.service > .status');
      var ingameSteam = document.querySelectorAll('.service.sep .status');
      var steamStore = document.querySelectorAll('.service:nth-of-type(4n) > .status');
      var communitySteam = document.querySelectorAll('.service:nth-of-type(5n) > .status');
      var webapiSteam = document.querySelectorAll('.service:nth-of-type(6n) > .status');
      
      var titleLinkArray = [];
      for (var i = 0; i < steamNameId.length; i++) {
        titleLinkArray[i] = {          
            OnlineOnSteam: onlineSteam[i] ? onlineSteam[i].innerText.trim() : null,
            InGameOnSteam: ingameSteam[i] ? ingameSteam[i].innerText.trim() : null,
            SteamStore: steamStore[i] ? steamStore[i].innerText.trim() : null,
            SteamCommunity: communitySteam[i] ? communitySteam[i].innerText.trim() : null,
            SteamWebAPI: webapiSteam[i] ? webapiSteam[i].innerText.trim() : null
        };
        break;  
      }
      return {
        titleLinkArray
      };
    });
    // Clear JSON File
    const fs = require('fs')
    fs.writeFile('lateststeam.json', '', function(){console.log('done')})

    // Writing the steamLatest inside a json file
    fs.writeFile("lateststeam.json", JSON.stringify(result), function(err) {
      if (err) throw err;
      console.log("Saved!");
    });


    con.connect(function(err) {
      if (err) throw err;
      var sql = "DELETE FROM steamstatustable WHERE id = '1'";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Number of records deleted: " + result.affectedRows);
      });
   


    let sqlValues = result.titleLinkArray.map(obj => Object.values(obj));
    // console.log([sqlValues])
  
      if (err) throw err;
      console.log("Connected!");
    
      var sqlquery  = "INSERT INTO steamstatustable (OnlineOnSteam, InGameOnSteam, SteamStore, SteamCommunity, SteamWebAPI) VALUES ?";
      let queryData = {
        sql: sqlquery,
        values: [sqlValues]
    }
      con.query(queryData, function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
    });
    console.log(success("Browser Closed"));
    await browser.close();
    return result;
  } catch (err) {
    // Catch and display errors
    console.log(error(err));
    console.log(error("Error, Browser Closed"));
  }
};
scrape().then((value) => {
  console.log(value); // Success!
});
