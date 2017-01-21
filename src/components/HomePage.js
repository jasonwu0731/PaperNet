import React, { Component } from 'react';


class HomePage extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="jumbotron">
              <h1>paperNet</h1>
              <h3>Hello, {this.props.user.name} </h3>
              {
                this.props.user ? (<p><a className="btn btn-success btn-lg" href="#/articles" role="button">My Trees</a></p>)
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
