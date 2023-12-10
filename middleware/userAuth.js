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

module.exports = {
  isLogged,
  isLoggedOut
};



