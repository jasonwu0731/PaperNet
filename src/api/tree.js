import { Router } from 'express';
const request = require("request");
const cheerio = require("cheerio");
const util = require('util');

const treeRouter = new Router();

treeRouter.post('/crawler', async (req, res) => {
  const { title, branch, depth } = req.body;

  //console.log("Received User's Info!");
  console.log( "original information", title);
  
  const paperTitle = title
  const branchFactor = branch 
  const depthFactor = depth  

  let paperURL = 'https://www.semanticscholar.org'
  let firstAuthor
  let tree = {}

  let arr = paperTitle.split(' ')
  //console.log(arr)
  let myURL = 'https://www.semanticscholar.org/search?q=';
  for (let i=0; i<arr.length; i++) {
    if (i == arr.length-1){
      myURL += (arr[i]+"&sort=relevance&ae=false")
      break;
    }
    myURL += (arr[i]+"%20")
  }
  console.log(myURL)

  let onComplete = function(tree, res){
    console.log(tree)
    res.send(tree)
  }

  request({
    url: myURL,
    method: "GET"
  }, function(e,r,b) {
    if(!e) {
      //console.log(b);
      const $ = cheerio.load(b);
      //console.log($('.result-page'))
      let paperRef = $('.search-result-title')[0].children[0].attribs.href
      paperURL += paperRef
      //console.log('paperURL: ', paperURL)
      if ($('.flex')[0].children[0].children[0].name == 'a')
        firstAuthor = $('.flex')[0].children[0].children[0].children[0].children[0].children[0].data
      else
        firstAuthor = $('.flex')[0].children[0].children[0].children[0].children[0].data
      const paper = {author: firstAuthor, title: paperTitle, url: paperURL}
      tree = {
        author: firstAuthor,
        title: paperTitle,
        url: paperURL,
        children:[],
        parent:[],
      }
      
      _forward(paper, branchFactor, function(e, aa) {
        if (!e) {
          _backward(paper, branchFactor, function(e,bb) {
            if(!e) {
              //console.log(aa,bb)
              tree.children = aa;
              tree.parent = bb;
              //console.log(tree)
              
              if (depthFactor > 1) {
                let tasks2go = tree.children.length + tree.parent.length
                tree.children.forEach(function(temp_child, index) {
                  _forward(temp_child, branchFactor, function(e,aa){
                    if(e) console.log(e)
                    else {
                      aa.forEach( function(item, index){
                        temp_child.children.push(item)
                      }) 
                      tasks2go -= 1
                      if (tasks2go == 0) {
                        onComplete(tree, res)
                      }
                    }
                  })
                })
                tree.parent.forEach(function(temp_parent,index){
                  _backward(temp_parent, branchFactor, function(e,bb){
                    if(e) console.log(e)
                    else {
                      bb.forEach(function(item, index){
                        temp_parent.parent.push(item)
                      })
                      tasks2go -= 1
                      if (tasks2go == 0) {
                        onComplete(tree, res)
                      }
                    }
                  })
                })
                /*for(let i = 0; i < tree.children.length ; i ++ ){
                  let temp_child = tree.children[i]
                  _forward(temp_child, branchFactor, function(e, aa) {
                    if(!e) {
                      for (let ii = 0; ii< aa.length; ii++) {
                        tree.children[i].children.push(aa[ii])
                      }
                      if (i == tree.children.length-1) {
                        for (let ii = 0; ii < tree.parent.length; ii++){
                          let temp_parent = tree.parent[ii]
                          _backward(temp_parent, branchFactor, function(e, bb){
                            if(!e){
                              for (let iii = 0; iii< bb.length; iii++) {
                                tree.parent[ii].parent.push(bb[iii])
                              }
                              if (ii == tree.parent.length-1){
                                if (depthFactor > 2) {
                                  res.send(tree)
                                  for(let i2 = 0; i2 < tree.children.length ; i2 ++ ){
                                    for (let ii2 = 0; ii2 < tree.children[i2].children.length; ii2++){
                                      let temp_child = tree.children[i2].children[ii2]
                                      _forward(temp_child, branchFactor, function(e, aaa) {
                                        if(!e) {
                                          aaa.forEach( function(item, index) {
                                            tree.children[i2].children[ii2].children.push(item)
                                          })
                                          if (i2 == tree.children[i2].children.length-1 && ii2==tree.children[i2].children.length-1){
                                            for(let iii2 = 0; iii2 < tree.parent.length; iii2 ++){
                                              console.log('iii2',iii2)
                                              for(let iiii2 = 0; iiii2 < tree.parent[iii2].parent.length; iiii2 ++){
                                                console.log('iiii2',iiii2)
                                                let temp_parent2 = tree.parent[iii2].parent[iiii2]
                                                console.log(temp_parent2)
                                                _backward(temp_parent2, branchFactor, function(e,bbb){
                                                  if(!e){
                                                    bbb.forEach(function(item, index){
                                                      tree.parent[iii2].parent[iiii2].parent.push(item)
                                                    })
                                                    if (iii2 == tree.parent.length-1 && iiii2 == tree.parent[iii2].parent.length-1){
                                                      console.log(tree)
                                                      res.send(tree)
                                                    }
                                                  }
                                                })
                                              }
                                            }
                                          }
                                        }
                                      })
                                    }
                                  }
                                } else {
                                  console.log(tree)
                                  res.send( tree );
                                }
                              }
                            }
                          })
                        }
                      }
                    }
                  })
                }*/
              } 
              else {
                console.log(tree)
                res.send(tree);
              }
            }
          })
        }
      })
    }
  });
  
});



function _forward(paper, branchFactor,callback) {
  let citedPaper = []
  const url_in = paper.url
  if (url_in == ''){
    callback(null, citedPaper);
  } else {
    request({
      url: url_in,
      method: "GET"
    }, function(ee,rr,bb){
      //console.log(bb)
      const $ = cheerio.load(bb);
      let flag_ref = 0
      let flag_cited = 0
      for (let i = 0 ; i < $(".sticky-nav__item__link").length; i++) {
        //console.log($(".sticky-nav__item__link")[i].attribs.href)
        if ($(".sticky-nav__item__link")[i].attribs.href == '#citedPapers')
          flag_ref = 1
        if ($(".sticky-nav__item__link")[i].attribs.href == '#citingPapers')
          flag_cited = 1
      }
      // Get Cited Papers
      //console.log( $(".paper-detail-content-section")[1].children[3].children[0].children[1].children[0].children[0].children[0].children[0].data )
      let article_start 
      let update_bf
      if (flag_cited == 0) 
        update_bf = 0
      else {  
        for ( article_start = 0; article_start < $(".paper-detail-content-section")[1].children.length; article_start++) {
          if ($(".paper-detail-content-section")[1].children[article_start].name == 'article') 
            break;
        }
        update_bf = Math.min($(".paper-detail-content-section")[1].children.length-article_start, branchFactor)
      }
      //console.log('paper', paper.title, 'update_bf', update_bf)
    
      for (let i = 0; i<update_bf ; i++) {
        if ($(".paper-detail-content-section")[1].children[article_start+i].children[0].children[1].name == 'a' ){
          const urlRef = $(".paper-detail-content-section")[1].children[article_start+i].children[0].children[1].attribs.href
          let temp = urlRef.split('paper/')[1].split('/')[0].split('-')
          let ref = {
            title: $(".paper-detail-content-section")[1].children[article_start+i].children[0].children[1].children[0].children[0].children[0].children[0].data,
            author: temp[temp.length-2]+" "+temp[temp.length-1],
            url: 'https://www.semanticscholar.org' + urlRef,
            children:[],
            parent: [],
          };
          citedPaper.push( ref )
        } else {
          console.log("!!! FUCK Cited Papers !!! i=", i)
        }
      }
      if (!citedPaper)
          callback(new Error('Something\'s Wrong'));
      else
          callback(null, citedPaper);
      //console.log('@@@ cited papers with branchFactor: ', branchFactor, citedPaper)
    });
  } 
  //return citedPaper
}

function _backward(paper,branchFactor, callback) {
  let refPaper = []
  const url_in = paper.url
  if (url_in == ''){
    callback(null, refPaper);
  } else {
    request({
      url: url_in,
      method: "GET"
    }, function(ee,rr,bb){
      //console.log(bb)
      const $ = cheerio.load(bb); 
      let flag_ref = 0
      let flag_cited = 0

      //console.log('paper', paper.title)
      //console.log($(".sticky-nav__item__link"))
      for (let i = 0 ; i < $(".sticky-nav__item__link").length; i++) {
        //console.log($(".sticky-nav__item__link")[i].attribs.href)
        if ($(".sticky-nav__item__link")[i].attribs.href == '#citedPapers')
          flag_ref = 1
        if ($(".sticky-nav__item__link")[i].attribs.href == '#citingPapers')
          flag_cited = 1
      }
      // Get Reference Papers
      if (flag_ref == 1){
        let refCount = 0
        for (let i = 0 ; i < $(".paper-detail-content-section")[0].children.length; i++) {
          if ($(".paper-detail-content-section")[0].children[i].name == 'article')
            refCount += 1
        }
        //console.log(refCount)
        let update_bf = Math.min( refCount ,branchFactor)
        for (let i = 0; i<update_bf; i++) {
          let ref = {}
          if ( $(".result-title")[i].parent.name == 'div' ) {
            ref = {
              title: $(".result-title")[i].children[0].children[0].children[0].data,
              author: '',
              url: '',
              parent: [],
              children: [],
            };
            refPaper.push( ref )
          } else if ( $(".result-title")[i].parent.name == 'a' ) {
            let temp = $(".result-title")[i].parent.attribs.href.split('paper/')[1].split('/')[0].split('-')
            ref = {
              title: $(".result-title")[i].children[0].children[0].children[0].data,
              author: temp[temp.length-2]+" "+temp[temp.length-1],
              url: 'https://www.semanticscholar.org'+ $(".result-title")[i].parent.attribs.href,
              parent: [],
              children: [],
            };
            refPaper.push( ref )
          } else {
            console.log("!!! FUCK Reference Papers !!! ")
          }
        }
      } 
      if (!refPaper)
          callback(new Error('Something\'s Wrong'));
      else
          callback(null, refPaper);
      //console.log('@@@ reference papers with branchFactor: ', branchFactor, refPaper)
    });
  }
  //return refPaper
}


export default treeRouter;
