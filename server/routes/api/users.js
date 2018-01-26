const User = require('../../models/User');


module.exports = (app) => {
	var bodyParser = require('body-parser');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/users', function (req, res, next) {
    User.findOne({email: req.query.email, password:req.query.password})
				.exec()
	      .then((user) => res.json(user))
	      .catch((err) => next(err));
	  });

  app.post('/api/users', function (req, res, next) {
    const user = new User();
		user.fname=req.body.fname;
		user.lname=req.body.lname;
		user.email=req.body.email;
		user.password=req.body.password;
		user.permission=req.body.permission;
    user.save()
      .then(() => res.json(user))
      .catch((err) => next(err));
  });

  app.delete('/api/users', function (req, res, next) {
    User.deleteMany({})
      .then((user) => res.json())
      .catch((err) => next(err));
  });


};
