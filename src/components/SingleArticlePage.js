import 'isomorphic-fetch';
import React, { Component, PropTypes } from 'react';
import ReactQuill from 'react-quill';
import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css';
import 'quill/dist/quill.snow.css';

import './style.css';

class SingleArticlePage extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
      tags: [],
      isEditing: false,
    };
  }

  componentDidMount() {
    const id = this.props.id;
    fetch(`/api/articles/${id}`)
      .then(res => res.json())
      .then(article => {
        this.setState({
          title: article.title,
          content: article.content,
          tags: article.tags.map( tag => (tag[0].name))
        });
      });
  }

  componentDidUpdate() {
    /*
    const id = this.props.id;
    fetch(`/api/articles/${id}`)
      .then(res => res.json())
      .then(article => {
        this.setState({
          article,
        });
      });
    */
  }

  onEditorChange = editorContent => {
    this.setState({
      content: editorContent,
    });
  }

  handleTagsChange = tags => {
    this.setState({ tags });
  }

  handleTitleChange = e => {
    this.setState({
      title: e.target.value,
    });
  }

  handleDelClick = () => {
    const id = this.props.id;
    const confirm = window.confirm('確定要刪除文章嗎？');
    if (confirm) {
      fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      })
      .then(() => {
        window.alert('刪除成功');
        window.location = 'http://localhost:3000/#/articles';
      })
      .catch( err => console.log('delete error !!! '));
    }
  }

  handleEditClick = () => {
    const id = this.props.id;
    const {
      title,
      content,
      tags,
      isEditing,
    } = this.state;

    if (isEditing) {
      const body = {
        title,
        content,
        tags,
      };
      fetch(`/api/articles/${id}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(body),
      });
    }
    this.setState({
      isEditing: !this.state.isEditing,
    });
  }

  renderTitle = () => {
    const { isEditing, title } = this.state;
    if (isEditing) {
      return (
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="請輸入標題"
            aria-describedby="article-title"
            value={title}
            onChange={this.handleTitleChange}
          />
        </div>
      );
    }
    return <h1>{title}</h1>;
  }

  renderTags = () => {
    const { isEditing, tags = [] } = this.state;
    //console.log('tags',tags)
    if (isEditing) {
      return (
        <TagsInput
          value={tags}
          onChange={this.handleTagsChange}
        />
      );
    }
    return (
      <TagsInput
        value={tags}
        disabled
      />
    );
  }

  renderContent = () => {
    const { isEditing, content } = this.state;
    if (isEditing) {
      return (
        <ReactQuill
          theme="snow"
          value={content}
          onChange={this.onEditorChange}
          className={'article-main'}
        />
      );
    }
    return (
      <div
        className="article-main"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  render() {
    const { isEditing } = this.state;
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
          <div className="col-md-12">
            {this.renderTags()}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            {this.renderContent()}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <button
              className="btn btn-info"
              role="button"
              onClick={this.handleEditClick}
            >{isEditing ? '確認' : '編輯'}</button>
            {isEditing ? null :
            <button
              className="btn btn-warning"
              role="button"
              onClick={this.handleDelClick}
            >刪除</button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default SingleArticlePage;
