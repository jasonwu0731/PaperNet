import { Router } from 'express';

import models from '../models';

const { Article, Tag, ArticleTag } = models;

const articleRouter = new Router();

articleRouter.get('/', async (req, res) => {
  try {
    //console.log(models);
    let articles = await Article.all();
    articles = await Promise.all( articles.map( async article => {
        let tags;
        let article_tags;
        article_tags = await ArticleTag.findAll({ where: { articleId: article.id } });
        //console.log('article_tags', article_tags);
        tags = await Promise.all( article_tags.map( async article_tag => {
            let name;
            name = await Tag.findAll({ where: { id: article_tag.tagId } });
            //console.log('name', name);
            return name
          })
        )
        article.dataValues.tags = tags;
        //console.log('tags in api', tags);
        //console.log('tags[0] in api', tags[0]);
        return article;
      }),
    )
    //console.log('articles in api', articles )
    //console.log('articles[0].tags in api', articles[0].tags)
    //console.log('typeof(articles)', typeof(articles)) 
    res.send(articles);
  } catch (err) {
    console.error('GET ERROR ',err);
  }
});

articleRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  let article = await Article.findById(id);
  //console.log('article in api :id', article);
  let tags;
  let article_tags;
  article_tags = await ArticleTag.findAll({ where: { articleId: article.id } });
  //console.log('article_tags', article_tags);
  tags = await Promise.all( article_tags.map( async article_tag => {
      let name;
      name = await Tag.findAll({ where: { id: article_tag.tagId } });
      //console.log('name', name);
      return name
    })
  )
  article.dataValues.tags = tags;
  //console.log('article in api :id', article)
  res.json(article);
});

articleRouter.post('/', async (req, res) => {
  const { userId, title, content, tags } = req.body;

  const article = await Article.create({
    title,
    content,
    userId,
  });

  for (let i = 0; i < tags.length; i += 1) {
    const [tag] = await Tag.findOrCreate({
      where: {
        name: tags[i],
      },
    });

    await ArticleTag.create({
      articleId: article.id,
      tagId: tag.id,
    });
  }

  res.json(article);
});

articleRouter.put('/:id', async (req, res) => {
  const { title, content, tags } = req.body;
  const id = req.params.id;

  //console.log("PUT NOT IMPLEMENT!!!!!!!!!!!!")
  await Article.update({
    title,
    content,
  }, {
    where: {
      id,
    },
  });

  // FIXME: tags
  let tagsNO;
  let article_tags;
  article_tags = await ArticleTag.findAll({ where: { articleId: id } });
  //console.log('article_tags', article_tags);
  tagsNO = await Promise.all( article_tags.map( async article_tag => {
      let tag_ob;
      tag_ob = await Tag.findAll({ where: { id: article_tag.tagId } });
      //console.log('tag_ob', tag_ob);
      //console.log('tag_ob[0].name', tag_ob[0].name);
      //console.log('tags', tags);
      for (let i = 0; i < tags.length; i += 1) {
        if (tag_ob[0].name == tags[i]) {
          break;
        } else if(tag_ob[0].name != tags[i] && i==(tags.length-1))  {
          console.log('ARTICLE TAG 被刪除了');
          ArticleTag.destroy({ where: {id: article_tag.id}});

          //Remove that one in Tags if no article_tags point to it
          let check = 0;
          //console.log('article_tags.length',article_tags.length)
          //console.log('tag_ob[0].id',tag_ob[0].id)
          for (let i=0; i<article_tags.length; i += 1) {
            //console.log('article_tags[i].tagId',article_tags[i].tagId)
            //console.log((article_tags[i].tagId == tag_ob[0].id))
            if (article_tags[i].tagId == tag_ob[0].id && article_tags[i].id != article_tag.id){
              check = 1;
            }
          }
          //console.log('check',check)
          if (check == 0) {
            await Tag.destroy({where: {id: tag_ob[0].id}})
            console.log('從TAGS刪除了一個')
          }
        } 
      }
      //console.log('name', name);
      return tag_ob[0].name
    })
  )
  for (let i = 0; i < tags.length; i += 1) {
    //console.log(i);
    //console.log('tags[i]', tags[i], typeof(tags[i]));
      
    let [tag] = await Tag.findAll({
      where: {
        name: tags[i],
      },
    });
    //console.log('tag',tag)
    if (tag != null) {
      //console.log('find tag.id', tag.id)
      await ArticleTag.findOrCreate({ 
        where: {
          articleId: id,
          tagId: tag.id,
        }
      });
      console.log('Find One Tag and update ArticleTag')
    } else {
      //console.log('Here we are!')
      let [tag] = await Tag.findOrCreate({
        where: {
          name: tags[i],
        },
      });
      console.log('create tag', tag)
      await ArticleTag.create({
        articleId: id,
        tagId: tag.id,
      });
      console.log('Find no Tag, create Tag and ArticleTag')
    }
  }

  const article = await Article.findById(id);
  res.json(article);
});

articleRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;

  console.log('Going to delete article id', id)

  //delete article_tags first
  await ArticleTag.destroy({ where: { articleId: id } });

  //then delete article
  await Article.destroy({
    where: {
      id,
    },
  });

  res.json({
    deletedId: +id,
  });
});

export default articleRouter;
