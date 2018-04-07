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
      School.find({}).exec().then((school) => res.json(school)).catch((err) => next(err));
    }
  });

  app.post('/api/schools', function(req, res, next) {
    const school = new School();
    course = req.body.course;
    school.name = req.body.name;
    if (school.courses === undefined){
      school.courses.addToSet(course);
    } else {
      school.courses = [course];
    }
    school.save().then(() => res.json(school)).catch((err) => next(err));
  });

  app.put('/api/schools', function(req, res, next) {
    let name = req.body.name;
    let course = req.body.course;
    School.updateOne({name: name}, {$addToSet: {courses: course}}).then((user) => res.json()).catch((err) => next(err));

  });


  app.delete('/api/schools', function(req, res, next) {
    if (req.body.course){
      let name = req.body.name;
      let course = req.body.course;

      School.findOne({name: name}).exec().then((school) => {
        console.log(school.courses)
          for (i=0; i<school.courses.length;i++){
            if (school.courses[i] === course){
              school.courses.splice(i, 1);
              school.save();
            }
          }
          res.json(school)
      }).catch((err)=>next(err));
    }

    else if (req.body.name){
      School.deleteOne({name: req.body.name}).then((school) => res.json()).catch((err) => next(err));
    }

  });


}
