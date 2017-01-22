import React, { Component } from 'react';

import Request from "request";
import cheerio from "cheerio";


class PaperNetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: {},
      title: '',
      branch: 5,
      depth: 2,
    };
  }

  handleTree = () => {
    //console.log(this.state.title)
    let body = {title: this.state.title, branch: this.state.branch, depth: this.state.depth} //{title: 'Mastering the game of Go with deep neural networks and tree search'}
    if (this.state.title == ''){
      window.alert("論文標題不可空白")
    } else {
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
        console.log(json);
      })
    }
  }

  renderTree() {
    const tree = this.state.tree
    return (
      <div>
        <div>{tree.title}</div>
        <div>{tree.author}</div>
        <div>{tree.url}</div> 
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
        this.setState({
          tree: {}
        });
        console.log(result);
        window.location.href = '#/';
      }).catch(err => console.log('POST failed!!'));
    }
  }
  
  render() {
    return (

      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">標題</span>
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
              <span className="input-group-addon" id="article-title">Max Branch</span>
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
              <span className="input-group-addon" id="article-title">Max Depth</span>
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
            <p><a className="btn btn-success btn-lg" role="button" onClick={this.handleTree}>Show Tree</a></p>
            <p><a className="btn btn-success btn-lg" role="button" onClick={this.handleStoreTree}>Store Tree</a></p>
            {this.renderTree()}
          </div>
        </div>
      </div>
    );
  }
}

export default PaperNetPage;
