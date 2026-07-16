exports.sendSuccess = (res, data, statusCode = 200) => {
    return res.status(statusCode).json(data);
};

exports.sendError = (res, message = 'Internal Server Error', statusCode = 500) => {
    return res.status(statusCode).json({ error: message });
};