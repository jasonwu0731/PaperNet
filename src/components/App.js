import React, { Component } from 'react';

import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ArticlesPage from './ArticlesPage';
import SingleArticlePage from './SingleArticlePage';
import CreateArticlePage from './CreateArticlePage';

import PaperNetPage from './PaperNetPage';
import TreesPage from './TreesPage';
import SingleTreePage from './SingleTreePage';

class App extends Component {
  state = {
    route: window.location.hash.substr(1),
    user: null,
  };

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: window.location.hash.substr(1),
      });
    });
  }

  renderRoute() {
    if (this.state.user == null) {
      if(this.state.route === '/login') {
        console.log('Login')
        return <LoginPage setUserInfo={ user => { this.setState({user: user}); }}/>;
      }
      if(this.state.route === '/register') {
        console.log('Register')
        return <RegisterPage />;
      }
      //return <PaperNetPage user=''/>;
      return <HomePage user=''/>;
    } else {

      if (this.state.route === '/paperNet') {
        return <PaperNetPage user={this.state.user}/>;
      }
    
      if (this.state.route === '/trees') {
        return <TreesPage user={this.state.user}/>;
      }

      //if (this.state.route === '/articles/new') {
      //  return <CreateArticlePage user={this.state.user}/>;
      //}

      if (this.state.route.startsWith('/trees/')) {
        const id = this.state.route.split('/trees/')[1];
        return <SingleTreePage id={id} user={this.state.user}/>;
      }

      return <HomePage user={this.state.user}/>;
    }
  }

  renderBreadcrumb() {
    if (this.state.route === '/trees') {
      return (
        <ol className="breadcrumb">
          <li><a href="#/">Home</a></li>
          <li><a href="#/trees">Trees</a></li>
        </ol>
      );
    }

    if (this.state.route.startsWith('/trees/')) {
      const id = this.state.route.split('/trees/')[1];
      return (
        <ol className="breadcrumb">
          <li><a href="#/">Home</a></li>
          <li><a href="#/trees">Trees</a></li>
          <li><a href={`#/trees/${id}`}>{id}</a></li>
        </ol>
      );
    }

    return (
      <ol className="breadcrumb">
        <li><a href="#/">Home</a></li>
      </ol>
    );
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-default navbar-static-top">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand" href="#/">PaperNet</a>
            </div>
            <ul className="nav navbar-nav">
              { this.state.user ? (
              <li>
                <a href="#/">Home</a>
              </li>) : null}
              { this.state.user ? (
                <li>
                  <a href="#/trees">My Trees</a>
                </li>) : null}
              {
                this.state.user ? (
                <li>
                  <a href="#/" onClick={() => { this.setState({ user: null }); }}>Log Out</a>
                </li>) : (
                <li>
                  <a href="#/login">Log In</a>
                </li>)
              }
            </ul>
          </div>
        </nav>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              {this.renderBreadcrumb()}
            </div>
          </div>
        </div>
        {this.renderRoute()}
      </div>
    );
  }
}


export default App;
