require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const port = process.env.PORT
const path = require('path');
const ejsMate = require('ejs-mate');


main().then(console.log("database connected successfully"))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}

app.use(express.urlencoded({ extended: true }));

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const secretOption = {
    secret: process.env.SECRETCODE,
    resave: false,
    saveUninitialized: true,
};
app.use(session(secretOption));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//home
app.get('/home',(req,res)=>{
    res.render('home');
})

// signup 
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

app.post('/signup', async (req,res)=>{
    const {name , email,username , password} = req.body;
    
    try{
    const existingUser = await User.findOne({ username });
        if (existingUser) {
            // Username is taken
            return res.status(400).send('Username already exists');
        }

    const newUser = new User({
       name:name,
       email:email,
       username:username,
    });

    await User.register(newUser,password);
    res.redirect('/login');

    }catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
})

// login in 

app.get('/login',(req,res)=>{
    res.render('login.ejs');
});

app.post('/login',passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),async (req,res)=>{
    res.redirect('/home');
})

app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        res.redirect('/login');
    })
})



app.listen(port, () => {
    console.log(`the server is listening at port ${port}.`);
})