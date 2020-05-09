// This is middleware for restricting API routes for information and socket.io
module.exports = function(req, res, next) {
	// If the request has a registered API key, continue with the request to the restricted route
	if (req.registered) {
		return next();
	}

	// If the user isn't logged in, redirect them to the login page
	return res.sendStatus(401);
};