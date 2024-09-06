module.exports = (req,res,next)=>{
    if(! req.session.Isloggedin){
         res.redirect("/login");
    }
    next();
}