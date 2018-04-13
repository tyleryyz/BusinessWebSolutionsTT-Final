const Image = require('../../models/Image');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/images', function(req, res, next) {

    if (req.query.status && req.query.clientUID && req.query.course){

      if (req.query.status === "open"){
        Image.find({$or: [{status: "open"}, {status: "claimed"}], clientUID: req.query.clientUID, course: req.query.course}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
      else {
        Image.find({status: req.query.status, clientUID: req.query.clientUID, course: req.query.course}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
    }

    else if (req.query.school && req.query.course && req.query.status){
      Image.find({course: req.query.course, school: req.query.school, status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }

    else if (req.query.school && req.query.course){
      Image.find({course: req.query.course, school: req.query.school}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if(req.query.school && req.query.status){
      Image.find({school: req.query.school, status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));

    }
    else if(req.query.school){
      Image.find({school: req.query.school}).exec().then((image) => res.json(image)).catch((err) => next(err));

    }
    else if (req.query.course && req.query.clientUID){
      Image.find({course: req.query.course, clientUID: req.query.clientUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.status && req.query.clientUID){

      if (req.query.status === "open"){
        Image.find({$or: [{status: "open"}, {status: "claimed"}], clientUID: req.query.clientUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
      else {
        Image.find({status: req.query.status, clientUID: req.query.clientUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
    }

    else if (req.query.clientUID){
      Image.find({clientUID: req.query.clientUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.course && req.query.tutorUID){
      Image.find({course: req.query.course, tutorUID: req.query.tutorUID}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.course && req.query.status){

      if (req.query.status === "open"){
        Image.find({$or: [{status: "open"}, {status: "claimed"}], course: req.query.course}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
      else {
        Image.find({course: req.query.course, status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
    }

    else if (req.query.course){
      Image.find({course: req.query.course}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.tutorUID && req.query.status){
      Image.find({tutorUID: req.query.tutorUID, status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
    }
    else if (req.query.status){

      if (req.query.status === "open"){
        Image.find({$or: [{status: "open"}, {status: "claimed"}]}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
      else {
        Image.find({status: req.query.status}).exec().then((image) => res.json(image)).catch((err) => next(err));
      }
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
    image.videoURL = req.body.videoURL;
    image.purchased = req.body.purchased;
    image.school = req.body.school;
    image.comment = req.body.comment;
    image.reportComment = "";
    image.reportReason = "";

    image.save().then(() => res.json(image)).catch((err) => next(err));
  });

  app.delete('/api/images', function(req, res, next) {
    if (req.query.imageURL){
      Image.deleteOne({imageURL: req.query.imageURL}).then((image) => res.json()).catch((err) => next(err));
    } else{
    Image.deleteOne({email: req.query.email}).then((image) => res.json()).catch((err) => next(err));
    }
  });

  app.put('/api/images', function(req, res, next) {
    if (req.body.status){
      Image.updateOne({imageURL: req.query.imageURL}, {$set: { status: req.body.status}}).then((image) => res.json()).catch((err) => next(err));
    }
    if (req.body.tutorUID){
      Image.updateOne({imageURL: req.query.imageURL}, {$set: { tutorUID: req.body.tutorUID}}).then((image) => res.json()).catch((err) => next(err));
    }
	if (req.body.videoURL){
		Image.updateOne({imageURL: req.query.imageURL}, {$set: { videoURL: req.body.videoURL}}).then((image) => res.json()).catch((err) => next(err));
    }
	if (req.body.purchased){
		Image.updateOne({imageURL: req.query.imageURL}, {$set: { purchased: req.body.purchased}}).then((image) => res.json()).catch((err) => next(err));
    }

  if(req.body.reportComment && req.body.status && req.body.reportReason){
    Image.updateOne({imageURL: req.query.imageURL}, {$set: { reportComment: req.body.reportComment, status: req.body.status, reportReason: req.body.reportReason }}).then((image) => res.json()).catch((err) => next(err));
  }
  if (req.body.status && req.body.reportReason){
    Image.updateOne({imageURL: req.query.imageURL}, {$set: { status: req.body.status, reportReason: req.body.reportReason }}).then((image) => res.json()).catch((err) => next(err));

  }
  })

};
