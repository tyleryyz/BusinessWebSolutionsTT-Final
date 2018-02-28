const Course = require('../../models/Course');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/courses', function(req, res, next) {

    if (req.query.name){
      Course.findOne({name: req.query.name}).exec().then((course) => res.json(course)).catch((err) => next(err));
    }
    else {
      Course.find().exec().then((course) => res.json(course)).catch((err) => next(err));
    }
  });

  app.post('/api/courses', function(req, res, next) {
    const course = new Course();
    course.name = req.body.name;

    course.save().then(() => res.json(course)).catch((err) => next(err));
  });

  app.delete('/api/courses', function(req, res, next) {

    Course.deleteOne({name: req.query.name}).then((course) => res.json()).catch((err) => next(err));
  });


}
