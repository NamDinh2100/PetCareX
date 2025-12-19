export function isAuth(req, res, next) {
  if (!req.session.isAuth) {
    req.session.retUrl = req.originalUrl;
    return res.redirect('/signin');
  }
  next();
}

// Authorization middlewares
export function isCustomer(req, res, next) {
    if (req.session.authUser.role !== 'owner') {
        return res.render('403', 
            
        );
    }
    next();
}

export function isVeterinarian(req, res, next) {
  if (req.session.authUser.role !== 'veterinarian') {
    return res.render('403');
  }
  next();
}

export function isAdmin(req, res, next) {
  if (req.session.authUser.role !== 'admin') {
    return res.render('403');
  }

  next();
}