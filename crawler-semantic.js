const request = require("request");
const cheerio = require("cheerio");

const paperTitle = 'Mastering the game of Go with deep neural networks and tree search'
//const paperTitle = 'Active Opening Book Application for Monte-carlo Tree Search in 19×19 Go'
//const paperTitle = 'Deep learning via semi-supervised embedding'
//const paperTitle = 'Learning to Predict by the Methods of Temporal Diierences'
const branchFactor = 3 // max = 10
const depthFactor = 1  // max = 2

let paperURL = 'https://www.semanticscholar.org'
let firstAuthor 
let tree = {}

// https://www.semanticscholar.org/search?q=machine%20learning&sort=relevance&ae=false
// https://www.semanticscholar.org/paper/Mastering-the-game-of-Go-with-deep-neural-networks-Silver-Huang/6b037eaffbac15630a5a380578be88413ca07e31

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

request({
	url: myURL,
	method: "GET"
}, function(e,r,b) {
	if(!e) {
		//console.log(b);
		$ = cheerio.load(b);
		//console.log($('.result-page'))

		let authors = []
		let publisher = ''

		paperRef = $('.search-result-title')[0].children[0].attribs.href
		paperURL += paperRef
		console.log('paperURL: ', paperURL)
		//console.log($('.flex')[0].children[0].children[0].children[0].children[0])
		if ($('.flex')[0].children[0].children[0].name == 'a')
			firstAuthor = $('.flex')[0].children[0].children[0].children[0].children[0].children[0].data
		else
			firstAuthor = $('.flex')[0].children[0].children[0].children[0].children[0].data

		//console.log( $(".paper-title")._root[0].children )
		//console.log( $(".venue-metadata") )
		//console.log( $(".subhead")[0].children[2].children[0].children[0].children[0].data )
		//console.log($(".paper-detail-content-section"))

		//authors
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
		console.log(authors)
		//if ($(".flex"))

		//publisher
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

		const paper = {author: firstAuthor, title: paperTitle, url: paperURL}
		tree = {
			author: firstAuthor,
			title: paperTitle,
			url: paperURL,
			publisher: publisher,
			children:[],
			parent:[],
		}
		//console.log('firstAuthor: ',firstAuthor)
		/*let forSearchUrl = [{author: firstAuthor, title: paperTitle, url: paperURL, children:[], parent:[]}]
		for( let i = 0; i < depthFactor ; i++ ) {
			for (let ii = 0; ii < i*branchFactor ; ii ++) {
				firstPaper = forSearchUrl.shift()
				console.log('firstPaper',firstPaper)
				if (firstPaper.url==''){
					console.log('nothing')
				} else {
					_forward(firstPaper, function(err, array){
						if (!err){
							array.forEach(function(item, index){
								console.log(item)
								forSearchUrl.push(item)
								if (i == 0) 
									tree.children.push(item)
								else if (i == 1)
									tree.children[ii].children.push(item)
							});
						} else {
							console.log('ERROR')
						}
					})
				}
			}
		}
		console.log('tree',tree) */
		
		_forward(paper, function(e, aa) {
			if (!e) {
				_backward(paper, function(e,bb) {
					if(!e) {
						//console.log(aa,bb)
						tree.children = aa;
						tree.parent = bb;
						//console.log(tree)
						
						if (depthFactor > 1) {
							let tasks2go = tree.children.length
							tree.children.forEach(function(temp_child, index) {
								_forward(temp_child, function(e,aa){
									if(e) console.log(e)
									else {
										aa.forEach( function(item, index){
											temp_child.children.push(item)
										}) 
										tasks2go -= 1
										if (tasks2go == 0) {
											let tasks2go1 = tree.parent.length
											tree.parent.forEach(function(temp_parent,index){
												_backward(temp_parent, function(e,bb){
													if(e) console.log(e)
													else {
														bb.forEach(function(item, index){
															temp_parent.parent.push(item)
														})
														tasks2go1 -= 1
														if (tasks2go1 == 0) {
															console.log(tree)
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
							console.log(tree)
						}
					}
				})
			}
		})
	}
});

function _forward(paper,callback) {
	let citedPaper = []
	url_in = paper.url
	if (url_in == ''){
		callback(null, citedPaper);
	} else {
		request({
			url: url_in,
			method: "GET"
		}, function(ee,rr,bb){
			//console.log(bb)
			$ = cheerio.load(bb);
			let flag_ref = 0
			let flag_cited = 0
			for (let i = 0 ; i < $(".sticky-nav__item__link").length; i++) {
				//console.log($(".sticky-nav__item__link")[i].attribs.href)
				if ($(".sticky-nav__item__link")[i].attribs.href == '#citedPapers')
					flag_ref = 1
				if ($(".sticky-nav__item__link")[i].attribs.href == '#citingPapers')
					flag_cited = 1
			}

			//Publisher 
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
			//console.log('publisher', publisher)

			// Get Cited Papers
			//console.log( $(".paper-detail-content-section")[1].children[3].children[0].children[1].children[0].children[0].children[0].children[0].data )
			let article_start 
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
					temp = urlRef.split('paper/')[1].split('/')[0].split('-')
					let ref = {
						title: $(".paper-detail-content-section")[1].children[article_start+i].children[0].children[1].children[0].children[0].children[0].children[0].data,
						author: temp[temp.length-2]+" "+temp[temp.length-1],
						publisher: publisher,
						url: 'https://www.semanticscholar.org' + urlRef,
						children:[],
						parent: [paper],
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

function _backward(paper, callback) {
	let refPaper = []
	url_in = paper.url
	if (url_in == ''){
		callback(null, refPaper);
	} else {
		request({
			url: url_in,
			method: "GET"
		}, function(ee,rr,bb){
			//console.log(bb)
			$ = cheerio.load(bb);	
			let flag_ref = 0
			let flag_cited = 0

			console.log('paper', paper.title)
			//console.log($(".sticky-nav__item__link"))
			for (let i = 0 ; i < $(".sticky-nav__item__link").length; i++) {
				//console.log($(".sticky-nav__item__link")[i].attribs.href)
				if ($(".sticky-nav__item__link")[i].attribs.href == '#citedPapers')
					flag_ref = 1
				if ($(".sticky-nav__item__link")[i].attribs.href == '#citingPapers')
					flag_cited = 1
			}
			//console.log('flag_ref',flag_ref)
			//Publisher 
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

			// Get Reference Papers
			if (flag_ref == 1){
				let refCount = 0
				for (let i = 0 ; i < $(".paper-detail-content-section")[0].children.length; i++) {
					if ($(".paper-detail-content-section")[0].children[i].name == 'article')
						refCount += 1
				}
				console.log(refCount)
				let update_bf = Math.min( refCount ,branchFactor)
				for (let i = 0; i<update_bf; i++) {
					let ref = {}
					if ( $(".result-title")[i].parent.name == 'div' ) {
						ref = {
							title: $(".result-title")[i].children[0].children[0].children[0].data,
							author: '',
							url: '',
							publisher: publisher,
							parent: [],
							children: [paper],
						};
						refPaper.push( ref )
					} else if ( $(".result-title")[i].parent.name == 'a' ) {
						temp = $(".result-title")[i].parent.attribs.href.split('paper/')[1].split('/')[0].split('-')
						ref = {
							title: $(".result-title")[i].children[0].children[0].children[0].data,
							author: temp[temp.length-2]+" "+temp[temp.length-1],
							url: 'https://www.semanticscholar.org'+ $(".result-title")[i].parent.attribs.href,
							publisher: publisher,
							parent: [],
							children: [paper],
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

// <article class="citation is-key" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d"><div class="result-meta" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0"><ul class="key-citation" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.0"></ul><a class="" href="/paper/Human-vs-Computer-Go-Review-and-Prospect-Lee-Wang/43dd928b2ee097a63219596accbb729eafc6732d" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.1"><h2 class="result-title" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.1.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.1.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.1.0.0.$l">Human vs. Computer Go: Review and Prospect</span></span></h2></a><ul class="subhead" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2"><li data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0"><span class="flex" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$0"><a class="author-link" href="/author/Chang-Shing-Lee/1709115" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$0.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$0.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$0.0.0.$l">Chang-Shing Lee</span></span></a><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$0.1">, </span></span><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$1"><a class="author-link" href="/author/Mei-Hui-Wang/1739194" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$1.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$1.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$1.0.0.$l">Mei-Hui Wang</span></span></a><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$1.1">, </span></span><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$2"><a class="author-link" href="/author/Shi-Jim-Yen/2910332" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$2.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$2.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$2.0.0.$l">Shi-Jim Yen</span></span></a><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$2.1">, </span></span><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$3"><a class="author-link" href="/author/Ting-Han-Wei/3083432" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$3.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$3.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$3.0.0.$l">Ting-Han Wei</span></span></a><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$3.1">, </span></span><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$4"><a class="author-link" href="/author/I-Chen-Wu/1836268" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$4.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$4.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$4.0.0.$l">I-Chen Wu</span></span></a><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$4.1">, </span></span><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$5"><a class="author-link" href="/author/Ping-Chiang-Chou/1987254" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$5.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$5.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.0:$5.0.0.$l">Ping-Chiang Chou</span></span></a></span><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.1"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.1.0"> </span><span class="more-authors-label" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.0.0.1.1">+3 others</span></span></span></li><li class="venue-metadata" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.1"><a class="venue-link" href="/search?venue%5B%5D=ArXiv&amp;q=ArXiv&amp;sort=relevance&amp;ae=false" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.1.0"><span class="" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.1.0.0"><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.1.0.0.$l">ArXiv</span></span></a></li><li data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.0.2.2">2016</li></ul></div><div class="boxes" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1"><div class="tooltip-parent" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.0"><span class="boxed key" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.0.0">Highly Influenced</span></div><div class="tooltip-parent contexts" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.1"><span class="boxed" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.1.0"><svg width="12" height="12" data-selenium-selector="icon-details" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.1.0.0"><use xlink:href="#details" data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.1.0.0.0"></use></svg><span data-reactid=".1i4unzwu800.0.1.0.0.0.3.0.3:$43dd928b2ee097a63219596accbb729eafc6732d.1.1.0.1">4 Excerpts</span></span></div></div></article>
