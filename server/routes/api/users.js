const User = require('../../models/User');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/users', function(req, res, next) {
    if (req.query.uID){
      User.findOne({uID: req.query.uID}).exec().then((user) => res.json(user)).catch((err) => next(err));
    }
    else if (req.query.email){
      User.findOne({email: req.query.email}).exec().then((user) => res.json(user)).catch((err) => next(err));
    } else {
      User.find({}).exec().then((user) => res.json(user)).catch((err) => next(err));
    }
  });

  app.post('/api/users', function(req, res, next) {
    const user = new User();
    user.fname = req.body.fname;
    user.lname = req.body.lname;
    user.email = req.body.email;
    user.school=req.body.school;
    user.courses=req.body.courses;
    user.uID = req.body.uID;
    user.permission = req.body.permission;
    user.save().then(() => res.json(user)).catch((err) => next(err));
  });

  app.delete('/api/users', function(req, res, next) {

    User.deleteOne({email: req.query.email}).then((user) => res.json()).catch((err) => next(err));
  });

  app.put('/api/users', function(req, res, next) {
    if (req.body.permission){
    User.updateOne({email: req.query.email}, {$set: { permission: req.body.permission}}).then((user) => res.json()).catch((err) => next(err));
    }
    if (req.body.fname){
      User.updateOne({email: req.query.email}, {$set: { fname: req.body.fname}}).then((user) => res.json()).catch((err) => next(err));
    }
    if (req.body.lname){
      User.updateOne({email: req.query.email}, {$set: { lname: req.body.lname}}).then((user) => res.json()).catch((err) => next(err));
    }
    if (req.body.email){
      User.updateOne({email: req.query.email}, {$set: { email: req.body.email}}).then((user) => res.json()).catch((err) => next(err));
    }
    if (req.body.school && req.body.courses){
      User.updateOne({email: req.query.email}, {$set: {school: req.body.school, courses: req.body.courses}}).then((user) => res.json()).catch((err) => next(err));
  }
  })

};
