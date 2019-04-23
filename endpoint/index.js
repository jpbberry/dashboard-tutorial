const express = require('express');
var app = express();
const fetch = require('node-fetch')
const bodyParser = require("body-parser");

var db = require("rethinkdbdash")({
    port: 28015,
    host: "localhost",
    db: "thing",
});

app.use((req,res,next) => {
    req.header("Access-Control-Allow-Origin", "*");
    req.header("Access-Control-Allow-Methods", "*");
    next();
})

app.use("/site", express.static("../website"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db = db.table("data");

app.get("/test", (req,res) => {
    res.json({hello: "world"})
});

app.get("/value", (req,res) => {
    db.get(req.query.id).run().then(result=>{
        res.json({value: result.value});
    })
})

app.post("/value", (req,res) => {
    if(!req.body.token) return res.json({error: "unauth"});
    fetch("https://discordapp.com/api/users/@me/guilds", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + req.body.token
        }
    })
        .then(x=>x.json())
        .then(response=>{
            var guild = response.find(x=>x.id == req.body.id);
            if(!guild || !guild.owner) return res.json({error: "unauth"});
            db.update({
                id: req.body.id,
                value: req.body.value
            }).run();
            res.json({success: true});
        })
})

app.listen(3001);