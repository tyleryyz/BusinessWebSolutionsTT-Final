const School = require('../../models/School');

module.exports = (app) => {
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/api/schools', function(req, res, next) {

    if (req.query.name){
      School.findOne({name: req.query.name}).exec().then((school) => res.json(school)).catch((err) => next(err));
    }
    else {

    }
  });

  app.post('/api/schools', function(req, res, next) {
    const school = new School();
    console.log(req.body.name)
    console.log(req.body.course)
    school.name = req.body.name;
    school.courses.push({name: req.body.course});
    school.save().then(() => res.json(school)).catch((err) => next(err));
  });

  app.delete('/api/schools', function(req, res, next) {

    School.deleteOne({name: req.query.name}).then((school) => res.json()).catch((err) => next(err));
  });


}
