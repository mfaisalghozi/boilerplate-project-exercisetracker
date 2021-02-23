const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let user = [];
let final = [];

//SHOW ALL USER
app.get('/api/exercise/users', (req,res) => {
  let showUser = [];
  for(let i=0;i<user.length;i++){
     showUser.push({
       _id: i.toString(),
       username: user[i],
     }); 
  }
  res.json(showUser);
});

//SHOW USER EXERCISE LOG
app.get('/api/exercise/log',(req,res)=>{
  let id = req.query.userId;
  let fromDate = req.query.from;
  let toDate = req.query.to;
  let limit = req.query.limit;

  let user = final.find(ex => ex._id == id);
  console.log('log : '+id+' '+fromDate+' '+toDate+' '+limit);

  if (fromDate){
    var fromD = new Date(fromDate).getTime();
    var toD = new Date(toDate).getTime();
    var currLogDate;

    let newLog = user.log.filter(x => {
        currLogDate = new Date(x.date).getTime();
        if(currLogDate >= fromD && currLogDate <= toD){
          return true;
        }else{
          return false;
        }
    });
    user.log = newLog;
    res.json(user);

  }else{
    if(limit){
      let count=0;
      let newLog = user.log.filter(x => {
        if(count<limit){
          count++;
          return true;
        }else{
          return false;
        }
      });
      user.log = newLog
    }
    res.json(user);
  }
});

//ADD NEW USER
app.post('/api/exercise/new-user',(req,res)=>{
  let username = req.body.username;
  
  user.push(username);
  final.push({
    _id: user.indexOf(username),
    username: username,
    count: 0,
    log: []
  })
  console.log('createUser : '+ username+' id : '+user.indexOf(username));
  res.json({
    username: username,
    _id : user.indexOf(username)
  })
});

//ADD EXERCISE TO USER
app.post('/api/exercise/add', (req,res) => {
  let userId = req.body.userId;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  
  console.log('add: '+userId+' '+description+' '+duration+' '+date);

  //check user id
  if(userId >= user.length){
    res.send('userId didnt exist')
  }

  //checkDesc
  if(description == ''){
    res.send('path desc is required')
  }

  //checkDuration
  if(duration == ''){
    res.send('path duration is required')
  }
  
  //checkDateNull
  if(date == '' || date == undefined){
    var d = new Date();
    var n = d.toString();
    var [day,month,dateN,year] = n.split(' ',4);
  }else{
    var d = new Date(date);
    console.log(d);
    var n = d.toString();
    var [day,month,dateN,year] = n.split(' ',4);
  }

    let finalUser = final.find(x => x._id == userId);
    finalUser.count = finalUser.count + 1;
    finalUser.log.push({
      description: description,
          duration : duration,
          date : day+' '+month+' '+dateN+' '+year
    })
    final = [finalUser,...final];

    res.json({
      _id : parseInt(userId),
      username: user[userId],
      date : day+' '+month+' '+dateN+' '+year,    
      duration : parseInt(duration),
      description: description,
    })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

