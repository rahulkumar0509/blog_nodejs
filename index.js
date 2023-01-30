const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb')
const cors = require('cors');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fileUpload = require('express-fileupload');

app.use(cors());
app.use(fileUpload())

var conn = MongoClient.connect('mongodb://localhost:27017/') // returns a Promise

app.get('/', function(req, res) {
    conn.then(client=> client.db('test').collection('test').find({}).toArray(function(err, docs) {
        if(err) { console.error(err) }
        console.log(docs);
        res.send(JSON.stringify(docs))
    })).catch(err=>{
        throw err;
    });
})

// create application/json parser
const jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// app.get('/', (req, res)=>{
//     res.send('Hello Questionaire!');
// })

const server = app.listen(process.env.PORT || port, ()=>{
    console.log('App is running on port', port);
});

app.post('/signup', jsonParser, (req, res)=>{
    conn.then((err=>{
        if(err) throw err;
    }, client=>{
        client.db('questionaire').collection('users').insertOne(
            {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone
            }, (err, success)=>{
                if(err) {
                    console.log(err);
                    res.send("Something bad happened.")
                    throw err;
                }
                res.send("user added!");
            }
        )}
    ))
});

app.get('/signin', jsonParser, (req, res)=>{
    console.log(req.query);
    conn.then((err=>{
        if(err) throw err;
    }, client=>{
        client.db('questionaire').collection('users').findOne(
            { email: req.query.email, password: req.query.password }, (err=>{
                if(err) {
                    console.log(err);
                    res.send("Something bad happened.");
                    throw err;
                }
            }, data=>{
                console.log(data);
                if(data){
                    res.send(data);
                } else{
                    res.send('Incorrect username or password');
                }
            })
        )}
    ))
});

app.get('/blogs', jsonParser, (req, res)=>{
    console.log(req.query);
    conn.then((err=>{
        if(err) throw err;
    }, client=>{
        client.db('questionaire').collection('blogs').find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
        })
    }))
});

app.get('/article', jsonParser, (req, res)=>{
    conn.then((err=>{
        if(err) throw err;
    }, client=>{
        client.db('questionaire').collection('article').find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
        })
    }))
});

app.get('/contents', jsonParser, (req, res)=>{
    conn.then((err=>{
        if(err) throw err;
    }, client=>{
        client.db('questionaire').collection('contents').find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
        })
    }))
});

// payload must be formData, otherwise use jsonparser here
app.post('/blogs/write', jsonParser, (req, res)=>{
    // console.log(req.body);
    let blog = {};
    if(req.body.blogData){
        Object.assign(blog, JSON.parse(req.body.blogData));    
    } else{
        blog = req.body;
    }
    // Object.assign(blog, JSON.parse(req.body.blogData));
    blog['blogId']=Math.random();
    if(req.files){
        blog['image'] = req.files[0].data;
    }
    // console.log(blog);
    conn.then((err=>{
        if (err) throw err;
    }, client=>{
        client.db('questionaire').collection('blogs').insertOne(blog, function(err,result){
            if (err) throw err;
            console.log("1 document inserted");
            res.send(result)
        })
    }))
})


// db.createCollection('article');
// db.article.insertOne({title: '', brief: '', type: '', articleId: '', image: '', content: '', multipleContents: false });
// db.contents.insertOne({title: '', contentId: '', articleId: '', descriptions: '', image: ''})

// Usage of below method
// process.kill(process.pid, 'SIGTERM');
process.on('SIGTERM', ()=>{
    server.close(()=>{
        console.log('Server disconnected!!');
    })
})