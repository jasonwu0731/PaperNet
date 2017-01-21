import { Router } from 'express';

import models from '../models';

import bcrypt from 'bcryptjs'

const { User } = models;

const articleRouter = new Router();

articleRouter.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  //console.log("Received User's Info!");
  console.log( "original information", { email, password, name });
  
  bcrypt.genSalt(10)
    .then(res => { 
    	console.log('salt is '+res+' '+typeof(res)); 
    	console.log('pass is '+password+' '+typeof(password)); 
    	return bcrypt.hash(password, res); 
	})
    .catch(err => console.log('genSalt failed!!'))
    .then( newpass => {
      console.log('hashed pass is '+newpass);
      //console.log('User name is '+name);
      console.log('User email is '+email);
      return User.create({
        email: email, 
        password: newpass,
        name:  name,
      });
    }, err => console.log('hash failed!'))
    .then(user => res.json({
      createdId: user.id,
    }))
    .catch(err => console.log('Create user failed!'+err));
  
  //const newUser = await User.create({
  //  email, password, name 
  //});
  //res.json({
  //  createdId: newUser['id'],
  //});

});

articleRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user;
  let status;
  try {
    user = await User.findOne({
      where: { 
        email: email, 
      }
    });
    console.log('user in api', user);
    //console.log('password', password, 'user.password', user.password)
    if (bcrypt.compareSync(password, user.password)){
      status = true;
      console.log(`login status: ${status}`);
      res.json({
        success: status,
        id: user.id,
        name: user.name,
      });
    } else {
      status = false;
      console.log(`login status: ${status}`);
      res.json({
        success: status
      });
    }
    
  } catch (err) {
    console.log(`error: cannot find user ${email}`);
    console.log(err);
    status = false;
    res.json({ success: status });
  }
  /*
  const { email, password } = req.body;
  let user;
  let status;
  try {
    user = await User.findOne({
      where: { 
      	email: email,
  		  password: password 
  	  }
    });
    status = (password == user.password);
    console.log(`login status: ${status}`);
    res.json({
      success: status,
      id: user.id,
      name: user.name,
    });
  } catch (err) {
    console.log(`error: cannot find user ${email}`);
    console.log(err);
    status = false;
    res.json({ success: status });
  }
  */

});

articleRouter.post('/exist', async (req, res) => {
  const { email } = req.body;
  let user;
  let status;

  user = await User.findOne({
    where: { 
      email: email, 
    }
  });
  console.log('user in api', user);
  if (user!=null) {
    //console.log("NOT NULL")
    //console.log('password', password, 'user.password', user.password)  
    status = true;
    //console.log(`login status: ${status}`);
    res.json({
      exist: status,
    });
  } else { 
    //console.log(`error: cannot find user ${email}`);
    //console.log(err);
    status = false;
    res.json({ exist: status });
  }
});


export default articleRouter;
