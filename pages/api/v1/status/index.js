function status(request, response) {
  response.status(200).json({
    success: true,
  });
}

export default status;
