import React, { Component } from 'react';

import Request from "request";
import cheerio from "cheerio";

import PaperNetGraph from './PaperNetGraph';

class PaperNetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tree:{},
      title: '',
      branch: 5,
      depth: 2,
      focusID: -1,
      nodes: [],
      edges: [],
      titleToID: {},
      data: {},
      uniqTitles: [],
      pushable: [],
    };
    this.myGenNode = this.myGenNode.bind(this);
    this.focus = this.focus.bind(this);
  }

  focus(id) {
    this.setState({ focusID: id });
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
    const { title, url, author, parent, children } = tree;
    const myNodes = this.state.nodes;
    //myNodes = [...myNodes, { myID: nowID, title: title, url: url, author: author }];
    const nowID = this.state.titleToID[title];  
    let canPush = this.state.pushable;
    if (canPush[title] === true) {
      console.log('pushing node ' + title + ' id ' + nowID);
      this.setState({ nodes: [...myNodes, { myID: nowID, title: title, url: url, author: author }] });
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
        this.setState({ edges: [...this.state.edges, { from: titleToID[title], to: titleToID[parent[i].title] }] });
        console.log('adding edge from id ' + titleToID[title] + ' to id ' + titleToID[parent[i].title]);
        this.treeToEdge(parent[i]);
      }
    }
    console.log('adding children of ' + title);
    if (children.length > 0) {
      for (var j = 0; j < children.length; j++) {
        //myEdges = [...myEdges, { to: titleToID[title], from: titleToID[children[j].title] }];
        this.setState({ edges: [...this.state.edges, { to: titleToID[title], from: titleToID[children[j].title] }] });
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
      self.focus(myID);
    };
    return { id: myID, label: title, size: 150, color: '#FFCFCF', shape: 'box', font: { face: 'monospace', align: 'left' }, chosen: { node: myChoseNode } };
  }

  clearGraphData = () => {
    this.setState({
      focusID: -1,
      nodes: [],
      edges: [],
      titleToID: {},
      // drawing: false,
      data: {},
      uniqTitles: [],
      pushable: [],
    });
  }

  handleTree = () => {
    //console.log(this.state.title)
    let body = {title: this.state.title, branch: this.state.branch, depth: this.state.depth} //{title: 'Mastering the game of Go with deep neural networks and tree search'}
    if (this.state.title == ''){
      window.alert("論文標題不可空白")
    } else {
      this.clearGraphData();
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
      });
    }
  }

  renderTree() {
    return (
      <div>
        <PaperNetGraph graph={this.state.data} ref="graph" />
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
    if (e.target.value <= 3) {
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
      const confirm = window.confirm('確定要新增樹嗎？');
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
              <span className="input-group-addon" id="article-title">@</span>
              <input
                type="text"
                className="form-control"
                placeholder="請輸入論文標題"
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
            <div className="input-group">
              <span className="input-group-addon" id="article-title">@</span>
              <input
                type="int"
                className="form-control"
                placeholder="請輸入 branch of tree"
                aria-describedby="article-title"
                value={this.state.branch}
                onChange={this.handleBranchChange}
              />
            </div>
          </div>
          <div className="col-md-12"></div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">@</span>
              <input
                type="int"
                className="form-control"
                placeholder="請輸入 depth of tree"
                aria-describedby="article-title"
                value={this.state.depth}
                onChange={this.handleDepthChange}
              />
            </div>
          </div>
          <div className="col-md-12"></div>
        </div>
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