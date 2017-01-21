let scholar = require('google-scholar')
let request = require("request");
//let request = require("sync-request");
let cheerio = require("cheerio");

let paperTitle = 'Mastering the game of Go with deep neural networks and tree search'
//let paperTitle = 'Neural Networks'

scholar.search(paperTitle)
    .then(resultsObj => {
        console.log(resultsObj)
        //console.log(resultsObj.results[0].authors)
        //console.log(resultsObj.results[0].description)
        //console.log(resultsObj.results[0].citedUrl)
     
        if (resultsObj.count == 1) {
	        request({
	            url: resultsObj.results[0].citedUrl,
	            method: "GET"
	        }, function(e,r,b) {
	            if(!e) {
	            	//console.log(b);
	            	$ = cheerio.load(b);
	            	//console.log($('title').text())
	            	//titles = $('.gs_rt', '#gs_bdy')
	            	//console.log(titles)
	            }
	        });
    	} else {
    		console.log("@@@ more than 1 result")
    	}
    })


// crawler

let Crawler = require("crawler");
let url = require('url');

let c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});

// Queue just one URL, with default callback
c.queue('https://scholar.google.com/scholar?cites=300412370207407505');
