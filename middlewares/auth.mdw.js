export function isAuth(req, res, next) {
  if (!req.session.isAuth) {
    req.session.retUrl = req.originalUrl;
    return res.redirect('/signin');
  }
  next();
}

export function isManager(req, res, next) {
    if (req.session.authUser.position === 'Branch Manager') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }   
}

export function isReceptionist(req, res, next) {
    if (req.session.authUser.position === 'Receptionist') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}

export function isDoctor(req, res, next) {
    if (req.session.authUser.position === 'Doctor') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}

export function isSaler(req, res, next) {
    if (req.session.authUser.position === 'Sales Staff') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}