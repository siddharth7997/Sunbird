
//These APIs run over the  cassandra
//The front end might need some change based on this APIS
//we have written the front end based on multicore.json
//if the sunbird server is working try these APIS and make changes in the data preprocess and chack the front End



//--------------------------------------API SERVER INITIALIZATTION-----------------------------------------
var express=require('express')
var app=express()
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['127.0.0.1:9042'], keyspace: 'sunbird' });
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var fs=require('fs');
global.globalVariable={};
global.auth_tokens=[];
//----------------------------------------utilities----------------------------------------------------------
function connect_to_database() //Connects to the database
{
    client.connect(function(err){
        if(err) throw err;
        else
        {
            console.log("Successfully conected");
        }
    });
}
function ret() //returns the global object
{
    return global.globalVariable;
}

function updateGlobalVariable(item) //updates the globalVariable object which is used to maintain the counts
{
    //console.log(global.globalVariable);
    if(global.globalVariable[item])
    {
        global.globalVariable[item]++;
    }
    else
    {
        global.globalVariable[item]=1;
    }
}
//---------------------------------------------APIs-----------------------------------------------------------

//getOrganizationCourses FETCHES A LIST OF COURSES ADDED BY THE GIVEN USERS
app.post('/getOrganizationCourses',function(req,res)
{
    // response header
    res.setHeader('Content-Type','application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    console.log(req.body);
    if(req.user_auth)
    {
        if(req.user_auth in global.auth_tokens)
        {
        }
        else
        {
            res.status(404).send("Un-Authorised user");
        }
    }
    else
    {
        res.status(404).send("no auth token");
    }
    
    if(req.body.id)
    {
        //query
        var query="select coursename from sunbird.course_management where addedby='"+req.body.id+"' allow filtering";
        client.execute(query,function(err,result){
            //console.log(result.rows);
            res.write(JSON.stringify(result.rows));
            res.end();
        });
    }
    else
    {
        res.status(404).send('user id claim missing');
    }
});

//getGenderDistCourse RETURNS A JSON OBJECT CONSISTING OF THE FREQUENCIES OF THE VARIOUS GENDERS WHO ARE ENROLLED IN A COURSE
app.post('/getGenderDistCourse',function(req,res){
    // response header
    global.globalVariable={};
    res.setHeader('Content-Type','application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    console.log(req.body);
    // checking if the user is an authenticated
    if(req.user_auth)
    {
        if(req.user_auth in global.auth_tokens)
        {
            // authentic do nothing
        }
        else
        {
            res.status(404).send("Un-Authorised user");
        }
    }
    else
    {
        res.status(404).send("no auth token");
    }
    if(req.body.id && req.body.coursename)
    {
        var query="select userid from sunbird.course_enrollment where addedby='"+
        req.body.id+"' and coursename='"+req.body.coursename+"' allow filtering";
        client.execute(query,function(err,result){
            var tempresult=result.rows;
            for(var i=0;i<tempresult.length;i++)
            {
                var userid=tempresult[i]['userid']; 
                var query="select gender from sunbird.user where id='"+userid+"'";
                client.execute(query,function(err,result){
                    if(result.rows[0]){
                        updateGlobalVariable(result.rows[0].gender)
                    }
                });
            }
        });
        setTimeout(function(){
            console.log(global.globalVariable);
            res.write(JSON.stringify(global.globalVariable));
            res.end();
        },1000);        
    }
    else
    {
        res.status(404).send('id or coursename claim missing');
    }
});


//getLocationDistCourse RETURNS A JSON OBJECT CONSISTING OF NUMBER OF PEOPLE FROM VARIOUS LOCATION WHO ARE ENROLLED IN A COURSE

app.post('/getLocationDistCourse',function(req,res){
    // response header
    global.globalVariable={};
    res.setHeader('Content-Type','application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    console.log(req.body);
    if(req.user_auth)
    {
        if(req.user_auth in global.auth_tokens)
        {
        }
        else
        {
            res.status(404).send("Un-Authorised user");
        }
    }
    else
    {
        res.status(404).send("no auth token");
    }

    if(req.body.id && req.body.coursename)
    {
        //query to get userid
        var query="select userid from sunbird.course_enrollment where addedby='"+
        req.body.id+"' and coursename='"+req.body.coursename+"' allow filtering";
        //var tempresult;
        client.execute(query,function(err,result){
            var tempresult=result.rows;
            for(var i=0;i<tempresult.length;i++)
            {
                var userid=tempresult[i]['userid']; 
                //console.log(userid);
                var query="select location from sunbird.user where id='"+userid+"'";
                client.execute(query,function(err,result){
                    if(result.rows[0]){
                        updateGlobalVariable(result.rows[0].location);
                    }

                });

            }

        });
        setTimeout(function(){
            console.log(global.globalVariable);
            res.write(JSON.stringify(global.globalVariable));
            res.end();
    },1000);
        //console.log(global.globalVariable);
        
    }
    else
    {
        res.status(404).send('id or coursename claim missing');
    }

});



//getEducationDistCourse RETURNS A JSON OBJECT CONSISTING OF EDUCATION LEVELS OF VARIOUS STUDENTS ARE ENROLLED IN A COURSE

app.post('/getEducationDistCourse',function(req,res){
    // response header
    global.globalVariable={};
    res.setHeader('Content-Type','application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    console.log(req.body);
    if(req.user_auth)
    {
        if(req.user_auth in global.auth_tokens)
        {
        }
        else
        {
            res.status(404).send("Un-Authorised user");
        }
    }
    else
    {
        res.status(404).send("no auth token");
    }

    if(req.body.id && req.body.coursename)
    {
        //query to get userid
        var query="select userid from sunbird.course_enrollment where addedby='"+
        req.body.id+"' and coursename='"+req.body.coursename+"' allow filtering";
        //var tempresult;
        client.execute(query,function(err,result){
            var tempresult=result.rows;
            for(var i=0;i<tempresult.length;i++)
            {
                var userid=tempresult[i]['userid']; 
                //console.log(userid);
                var query="select degree from sunbird.user_education where id='"+userid+"'";
                client.execute(query,function(err,result){
                    if(result.rows[0]){
                        updateGlobalVariable(result.rows[0].degree);
                    }

                });

            }

        });
        setTimeout(function(){
            console.log(global.globalVariable);
            res.write(JSON.stringify(global.globalVariable));
            res.end();
    },1000);
        //console.log(global.globalVariable);
        
    }
    else
    {
        res.status(404).send('id or coursename claim missing');
    }

});
// returns the content consumption pattern for a whole year
//we have not tested this  API MIght need some changes
app.post('/getContentConsumption',function(req,res)
{
    // response header
    global.globalVariable={};
    res.setHeader('Content-Type','application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    console.log(req.body);


    if(req.user_auth)
    {
        if(req.user_auth in global.auth_tokens)
        {
        }
        else
        {
            res.status(404).send("Un-Authorised user");
        }
    }
    else
    {
        res.status(404).send("no auth token");
    }

    if(req.body.id && req.body.contentid)
    {
        //query to get userid
        var query="select completedcount,dateTime from sunbird.content_consumption where contentid='"+
        req.body.id+" allow filtering";
        // dateTime has the timestamp having the number content consumption on that date
        client.execute(query,function(err,result)
        {
            if(err)
            {
                res.status(500).send('Server failed');                
            }
            else{
                convertTimeStamp(res); //converts the dateTime from timestamp format into actual format and updates the global variable
            }
        });
        
        setTimeout(function()
        {
            console.log(global.globalVariable);
            res.write(JSON.stringify(global.globalVariable));
            res.end();
        },
        1000);
    }
    else
    {
        res.status(404).send('id or coursename claim missing');
    }

});

function convertTimeStamp(res)
{
    var today=new Date();
    for(var i=0;i<res.length;i++)
    {
        
        var d=new Date(res[k]['dateTime']);
        var m=today;
        m.setFullYear(today.getFullYear()-1);
        if((d<=today) &&(d>=m))
        {
            var month=d.getMonth();
            var year=d.getYear();
            updateGlobalVariableDate(month+" "+year,res[k].completedCount);
        }
    }
}


function updateGlobalVariableDate(item,ct) //updates the globalVariable object which is used to maintain the counts
{
    //console.log(global.globalVariable);
    if(global.globalVariable[item])
    {
        global.globalVariable[item]=ct;
    }
    else
    {
        global.globalVariable[item]+=ct;
    }
}


//---------------------------------------------------------------------------------------------------------- 
app.get('/user_auth',function(req,res)
{
    fs.readFile("C:/Users/ALAKA PANIGRAHI/Desktop/sunbird/sunbird-portal/src/app/token.txt",function(err,data){
       if(err)
       {
           res.end();
           console.log(err);
       }
       else
       {
            console.log(""+data);
            global.auth_tokens[global.auth_tokens.length]=data;
            res.setHeader('Content-Type','text/html');
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.write(data);
            res.end();
       }

    });
});
//----------------------------------------APP INITIALIZATION-------------------------------------------
connect_to_database();
app.listen(8087);
console.log("app listening to port 8087");
