import 'isomorphic-fetch';
import React, { Component } from 'react';


class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      password2: '',
      name: '',
    };
  }

  handleSubmitClick = () => {
    //console.log(this.state)
    //const confirm = window.confirm('確定要新增使用者嗎？');
    //if (confirm) {
    const body = this.state;
    if (body.name=='' || body.password=='' || body.email==''){
      window.alert("Register failed, please fill all the blanks")
    } else if (body.password != body.password2) {
      window.alert("Two passwords are different")
    } else {
      let status = 1;
      //Check Valid or Not
      fetch('/api/auth/exist',{
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body)
      })
      .then( res => res.json() )
      .then( json => {
        console.log(json);
        if(json.exist == true){
          status = 0;
        }; 
        console.log('status',status)
        if (status == 1) {
          fetch('/api/auth/signup', {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(body),
          })
          .then( res => res.json() )
          .then( json => {
            this.setState({
              email: '',
              password: '',
              name: '',
            });
            window.alert('Register success');
            window.location.href = '#/login';
          })
        } else {
          window.alert('Register failed，e-mail has been used');
          this.setState({
              email: '',
              password: '',
              name: '',
          });
        }
      })
    }
  }

  handleNameChange = e => {
    this.setState({
      name: e.target.value,
    });
  }

  handleEmailChange = e => {
    this.setState({
      email: e.target.value,
    });
  }

  handlePasswordChange = e => {
    this.setState({
      password: e.target.value,
    });
  }

  handlePassword2Change = e => {
    this.setState({
      password2: e.target.value,
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <button
              className="btn btn-Danger pull-right"
              role="button"
              onClick={this.handleSubmitClick}
            >Send</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-addon" id="article-title"></span>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                aria-describedby="article-title"
                value={this.state.name}
                onChange={this.handleNameChange}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4"></div>  
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-addon" id="article-title"></span>
              <input
                type="text"
                className="form-control"
                placeholder="E-mail"
                aria-describedby="article-title"
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-addon" id="article-title"></span>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                aria-describedby="article-title"
                value={this.state.password}
                onChange={this.handlePasswordChange}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-addon" id="article-title"></span>
              <input
                type="password"
                className="form-control"
                placeholder="Double Check Password"
                aria-describedby="article-title"
                value={this.state.password2}
                onChange={this.handlePassword2Change}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
