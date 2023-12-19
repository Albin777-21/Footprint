const User = require('../model/userModel')


const isLogged = (req, res, next) => {
  if (req.session.user) {
      User.findById({ _id: req.session.user }).lean()
          .then((data) => {
             
                  
              if (!data.isBlocked) {
                  
                  next();
              } else {
                  // console.log('data')
                  // console.log(data)
                  // console.log('redie');
                  res.redirect('/logout');
              }
          })
          .catch((error) => {
              console.error(error);
              res.status(500).send('Server Error');
          });
  } else {
      res.redirect('/login');
  }
}







const isLoggedOut = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
};

//BLOCK MIDDLEWARE

const isBlocked = (req, res, next) => {
  if (req.session.user) {
    User.findById({ _id: req.session.user })
      .lean()
      .then((data) => {
        if (data.isBlocked) {
          req.session.destroy(err => {
            if (err) throw err;
            res.render('login',{ message: 'Your account has been blocked by the admin.' })
        })
          
        } else {
          // User is not blocked, proceed to the next middleware
          next();
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Server Error');
      });
  } else {
    // User is not logged in, redirect to login page
    res.redirect('/login');
  }
};


module.exports = {
  isLogged,
  isLoggedOut,
  isBlocked
};



