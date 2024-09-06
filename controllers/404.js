exports.error=(req, res, next) => {
  res.status(404).render("404", {
    title: "page Not Found",
    path: "404",
    isloggedin: req.session.Isloggedin,
  });

}