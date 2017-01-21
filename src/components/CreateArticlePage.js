import 'isomorphic-fetch';
import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css';
import 'quill/dist/quill.snow.css';

class CreateArticlePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
      tags: [],
    };
  }

  onEditorChange = editorContent => {
    this.setState({
      content: editorContent,
    });
  }

  handleSubmitClick = () => {
    const confirm = window.confirm('確定要新增文章嗎？');
    if (confirm) {
      let body = this.state;
      body.userId = this.props.user.id;
      fetch('/api/articles', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(body),
      }).then(result => {
        this.setState({
          title: '',
          content: '',
          tags: [],
        });
        console.log(result);
        window.location.href = '#/articles';
      }).catch(err => console.log('POST failed!!'));
    }
  }

  handleTagsChange = tags => {
    this.setState({ tags });
  }

  handleTitleChange = e => {
    this.setState({
      title: e.target.value,
    });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <button
              className="btn btn-info pull-right"
              role="button"
              onClick={this.handleSubmitClick}
            >送出</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="input-group">
              <span className="input-group-addon" id="article-title">標題</span>
              <input
                type="text"
                className="form-control"
                placeholder="請輸入標題"
                aria-describedby="article-title"
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <TagsInput value={this.state.tags} onChange={this.handleTagsChange} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <ReactQuill
              theme="snow"
              value={this.state.content}
              onChange={this.onEditorChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CreateArticlePage;
