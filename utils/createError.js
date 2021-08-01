exports.createError = (statusCode=500,message='Something went wrong.') => {
  const err = new Error();
  err.status = statusCode;
  err.message = message;
  return err;
};