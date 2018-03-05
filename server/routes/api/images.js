const Image = require('../../models/Image');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/images', function(req, res, next) {
    if (req.query.clientUID){
      Image.find({clientUID: req.query.clientUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.course && req.query.tutorUID){
      Image.find({course: req.query.course, tutorUID: req.query.tutorUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.course && req.query.status){
      Image.find({course: req.query.course, status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.course){
      Image.find({course: req.query.course}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.tutorUID){
      Image.find({tutorUID: req.query.tutorUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }

    else if (req.query.status){
      Image.find({status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else {
      Image.find().exec().then((image) => res.json(image)).catch((err) => next(err));
    }
  });

  app.post('/api/images', function(req, res, next) {
    const image = new Image();
    image.clientUID = req.body.clientUID;
    image.imageURL = req.body.imageURL;
    image.status = req.body.status;
    image.tutorUID = req.body.tutorUID;
    image.course = req.body.course;
    image.timestamp = req.body.timestamp;

    image.save().then(() => res.json(image)).catch((err) => next(err));
  });

  app.delete('/api/images', function(req, res, next) {

    Image.deleteOne({email: req.query.email}).then((image) => res.json()).catch((err) => next(err));
  });

  app.put('/api/images', function(req, res, next) {
    if (req.body.status){
      Image.updateOne({imageURL: req.query.imageURL}, {$set: { status: req.body.status}}).then((image) => res.json()).catch((err) => next(err));
    }
    if (req.body.tutorUID){
      Image.updateOne({imageURL: req.query.imageURL}, {$set: { tutorUID: req.body.tutorUID}}).then((image) => res.json()).catch((err) => next(err));
    }
  })

};
