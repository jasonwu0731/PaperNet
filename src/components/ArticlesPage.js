import 'isomorphic-fetch';
import React, { Component } from 'react';


class ArticlesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
    };
  }

  componentDidMount() {
    fetch('/api/articles')
      .then(res => res.json())
      .then(json => {
        this.setState({
          articles: json,
        });
      });
  }

  renderArticles() {
    const { articles } = this.state;
    //console.log(articles)
    //articles.map( article => { 
    //  console.log('article', article)
    //  console.log('article.tags', article.tags)
    //  //console.log('article.tags.name', article.tags[0].name)
    //} );
    return articles.filter(article => (article.userId === this.props.user.id)).map( article => (
      <tr>
        <td><a href={`#/articles/${article.id}`} key={article.id}>{article.title}</a></td>
        <td><a href={`#/articles/${article.id}`} key={article.id}>{(article.tags.map( tag => (tag[0].name)) || []).join(', ')}</a></td>
        <th><a href={`#/articles/${article.id}`} key={article.id}>{article.createdAt}</a></th>
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
                  <th>Tags</th>
                  <th>Created_at</th>
                </tr>
              </thead>
              <tbody>
                {this.renderArticles()}
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

export default ArticlesPage;
