const Image = require('../../models/Image');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/images', function(req, res, next) {
    if (req.query.clientID){
      Image.find({clientID: req.query.clientID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.course){
      Image.find({course: req.query.course}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.tutorID){
      Image.find({tutorID: req.query.tutorID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.status){
      Image.find({status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
  });

  app.post('/api/images', function(req, res, next) {
    const image = new Image();
    image.clientID = req.body.clientID;
    image.imageURL = req.body.imageURL;
    image.status = req.body.status;
    image.tutorID = req.body.tutorID;
    image.course = req.body.course;

    image.save().then(() => res.json(image)).catch((err) => next(err));
  });

  app.delete('/api/images', function(req, res, next) {

    Image.deleteOne({email: req.query.email}).then((image) => res.json()).catch((err) => next(err));
  });

  app.put('/api/images', function(req, res, next) {
    if (req.body.status){
    Image.updateOne({imageURL: req.query.imageURL}, {$set: { status: req.body.status}}).then((image) => res.json()).catch((err) => next(err));
    }
    if (req.body.tutorID){
      Image.updateOne({imageURL: req.query.imageURL}, {$set: { tutorID: req.body.tutorID}}).then((image) => res.json()).catch((err) => next(err));
    }
  })

};
