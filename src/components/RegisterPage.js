import 'isomorphic-fetch';
import React, { Component } from 'react';


class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      name: '',
    };
  }

  handleSubmitClick = () => {
    //console.log(this.state)
    //const confirm = window.confirm('確定要新增使用者嗎？');
    //if (confirm) {
    const body = this.state;
    if (body.name=='' || body.password=='' || body.email==''){
      window.alert("註冊失敗, 請填寫所有資訊")
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
            window.alert('註冊成功');
            window.location.href = '#/login';
          })
        } else {
          window.alert('註冊失敗，使用者email已被使用');
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
            >送出</button>
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
                placeholder="姓名"
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
                placeholder="電子信箱"
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

export default LoginPage;
