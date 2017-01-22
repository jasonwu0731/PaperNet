import 'isomorphic-fetch';
import React, { Component } from 'react';


class TreesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trees: [],
    };
  }

  componentDidMount() {
    fetch('/api/tree')
      .then(res => res.json())
      .then(json => {
        this.setState({
          trees: json,
        });
      });
  }

  renderTrees() {
    const { trees } = this.state;
    
    //trees.filter(tree => (tree.userId === this.props.user.id)).map( tree => (console.log( JSON.parse(tree.tree).title )) )

    return trees.filter(tree => (tree.userId === this.props.user.id)).map( tree => (
      <tr>
        <td><a href={`#/trees/${tree.id}`} key={tree.id}>{JSON.parse(tree.tree).title}</a></td>
        <td><a href={`#/trees/${tree.id}`} key={tree.id}>{JSON.parse(tree.tree).url}</a></td>
        <th><a href={`#/trees/${tree.id}`} key={tree.id}>{tree.createdAt}</a></th>
      </tr>
    ));
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Tree</th>
                  <th>Created_at</th>
                </tr>
              </thead>
              <tbody>
                {this.renderTrees()}
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <a href="#/" className="btn btn-default">
              <span className="glyphicon glyphicon-arrow-left" aria-hidden="true" /> Back
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default TreesPage;
