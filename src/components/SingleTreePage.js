import 'isomorphic-fetch';
import React, { Component, PropTypes } from 'react';
import PaperNetGraph from './PaperNetGraph';

import './style.css';

class SingleTreePage extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      tree: {},
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

  componentDidMount() {
    const id = this.props.id;
    fetch(`/api/tree/${id}`)
      .then(res => res.json())
      .then(json => {
        this.setState({
          tree: JSON.parse(json.tree),
        });
        console.log(JSON.parse(json.tree))
        this.handleTree()
      });
  }

  componentDidUpdate() {

  }


  handleDelClick = () => {
    const id = this.props.id;
    const confirm = window.confirm('確定要刪除樹嗎？');
    if (confirm) {
      fetch(`/api/tree/${id}`, {
        method: 'DELETE'
      })
      .then(() => {
        //window.alert('刪除成功');
        window.location.href = '#/trees';
      })
      .catch( err => console.log('delete error !!! '));
    }
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

  handleTree() {
    this.clearGraphData();
    const json = this.state.tree
    this.treeGetIndex(json);
    let uniqTitles = Array.from( new Set(this.state.uniqTitles));
    let myDic = {}
    let pushable = {}
    for (var i = 0; i < uniqTitles.length; ++i) {
      myDic[uniqTitles[i]] = i;
      pushable[uniqTitles[i]] = true;
    }
    this.setState({ uniqTitles: uniqTitles, titleToID: myDic, pushable: pushable });
    this.treeToNode(json);
    this.treeToEdge(json);
    const newdata = {
      nodes: this.state.nodes.map((v, i) => this.myGenNode(v)),
      edges: this.state.edges
    };
    this.setState({ data: newdata });
  }

  renderTitle = () => {
    const { tree } = this.state;

    return (
      <div>
      <h2>{tree.title}</h2>
        <p>{tree.author}</p>
        <p>{tree.publisher}</p>
        <p><a href={tree.url}>{tree.url}</a></p>
      </div>
    )
  }

  renderTree() {
    return (
      <div>
        <PaperNetGraph graph={this.state.data} ref="graph" />
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="page-header">
              {this.renderTitle()}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <button
              className="btn btn-danger"
              role="button"
              onClick={this.handleDelClick}
            >刪除</button>
          </div>
          {this.renderTree()}
        </div>
      </div>
    );
  }
}

export default SingleTreePage;
