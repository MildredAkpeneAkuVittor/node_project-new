const express = require ('express');

 const { pool } = require("../config/dbconfig")

 const bcrypt = require('bcrypt');
 const passport = require('passport');
//require("dotenv").config();

const app = express.Router();



const initialized = require('../config/passportconfig');
  initialized(passport);

  app.use(passport.initialize());

  app.get('/adminlogin', checkAuthenticated ,(req, res) => {
     res.render("admin")
     });






 function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/admin/admindashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/adminlogin");
  }
  app.post("/adminlogin",
   passport.authenticate('local'), async(req,res)=> {
    const {useremail}= req.body
    let errors=[]
    let results = await pool.query(`select * FROM userdata WHERE email = $1`, [useremail]);
    try{
      if(results.rows[0].roles ==='admin'){
        
        return res.redirect('admindashboard')
      }
      else{
        errors.push({message:'not authorized'})
        res.render('admin',{errors})
      }
      
      
    }
    catch (err){
      console.log("error")
      console.error(err.message)
    }
  
  })
  
  app.get('admin/logout', (req, res) => {
    req.logout();
    req.flash("success_msg","you are logged out")
    res.redirect('/admin/adminlogin')
 });

 
  app.get('/admindashboard', checkNotAuthenticated, async function  (req, res) {

    
    const keys = await pool.query( `SELECT id, access_key,status,start_date,start_date+interval'5 DAYS' AS expiry_date FROM keystorage ORDER BY id DESC`);
    const allKeys = keys.rows;
     res.render("admindashboard", {allKeys})
    
});

app.put('/admindashboard',async (req,res)=>{
  const keys = await pool.query( `SELECT access_key,status,start_date,start_date+interval'5 DAYS' AS expiry_date FROM keystorage ORDER BY id DESC`);
  if(keys.rows.expiry_date === Date.now ){
    pool.query(`UPDATE student SET status = 'revoked' `);
  }
  
    

    
})
  module.exports = app;