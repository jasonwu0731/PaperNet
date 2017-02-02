import { Router } from 'express';

import models from '../models';

const { Note } = models;

const noteRouter = new Router();

noteRouter.post('/', async(req, res) => {
  const {userId, paperTitle, content} = req.body;
  /*try{
    const note_userId = await Note.findOne({
      paperTitle,
      userId,
    });

    console.log('api/note FIND NOTE!')

    await Note.update({
      content,
    }, {
      where: {
        paperTitle,
        userId,
      },
    });
    res.send(note_userId)

  } catch(err) {*/
    await Note.destroy({
      where: {
        userId,
        paperTitle,
      },
    });
    console.log('api/note destroy note')
    
    const note_userId = await Note.create({
      content,
      paperTitle,
      userId,
    });
    console.log('api/note create note')
    //console.log('Create note_userId: ', note_userId);
    res.send(note_userId)
  //}
}) 

noteRouter.post('/getNote', async(req, res) => {
  const {userId, paperTitle} = req.body;
  let status
  try {
    const note = await Note.findOne({
      where: { 
        userId: userId, 
        paperTitle: paperTitle,
      }
    });
    //console.log('note in api', note);
    //console.log('password', password, 'user.password', user.password)
    if (note != []){
      status = true;
      console.log(`note status: ${status}`);
      res.json({
        success: status,
        id: note.id,
        paperTitle: note.paperTitle,
        content: note.content,
      });
    } else {
      status = false;
      console.log(`note status: ${status}`);
      res.json({
        success: status,
      });
    } 
  } catch (err) {
    console.log(`error: cannot find note ${paperTitle} for userId ${userId}`);
    console.log(err);
    status = false;
    res.json({ success: status });
  }
})

export default noteRouter;