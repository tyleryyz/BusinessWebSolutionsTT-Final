const ProfileImage = require('../../models/ProfileImage');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/profileimages', function(req, res, next) {

	  if(req.query.clientUID && req.query.imageURL){
		  ProfileImage.find({clientUID: req.qeury.clientUID, imageURL: req.query.imageURL}).exec().then((profileImage) => res.json(profileImage)).catch((err) => next(err));
	  }
	  else if(req.query.clientUID){
		  ProfileImage.find({clientUID: req.qeury.clientUID}).exec().then((profileImage) => res.json(profileImage)).catch((err) => next(err));
	  }
	  else if(req.query.imageURL){
		  ProfileImage.find({imageURL: req.qeury.imageURL}).exec().then((profileImage) => res.json(profileImage)).catch((err) => next(err));
	  }
	  else{
		  ProfileImage.find().exec().then((profileImage) => res.json(profileImage)).catch((err) => next(err));
	  }
  });

  app.post('/api/profileimages', function(req, res, next) {
    const profileImage = new ProfileImage();
    profileImage.clientUID = req.body.clientUID;
    profileImage.imageURL = req.body.imageURL;

    profileImage.save().then(() => res.json(profileImage)).catch((err) => next(err));
  });

  app.delete('/api/profileimages', function(req, res, next) {
    if (req.query.imageURL){
      ProfileImage.deleteOne({imageURL: req.query.imageURL}).then((profileImage) => res.json()).catch((err) => next(err));
  } else{
    ProfileImage.deleteOne({clientUID: req.query.clientUID}).then((profileImage) => res.json()).catch((err) => next(err));
    }
  });

  app.put('/api/profileimages', function(req, res, next) {
	  if(req.body.clientUID && req.body.imageURL){
		  ProfileImage.updateOne({clientUID: req.body.clientUID}, {$set: { imageURL: req.body.imageURL }}).then((profileImage) => res.json()).catch((err) => next(err));
	  }
	  if(req.body.clientUID){
		  ProfileImage.updateOne({clientUID: req.body.clientUID}, {$set: { clientUID: req.body.clientUID }}).then((profileImage) => res.json()).catch((err) => next(err));
	  }
	  if(req.body.imageURL){
		  ProfileImage.updateOne({imageURL: req.body.imageURL}, {$set: { imageURL: req.body.imageURL }}).then((profileImage) => res.json()).catch((err) => next(err));
	  }
  })

};
