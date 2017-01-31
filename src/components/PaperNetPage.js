import React, { Component } from 'react';

import Request from "request";
import cheerio from "cheerio";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

import PaperNetGraph from './PaperNetGraph';

class PaperNetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: {},
      title: '',
      tags: [],
      branch: 5,
      depth: 2,
      focusTitle: '',
      nodes: [],
      edges: [],
      titleToID: {},
      data: {},
      uniqTitles: [],
      pushable: [],
      runOnce: false,
      drawing: true,
    };
    this.myGenNode = this.myGenNode.bind(this);
    this.focus = this.focus.bind(this);
  }

  focus(title) {
    this.setState({ focusTitle: title });
  }

  treeGetIndex(tree) {
    const { title, parent, children } = tree;
    this.setState({ uniqTitles: [...this.state.uniqTitles, title] });
    if (parent.length > 0) {
      for (var i = 0; i < parent.length; ++i) {
        this.treeGetIndex(parent[i]);
      }
    }
    if (children.length > 0) {
      for (var j = 0; j < children.length; j++) {
        this.treeGetIndex(children[j]);
      }
    }
  }

  treeToNode(tree) {
    const { title, url, author, publisher, parent, children } = tree;
    const myNodes = this.state.nodes;
    //myNodes = [...myNodes, { myID: nowID, title: title, url: url, author: author }];
    const nowID = this.state.titleToID[title];  
    let canPush = this.state.pushable;
    if (canPush[title] === true) {
      console.log('pushing node ' + title + ' id ' + nowID);
      this.setState({ nodes: [...myNodes, { myID: nowID, title: title, url: url, author: author, publisher: publisher }] });
      canPush[title] = false
      this.setState({ pushable: canPush });
      if (parent.length > 0) {
        for (var i = 0; i < parent.length; ++i) {
          this.treeToNode(parent[i]);
        }
      }
      if (children.length > 0) {
        for (var j = 0; j < children.length; j++) {
          this.treeToNode(children[j]);
        }
      }
    }
    else {
      console.log('droping node ' + title + ' id ' + nowID);
    }
  }

  treeToEdge(tree) {
    const { title, parent, children } = tree;
    const titleToID = this.state.titleToID;
    console.log('visiting node ' + title);
    console.log('adding parents of ' + title);
    if (parent.length > 0) {
      for (var i = 0; i < parent.length; i++) {
        //myEdges = [...myEdges, { from: titleToID[title], to: titleToID[parent[i].title] }];
        this.setState({ edges: [...this.state.edges, { from: titleToID[parent[i].title], to: titleToID[title] }] });
        console.log('adding edge from id ' + titleToID[title] + ' to id ' + titleToID[parent[i].title]);
        this.treeToEdge(parent[i]);
      }
    }
    console.log('adding children of ' + title);
    if (children.length > 0) {
      for (var j = 0; j < children.length; j++) {
        //myEdges = [...myEdges, { to: titleToID[title], from: titleToID[children[j].title] }];
        this.setState({ edges: [...this.state.edges, { to: titleToID[children[j].title], from: titleToID[title] }] });
        console.log('adding edge from id ' + titleToID[children[j].title] + ' to id ' + titleToID[title]);
        this.treeToEdge(children[j]);
      }
    }
    console.log('leaving node ' + title);
  }

  myGenNode(vertex) {
    const { myID, title } = vertex;
    let self = this;
    let myChoseNode = function (values, id, selected, hovering) {
      values.color = '#D2E5FF';
      values.borderWidth *= 2;
      values.borderColor = '#2B7CE9';
      values.shadow = true;
      console.log('chose node ' + myID);
      self.focus(title);
    };
    return { id: myID, label: title, size: 150, color: '#FFCFCF', shape: 'box', font: { face: 'monospace', align: 'left' }, chosen: { node: myChoseNode } };
  }

  clearGraphData = () => {
    this.setState({
      focusTitle: '',
      nodes: [],
      edges: [],
      titleToID: {},
      drawing: true,
      data: {},
      uniqTitles: [],
      pushable: [],
      tree: {},
      runOnce: true,
    });
  }

  handleTagsChange = tags => {
    this.setState({ tags });
  }


  handleTree = () => {
    //console.log(this.state.title)
    if (this.state.title == '' && this.state.tags == []){
      window.alert("Please fill the blanks.")
    } else {
      this.clearGraphData(); 
      if (this.state.title != '') {
        let topicTitle = this.state.title
        for (let i = 0 ; i < this.state.tags.length; i++)
          topicTitle = topicTitle + ' ' + this.state.tags[i] + ' '
        let body = {title: topicTitle, branch: this.state.branch, depth: this.state.depth} 
        fetch('/api/tree/crawler', {
          headers: {
              //Accept: 'application/json',
              'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(body),
        })
        .then( res => res.json() )
        .then( json => {
          if(json.isFind == 0){
            alert(`No \< ${this.state.title} \> is found. Replaced by \< ${json.title} \>`)
          }
          this.setState({tree: json});
          this.treeGetIndex(json);
          let uniqTitles = Array.from( new Set(this.state.uniqTitles));
          let myDic = {}
          let pushable = {}
          for (var i = 0; i < uniqTitles.length; ++i) {
            myDic[uniqTitles[i]] = i;
            pushable[uniqTitles[i]] = true;
          }
          this.setState({ uniqTitles: uniqTitles, titleToID: myDic, pushable: pushable });
          return json;
        })
        .then( json => {
          this.treeToNode(json);
          this.treeToEdge(json);
          console.log(json);
        })
        .then(() =>{
          const newdata = {
            nodes: this.state.nodes.map((v, i) => this.myGenNode(v)),
            edges: this.state.edges
          };
          this.setState({ data: newdata });
          this.setState({ drawing: false });
        });
      } else if (this.state.tags != []) {
        let topic = ''
        for (let i = 0 ; i < this.state.tags.length; i++)
          topic = topic + this.state.tags[i] + ' '
        let body = {topic: topic, branch: this.state.branch}
        fetch('/api/tree/crawler/topic', {
          headers: {
              //Accept: 'application/json',
              'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(body),
        })
        .then( res => res.json() )
        .then( json => {
          this.setState({tree: json});
          this.treeGetIndex(json);
          let uniqTitles = Array.from( new Set(this.state.uniqTitles));
          let myDic = {}
          let pushable = {}
          for (var i = 0; i < uniqTitles.length; ++i) {
            myDic[uniqTitles[i]] = i;
            pushable[uniqTitles[i]] = true;
          }
          this.setState({ uniqTitles: uniqTitles, titleToID: myDic, pushable: pushable });
          return json;
        })
        .then( json => {
          this.treeToNode(json);
          this.treeToEdge(json);
          console.log(json);
        })
        .then(() =>{
          const newdata = {
            nodes: this.state.nodes.map((v, i) => this.myGenNode(v)),
            edges: this.state.edges
          };
          this.setState({ data: newdata });
          this.setState({ drawing: false });
        });
      }
    }
  }

  renderFocusItem(title) {
    for (var i = 0; i < this.state.nodes.length; ++i) {
      if (title===this.state.nodes[i].title) {
        const { myID, title, url, author, publisher } = this.state.nodes[i];
        const authorString = (typeof(author)==='string') ? author : author.join(', ');
        return (
          <div className="panel-body">
            <div>ID: {myID}</div>
            <div>Title: {title}</div>
            <div>Authors: {authorString}</div>
            <div>Publisher: {publisher}</div>
            <a href={url} target="_blank">Link to paper</a>
          </div>
        );
      }
    }
  }

  renderTree() {
    return (
      <div>
        { this.state.focusTitle !== '' ? (
          <div className="row">
            <div className="col-md-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">Paper Information</h3>
                </div>
                { this.renderFocusItem(this.state.focusTitle) }
              </div>
            </div>
          </div> 
          ) : null }
        <div className="row">
          <div className="col-md-12 mycanvas">
            { this.state.runOnce===true ? (
                this.state.drawing === false ? ( <div className="center-block"><PaperNetGraph graph={this.state.data} ref="graph" /></div> ) : <h3>Drawing...</h3> ) : null }
          </div>
        </div>
      </div>
    );
  }

  handleTitleChange = e => {
    this.setState({
      title: e.target.value,
    });
  }

  handleBranchChange = e => {
    if (e.target.value <= 10) {
      this.setState({
        branch: e.target.value,
      });
    } else {
      this.setState({
        branch: 10,
      });
    }
  }

  handleDepthChange = e => {
    if (e.target.value <= 3 ) {
      this.setState({
        depth: e.target.value,
      });
    } else {
      this.setState({
        depth: 3,
      });
    }
  }

  handleStoreTree = () => {
    if ( Object.keys(this.state.tree).length === 0 ) 
      alert("NO TREE EXISTED!")
    else {
      const confirm = window.confirm('Are you sure to add the tree？');
      if (confirm) {
        let body = {
          tree: this.state.tree,
          userId: this.props.user.id,
        }
        fetch('/api/tree', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(body),
        }).then(result => {
          console.log(result);
          window.location.href = '#/';
        }).catch(err => console.log('POST failed!!'));
      }
    }
  }
  
  render() {
    return (

      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">Paper-Title</span>
              <input
                type="text"
                className="form-control"
                placeholder="ex: Mastering the game of Go with deep neural networks and tree search, #deep learning, etc."
                aria-describedby="article-title"
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
          </div>
          <div className="col-md-12"></div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <TagsInput value={this.state.tags} onChange={this.handleTagsChange} placeholder='Keyword Search' />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">Max Branch</span>
              <input
                type="int"
                className="form-control"
                placeholder="Please set branch of tree"
                aria-describedby="article-title"
                value={this.state.branch}
                onChange={this.handleBranchChange}
              />
            </div>
          </div>
          <div className="col-md-12"></div>
        </div>
        {
          (this.state.title==' ' && this.state.tags!=[]) ? null : (
            <div className="row">
              <div className="col-md-12">
                <div className="input-group">
                  <span className="input-group-addon" id="article-title">Max Depth</span>
                  <input
                    type="int"
                    className="form-control"
                    placeholder="Please set depth of tree"
                    aria-describedby="article-title"
                    value={this.state.depth}
                    onChange={this.handleDepthChange}
                  />
                </div>
              </div>
              <div className="col-md-12"></div>
            </div>
          )
        }
        
        <div className="row">
          <div className="col-md-12">
            <p>
            <a className="btn btn-success btn-lg" role="button" onClick={this.handleTree}>Show Tree</a>
            <a className="btn btn-success btn-lg" role="button" onClick={this.handleStoreTree}>Store Tree</a>
            </p>
            {this.renderTree()}
          </div>
        </div>
      </div>
    );
  }
}

export default PaperNetPage;
