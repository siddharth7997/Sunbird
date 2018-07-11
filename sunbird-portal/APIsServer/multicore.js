//This is a multiple core based API runnning on MYSQL
var express=require('express')
var app=express()
var bodyParser = require('body-parser');
var sql=require('mysql');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var fs=require('fs');

var con = sql.createConnection({
    host: "localhost",
    user: "root",
    password:"",
    database: "iitb"
});

// utilities
function connect_to_database()
{
    con.connect(function(error){
        if(error)
        {
            throw error;
        }
        else
        {
            console.log("connection to db successful \n");
        }
    });
}
function end_connection()
{
    con.end();
}



const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    console.log(numCPUs);
    connect_to_database()

  
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => 
    {
      console.log(`worker ${worker.process.pid} died`);
    });
  } 
  else 
  {
            app.post('/fetch',function(req,res)
            {
                console.log(`worker ${process.pid} `);
                console.log(req.body.query);
            
                res.setHeader('Content-Type','application/json');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                con.query(req.body.query,
                    function(error,result,fields)
                    {
                        if(error) 
                        {
                            res.end();
                            //throw error;
                        }
                        else
                        {
                            console.log(result);
                            res.write(JSON.stringify(result));
                            res.end();
                        }
                });
            });
                        
            // gets a list of courses under a given organization
            
            app.post('/getCourses',function(req,res)
            {
                console.log(`worker ${process.pid} `);
                console.log(req.body.id);
            
                res.setHeader('Content-Type','application/json');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                var query="select courseName FROM courses where createdBy='"+req.body.id+"'";
            
            
            
                con.query(query,
                    function(error,result,fields)
                    {
                        if(error) 
                        {
                            res.end();
                            //throw error;
                        }
                        else
                        {
                            console.log(result);
                            res.write(JSON.stringify(result));
                            res.end();
                        }
                });
            });
            
            
            
            // gender distribution
            
            
            app.post('/getCourseGenderDistribution',function(req,res)
            {
                console.log(req.body.ip_course);
            
                res.setHeader('Content-Type','application/json');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                var query="select gender,count(*) as ct FROM (course_enrollment NATURAL join users NATURAL join courses) where courseName='"+req.body.ip_course+"' GROUP by gender"
            
                con.query(query,
                    function(error,result,fields)
                    {
                        if(error) 
                        {
                            res.end();
                            //throw error;
                        }
                        else
                        {
                            console.log(result);
                            res.write(JSON.stringify(result));
                            res.end();
                        }
                });
            });
            
            
            // area levels
            
            
            app.post('/getCourseAreaDistribution',function(req,res)
            {
                console.log(req.body.ip_course);
            
                res.setHeader('Content-Type','application/json');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                var query="select location,count(*) as ct FROM (course_enrollment NATURAL join users NATURAL join courses) where courseName='"+req.body.ip_course+"' GROUP by location"
            
                con.query(query,
                    function(error,result,fields)
                    {
                        if(error) 
                        {
                            res.end();
                            //throw error;
                        }
                        else
                        {
                            console.log(result);
                            res.write(JSON.stringify(result));
                            res.end();
                        }
                });
            });
            
            // education levels
            
            app.post('/getCourseEducationDistribution',function(req,res)
            {
                console.log(req.body.ip_course);
            
                res.setHeader('Content-Type','application/json');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                var query="select education,count(*) as ct FROM (course_enrollment NATURAL join users NATURAL join courses) where courseName='"+req.body.ip_course+"' GROUP by education"
            
                con.query(query,
                    function(error,result,fields)
                    {
                        if(error) 
                        {
                            res.end();
                            //throw error;
                        }
                        else
                        {
                            console.log(result);
                            res.write(JSON.stringify(result));
                            res.end();
                        }
                });
            });
            
            
            
            
            
            // content consumption
            app.post('/getContentConsumption',function(req,res)
            {
                console.log(req.body.contentid);
            
                res.setHeader('Content-Type','application/json');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                var query="SELECT Month(ts) as m,Year(ts) as y,COUNT(*) as ct FROM content_consumption WHERE contentId='"+req.body.contentid+"' GROUP BY Year(ts),Month(ts)";
            
                con.query(query,
                    function(error,result,fields)
                    {
                        if(error) 
                        {
                            res.end();
                            //throw error;
                        }
                        else
                        {
                            console.log(result);
                            res.write(JSON.stringify(result));
                            res.end();
                        }
                });
            });
            
            // 
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
                        res.setHeader('Content-Type','text/html');
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                        res.write(data);
                        res.end();
                }
            
                });
            });
            app.listen(8080);
}




