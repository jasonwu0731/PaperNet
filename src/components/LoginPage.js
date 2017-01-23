import 'isomorphic-fetch';
import React, { Component } from 'react';


class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  handleSubmitClick = () => {
    //console.log(this.state)
    //const confirm = window.confirm('確定要新增使用者嗎？');
    //if (confirm) {
      const body = this.state;
      fetch('/api/auth/login', {
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
        });
        console.log(json);
        if(json.success == true){
          //window.alert('登入成功');
          const info = {name:json.name, id: json.id};
          this.props.setUserInfo( info );
          document.location.href = '#/';
        } else {
          window.alert('登入失敗');
        }
      })
    //}
  }

  handleRegisterClick = () => {
    window.location.href = '#/register'
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

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <button
              className="btn btn-primary pull-right"
              role="button"
              onClick={this.handleSubmitClick}
            >登入</button>
            <button
              className="btn btn-primary pull-right"
              role="button"
              onClick={this.handleRegisterClick}
            >註冊帳號</button>
          </div>         
        </div>
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">E-mail</span>
              <input
                type="text"
                className="form-control"
                placeholder="電子信箱"
                aria-describedby="article-title"
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
            </div>
          </div>
          <div className="col-md-4"></div>
        </div>
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">Password</span>
              <input
                type="password"
                className="form-control"
                placeholder="密碼"
                aria-describedby="article-title"
                value={this.state.password}
                onChange={this.handlePasswordChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LoginPage.propTypes = {
  setUserInfo: React.PropTypes.func
};

export default LoginPage;
