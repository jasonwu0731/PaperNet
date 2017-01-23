import { Router } from 'express';

import models from '../models';

const { Tree } = models;

const request = require("request");
const cheerio = require("cheerio");


const treeRouter = new Router();

treeRouter.post('/', async(req, res) => {
  const {userId, tree} = req.body;

  const tree_userId = await Tree.create({
    tree,
    userId,
  });

  res.send(tree_userId)
}) 

treeRouter.get('/', async (req, res) => {
  try {
    let trees = await Tree.all();
    res.send(trees);
  } catch (err) {
    console.log("GET ERROR: ", err)
  }
})

treeRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  const tree = await Tree.findById(id);
  //console.log('article in api :id', article);
  res.json(tree);
});

treeRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;

  console.log('Going to delete tree id: ', id)

  await Tree.destroy({
    where: {
      id,
    },
  });

  res.json({
    deletedId: +id,
  });
});

treeRouter.post('/crawler/topic', async(req, res) => {
  const { topic, branch } = req.body;

  console.log( "original information", topic); 

  const paperURL = 'https://www.semanticscholar.org'
  let tree = {}

  let arr = topic.split(' ')
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
    url:myURL,
    method: "GET"
  }, function(e, r, b){
    if (e) console.log(e)
    else {
      const $ = cheerio.load(b);
      //console.log($(".result-page")[0])
      tree = {
        author: [],
        title: topic,
        url: myURL,
        publisher: '',
        children:[],
        parent:[],
      }
      const update_bf = Math.min(branch, $(".search-result-title").length)

      //$(".search-result-title").forEach(function(item, index){
      for (let i = 0; i < update_bf; i ++){
        let item = $(".search-result-title")[i]
        let title_temp = ''
        let temp_url = paperURL

        //authors
        let authors = []
        let flex = item.parent.parent.children[1].children[0].children[0]
        if (flex.children.length > 6) {
          for (let i = 0 ; i< 6 ; i++) {
            if (flex.children[i].children[0].name == 'a')
              authors.push(flex.children[i].children[0].children[0].children[0].children[0].data)
            else 
              authors.push(flex.children[i].children[0].children[0].children[0].data)
          }
        } else {
          flex.children.forEach(function(item, index){
            if (item.children[0].name == 'a')
              authors.push(item.children[0].children[0].children[0].children[0].data)
            else 
              authors.push(item.children[0].children[0].children[0].data)
          })
        }
        //console.log('authors',authors)

        if(item.children[0].name == 'a'){
          //console.log(item.children[0])
          temp_url += item.children[0].attribs.href
          item.children[0].children[0].children.forEach(function(item1 ,index1){
            console.log(item1.children[0].data)
            title_temp += item1.children[0].data
          })
        }

        let child = {
          author: authors,
          title: title_temp,
          url: temp_url,
          publisher: '',
          children:[],
          parent:[],
        }
        tree.children.push(child)
        if (i == update_bf - 1) 
          onComplete(tree, res)
      }
    } 
  })
})


treeRouter.post('/crawler', async (req, res) => {
  const { title, branch, depth } = req.body;

  //console.log("Received User's Info!");
  console.log( "original information", title);
  
  const paperTitle = title
  const branchFactor = branch 
  const depthFactor = depth  

  let paperURL = 'https://www.semanticscholar.org'
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

      //console.log($('.search-result-title')[0].children[0].children[0].children[0])
      let rr = $('.search-result-title')[0].children[0].children[0]
      let trueTitle = ''
      rr.children.forEach(function(itemr, indexr){
        trueTitle += itemr.children[0].data
      })
      let trueTitle_arr = trueTitle.split(' ')
      let paperTitle_arr = paperTitle.split(' ')
      for (let i = 0 ; i < trueTitle_arr.length ; i++ ){
        if (trueTitle_arr[i] == '') 
          trueTitle_arr.splice(i,1)
      }
      for (let i = 0 ; i < paperTitle_arr.length ; i++ ){
        if (paperTitle_arr[i] == '') 
          paperTitle_arr.splice(i,1)
      }
      //console.log(trueTitle.split(' '))
      //console.log(paperTitle.split(' '))
      //console.log(trueTitle===paperTitle)

      //console.log($('.result-page'))
      let paperRef = $('.search-result-title')[0].children[0].attribs.href
      paperURL += paperRef
      //console.log('paperURL: ', paperURL)
      let firstAuthor
      if ($('.flex')[0].children[0].children[0].name == 'a')
        firstAuthor = $('.flex')[0].children[0].children[0].children[0].children[0].children[0].data
      else
        firstAuthor = $('.flex')[0].children[0].children[0].children[0].children[0].data

      //authors
      let authors = []
      if ($(".flex")[0].children.length > 6) {
        for (let i = 0 ; i< 6 ; i++) {
          if ($(".flex")[0].children[i].children[0].name == 'a')
            authors.push($(".flex")[0].children[i].children[0].children[0].children[0].children[0].data)
          else 
            authors.push($(".flex")[0].children[i].children[0].children[0].children[0].data)
        }
      } else {
        $(".flex")[0].children.forEach(function(item, index){
          if (item.children[0].name == 'a')
            authors.push(item.children[0].children[0].children[0].children[0].data)
          else 
            authors.push(item.children[0].children[0].children[0].data)
        })
      }
      console.log('authors',authors)

      //publisher
      let publisher = ''
      if ($(".subhead")[0].children[1].attribs.class == 'venue-metadata') {
        if ($(".subhead")[0].children[1].children[0].name == 'a')
          publisher += $(".subhead")[0].children[1].children[0].children[0].children[0].children[0].data

        if ($(".subhead")[0].children[2].type=='tag')
          publisher = publisher + " " + $(".subhead")[0].children[2].children[0].children[0].children[0].data
      } else {
        if ($(".subhead")[0].children[1].type=='tag')  
          publisher += $(".subhead")[0].children[1].children[0].children[0].children[0].data
      }
      console.log('publisher', publisher)

      const paper = {author: authors, title: paperTitle, url: paperURL}
      tree = {
        author: authors,
        title: trueTitle,
        url: paperURL,
        publisher: publisher,
        children:[],
        parent:[],
        isFind: (trueTitle_arr.length === paperTitle_arr.length),
      }

      if (depth == 0 || branch == 0) 
        onComplete(tree, res)
      else {
      _forward(paper, branchFactor, function(e, aa) {
        if (!e) {
          _backward(paper, branchFactor, function(e,bb) {
            if(!e) {
              //console.log(aa,bb)
              tree.children = aa;
              tree.parent = bb;
              //console.log(tree)
              
              if (depthFactor > 1) {
                let tasks2go = tree.children.length
                let tasks2go1 = tree.parent.length
                let tasks2go2 = 0
                let tasks2go3 = 0
                let tasks2go4 = 0
                if (tasks2go == 0)
                  onComplete(tree,res)
                tree.children.forEach(function(temp_child, index) {
                  _forward(temp_child, branchFactor, function(e,aa){
                    if(e) console.log(e)
                    else {
                      aa.forEach( function(item, index){
                        temp_child.children.push(item)
                        tasks2go2 += 1
                      }) 
                      tasks2go -= 1
                      if (tasks2go <= 0) {
                        if( tasks2go1 == 0)
                          onComplete(tree,res)
                        tree.parent.forEach(function(temp_parent,index){
                          _backward(temp_parent, branchFactor, function(e,bb){
                            if(e) console.log(e)
                            else {
                              bb.forEach(function(item, index){
                                temp_parent.parent.push(item)
                                tasks2go3 += 1
                              })
                              tasks2go1 -= 1
                              if (tasks2go1 <= 0) {
                                if (depthFactor == 2) 
                                  onComplete(tree, res)
                                else {
                                  if (tasks2go2 == 0)
                                    onComplete(tree, res)
                                  tree.children.forEach(function(child1, index) {
                                    child1.children.forEach(function(child2, index){
                                      _forward(child2, branchFactor, function(e,aaa){
                                        if(e) console.log(e)
                                        else {
                                          aaa.forEach(function(item,index){
                                            child2.children.push(item)
                                          })
                                          tasks2go2 -= 1
                                          if (tasks2go2 <= 0) {
                                            if (tasks2go3 == 0)
                                              onComplete(tree, res) 
                                            tree.parent.forEach(function(parent1, index){
                                              parent1.parent.forEach(function(parent2, idnex){
                                                _backward(parent2, branchFactor, function(e,bbb){
                                                  bbb.forEach(function(item,index){
                                                    parent2.parent.push(item)
                                                  })
                                                  tasks2go3 -= 1
                                                  if(tasks2go3 <= 0 )
                                                    onComplete(tree,res)
                                                })
                                              })
                                            })
                                          }
                                        }
                                      })
                                    })
                                  })
                                }
                              }
                            }
                          })
                        })
                      }
                    }
                  })
                })
              } 
              else {
                onComplete(tree,res)
              }
            }
          })
        }
      })
      }
    }
  });
  
});



function _forward(paper, branchFactor,callback) {
  console.log('forward',paper.title)
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
      let kk
      if (flag_cited == 0) 
        update_bf = 0
      else {  
        if (flag_ref == 1)
          kk = $(".paper-detail-content-section")[1]
        else 
          kk = $(".paper-detail-content-section")[0]
        for ( article_start = 0; article_start < kk.children.length; article_start++) {
          if (kk.children[article_start].name == 'article') 
            break;
        }
        update_bf = Math.min(kk.children.length-article_start, branchFactor)
      }
      //console.log('paper', paper.title, 'update_bf', update_bf)

      for (let i = 0; i<update_bf ; i++) {
        if (kk.children[article_start+i].children[0].children[1].name == 'a' ){
          //authors
          let uu = kk.children[article_start+i].children[0].children[2].children[0].children[0]
          let authors_temp = []
          if (uu.children.length > 6) {
            for (let i = 0 ; i< 6 ; i++) {
              if (uu.children[i].children[0].name == 'a')
                authors_temp.push(uu.children[i].children[0].children[0].children[0].children[0].data)
              //else 
              //  authors_temp.push(uu.children[i].children[0].children[0].children[0].data)
            }
          } else {
            uu.children.forEach(function(item, index){
              if (item.children[0].name == 'a')
                authors_temp.push(item.children[0].children[0].children[0].children[0].data)
              //else 
              //  authors_temp.push(item.children[0].children[0].children[0].data)
            })
          }
          //console.log('authors',authors)

          //publisher
          let publisher_temp = ''
          //console.log('TEST',$(".paper-detail-content-section")[1].children[3].children[0].children[2])
          let qq = kk.children[article_start+i].children[0].children[2]
          //console.log('TEST', qq.children[2])
          if (qq.children.length >= 2) {
            if (qq.children[1].attribs.class == 'venue-metadata') {
              if (qq.children[1].children[0].name == 'a')
                publisher_temp += qq.children[1].children[0].children[0].children[0].children[0].data

              if (qq.children[2].type=='tag')
                publisher_temp = publisher_temp + " " + qq.children[2].children[0].data
            } else {
              if (qq.children[1].type=='tag')  
                publisher_temp += qq.children[1].children[0].data
            }
            //console.log('publisher', publisher)
          }

          const urlRef = kk.children[article_start+i].children[0].children[1].attribs.href
          //let temp = urlRef.split('paper/')[1].split('/')[0].split('-')
          let ref = {
            title: kk.children[article_start+i].children[0].children[1].children[0].children[0].children[0].children[0].data,
            author: authors_temp, //temp[temp.length-2]+" "+temp[temp.length-1],
            url: 'https://www.semanticscholar.org' + urlRef,
            publisher: publisher_temp,
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
  console.log('_backward',paper.title)
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
          //authors
          let uu = $(".paper-detail-content-section")[0].children[3+i].children[0].children[2].children[0].children[0]
          let authors_temp = []
          if (uu.children.length > 6) {
            for (let i = 0 ; i< 6 ; i++) {
              if (uu.children[i].children[0].name == 'a')
                authors_temp.push(uu.children[i].children[0].children[0].children[0].children[0].data)
              //else 
              //  authors_temp.push(uu.children[i].children[0].children[0].children[0].data)
            }
          } else {
            uu.children.forEach(function(item, index){
              if (item.children[0].name == 'a')
                authors_temp.push(item.children[0].children[0].children[0].children[0].data)
              //else 
              //  authors_temp.push(item.children[0].children[0].children[0].data)
            })
          }

          //publisher
          let publisher_temp = ''
          //console.log('TEST',$(".paper-detail-content-section")[1].children[3].children[0].children[2])
          let qq = $(".paper-detail-content-section")[0].children[3+i].children[0].children[2]
          //console.log('TEST', qq.children[2])
          if (qq.children.length >= 2) {
            if (qq.children[1].attribs.class == 'venue-metadata') {
              if (qq.children[1].children[0].name == 'a')
                publisher_temp += qq.children[1].children[0].children[0].children[0].children[0].data

              if (qq.children[2].type=='tag')
                publisher_temp = publisher_temp + " " + qq.children[2].children[0].data
            } else {
              if (qq.children[1].type=='tag')  
                publisher_temp += qq.children[1].children[0].data
            }
          }

          let ref = {}
          if ( $(".result-title")[i].parent.name == 'div' ) {
            ref = {
              title: $(".result-title")[i].children[0].children[0].children[0].data,
              author: '',
              url: '',
              publisher: '',
              parent: [],
              children: [],
            };
            refPaper.push( ref )
          } else if ( $(".result-title")[i].parent.name == 'a' ) {
            //let temp = $(".result-title")[i].parent.attribs.href.split('paper/')[1].split('/')[0].split('-')
            ref = {
              title: $(".result-title")[i].children[0].children[0].children[0].data,
              author: authors_temp, //temp[temp.length-2]+" "+temp[temp.length-1],
              url: 'https://www.semanticscholar.org'+ $(".result-title")[i].parent.attribs.href,
              publisher: publisher_temp,
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
