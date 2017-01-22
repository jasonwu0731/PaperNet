import React, { Component } from 'react';


class HomePage extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="jumbotron">
              <h1>Welcome to PaperNet, <a href="#/">{this.props.user.name}</a> </h1>
              <p>A website to automatically construct a citation and reference graph for your query concepts or papers.</p>
              {
                this.props.user ? (<p><a className="btn btn-success btn-lg" href="#/trees" role="button">My Trees</a></p>)
                : (<p>Please <a href="#/login">login</a> to build your own research tree!</p>)
              }
              {
                this.props.user ? (<p><a className="btn btn-success btn-lg" href="#/paperNet" role="button">Create Tree</a></p>):null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;
