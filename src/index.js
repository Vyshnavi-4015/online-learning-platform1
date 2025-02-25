const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");


const cookieParser = require("cookie-parser")
app.use(cookieParser())
const session = require('express-session')
app.use(session({
    secret : "secret-code",
    resave : false,
    saveUninitialized : false,
}))

const { UserCollection, CourseCollection } = require("./mongodb");

const temlatepaths = path.join(__dirname, '../templates');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../javascript')));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", temlatepaths);
app.use(express.urlencoded({ extended: false }));

app.listen(3001, () => {
    console.log("http://localhost:3001");
});

app.get('/', (req, res) => {
    if(req.session.uname)
    {
        return res.redirect('/home')
    }
    res.render("signup");
});

app.get('/signup', (req, res) => {
    res.render("signup");
});

app.post('/signup', async (req, res) => {
    try {
        req.session.uname  = req.body.username;
        console.log(req.session);
        const data = new UserCollection({
            name: req.body.username,
            password: req.body.password,
        });
        await data.save();
        const username = req.session.userName;

        res.redirect('home');
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).send("An error occurred. Please try again.");
    }
});


app.get('/login', (req, res) => {
    if(req.session.uname)
    {
        return res.redirect('/home')
    }
    res.render("login", );
});


app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    req.session.uname = username;

    const user = await UserCollection.findOne({ name: username, password: password });
    if (user) {
        res.redirect("home");
    } else {
        res.send("Error: Invalid credentials.");
    }
});

function isAuthenticated(req,res,next){

        next();
}

app.get('/home',isAuthenticated, async (req, res) => {

    const users = await CourseCollection.find();
    //console.log(users);
    res.render('home', { users , uname : req.session.uname});
});

app.get('/addcourse',isAuthenticated , (req, res) => {
    res.render('addcourse', { uname : req.session.uname});
});

app.post('/addcourse', async(req, res) => {
    console.log(req.body)
    const courseName = req.body.className;
    let topics = req.body.topicname;
    let contents = [];

    const sanitizeUrl = (url) => {
        try {
            const validUrl = new URL(url);
            if (validUrl.protocol === 'http:' || validUrl.protocol === 'https:') {
                if (validUrl.hostname === 'www.youtube.com' || validUrl.hostname === 'youtube.com') {
                    const videoId = validUrl.searchParams.get('v');
                    if (videoId) {
                        return `https://www.youtube.com/embed/${videoId}`;
                    }
                } else if (validUrl.hostname === 'www.youtube.com' && validUrl.pathname.includes('/embed/')) {
                    const videoId = validUrl.pathname.split('/')[2];
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }
            return '';
        } catch (e) {
            return '';
        }
    };

    if (Array.isArray(topics)) {
    topics.forEach(topic => {
        const conten = `contents[${topic.replace(/\s+/g,'_')}]`;
        const topiccontents1 = req.body[conten] || [];
        const topiccontents = [];
        topiccontents1.forEach((tc, index) => {
            const urlField = `url{contents[${topic.replace(/\s+/g,'_')}]}`;
            const topicUrl = req.body[urlField] ? req.body[urlField][index] : '';
            const sanitizedUrl = sanitizeUrl(topicUrl);

            if (tc && sanitizedUrl) {
                topiccontents.push({
                    name: tc,
                    url: sanitizedUrl
                });
            }
        });

        contents.push({
            topic: topic,
            content: topiccontents
        });
            });
        } else {
            const conten = `contents[${topics.replace(/\s+/g,'_')}]`;
            const topiccontents = [];
            const topicUrl = req.body[`url{contents[${topics.replace(/\s+/g,'_')}]}`] || [];

            topiccontents.push({
                name: req.body[conten] || '',
                url: sanitizeUrl(topicUrl[0] || '')  // Assuming a single URL, adjust if multiple
            });

            contents.push({
                topic: topics,
                content: topiccontents
            });
        }

        const data = new CourseCollection({
            courseName: courseName,
            Notes: contents
        });

        await data.save();
        console.log(contents);
        res.redirect('/home');

});

app.get('/courseDetails/:courseName',isAuthenticated, async (req, res) => {
    try {
        const courseName = req.params.courseName;
        const courseContents = await CourseCollection.find({ courseName: courseName });
        if (courseContents && courseContents.length > 0) {
            const Notes = courseContents[0].Notes;
            const topiccontent = [];
            console.log(Notes);
            Notes.forEach((note,index)=>{
                    topiccontent.push({
                    topic : note.topic,
                    content : note.content,
                    })
            })
            console.log(topiccontent);
            res.render('courseDetails', { courseName, topiccontent });
        } else {
            res.status(404).send('Course not found');
        }
    } catch (err) {
        console.error('Error fetching course:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/updatecourse',isAuthenticated,(req,res)=>{

    res.render('updatecourse', { uname : req.session.uname});
})

app.get('/deletecourse',isAuthenticated,(req,res)=>{
    res.render('deletecourse', {uname : req.session.uname});

})
app.get('/tutorials',isAuthenticated,(req,res)=>{
    const tutorialUrl = req.query.url;

    res.render('tutorials', {Url: tutorialUrl ,uname : req.session.uname});

})

app.get('/logout',isAuthenticated,(req,res)=>{
    req.session.uname = null;
    res.redirect('/');
})