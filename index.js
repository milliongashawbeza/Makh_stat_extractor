const express = require('express')
var bodyParser = require('body-parser')
const expressip = require('express-ip');
const app = express();
const cheerio = require("cheerio");
const request = require('request');
var proxy = require('express-http-proxy');
const fs = require('fs');
const xl = require('excel4node');
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
//Pupeteer  

function selectProxyHost() {
  return (new Date() % 2) ? '34.174.149.225:8585' : '159.203.61.169:8080';
}
let ip_addresses = [];
let port_numbers = [];
const { createProxyMiddleware } = require('http-proxy-middleware');
var proxy = 'http://190.110.35.222:999';
request("https://sslproxies.org/", function (error, response, html) {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);

    $("td:nth-child(1)").each(function (index, value) {
      ip_addresses[index] = $(this).text();
    });

    $("td:nth-child(2)").each(function (index, value) {
      port_numbers[index] = $(this).text();
    });
  } else {
    console.log("Error loading proxy, please try again");
  }

  ip_addresses.join(", ");
  port_numbers.join(", ");

  //console.log("IP Addresses:", ip_addresses);
  //console.log("Port Numbers:", port_numbers); 
  let random_number = Math.floor(Math.random() * 100);
  //console.log(ip_addresses[random_number]);
  //console.log(port_numbers[random_number]); 
  proxy = `http://${ip_addresses[random_number]}:${port_numbers[random_number]}`;
  // console.log(proxy); 
  j = proxy
  return proxy;


});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(expressip().getIpInfoMiddleware);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // need the website to include cookies in the requests sent

  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
//Get Ad information whether it's for sale or rent 


const PORT = process.env.PORT || 5001
app.get('/', (req, res) => {
  res.send("Connected successfully.")
})
app.get('/download/:file_name', (req, res) => {
  var file_name = req.params.file_name; 
  var f = file_name + '.xlsx' 
  console.log("Downloading "+file_name);
  fs.stat(f, function (err, stat) {
    if (err == null) {
      res.download(f)

    } else if (err.code === 'ENOENT') {
      // file does not exist
     // console.log("err")
      res.send(err)
    } else {
      res.send('Some other error: '+err.code);
    }
  });
 // fs.unlink(f)
})
app.post('/export/:file_name', (req, res) => {
  var file_name = req.params.file_name;
  var f = file_name + '.json'
  fs.stat(f, function (err, stat) {
    if (err == null) {
      file_update(file_name);
    } else if (err.code === 'ENOENT') {
      // file does not exist
      newFile(file_name);
    } else {
      console.log('Some other error: ', err.code);
    }
  });
  function file_update(file_name) { 
    try{
      console.log("***************** UPDATING *******************")
      var f = file_name;
      file_name = file_name+'.json';
      console.log("File Update "+file_name);
      var s = JSON.stringify(req.body) 
      var newParse = JSON.parse(s);
      console.log(s);

      var scrape_result = fs.readFileSync(file_name);
      var myObject = JSON.parse(scrape_result);
      
     // myObject.push(JSON.parse(s))
      var newData = JSON.stringify(myObject.concat(newParse));
      fs.writeFileSync(file_name, newData) 
      console.log("Aircraft url saved * Update ");
      var f7 = fs.readFileSync(file_name);
      var newP = JSON.parse(f7);
      exportFilterToExcel(newP,f);
      const file = `${__dirname}/filtered_urls.xlsx`;
      console.log(file)
      res.send("file updated , sucessfully!!")
    }catch(e){
      console.log("***"+e)
    }
   
  }
  function newFile(file_name) { 
    try{ 
      console.log("***************** NEW FILE *******************")
      var f = file_name;
      file_name = file_name+'.json';
      var s = JSON.stringify(req.body)
      console.log(s);
      var a = [];  // your JSON
      var x = JSON.stringify(a);
  
      fs.writeFileSync(file_name, x, 'utf8');
      var scrape_result = fs.readFileSync(file_name);
      var myObject = JSON.parse(scrape_result);
      myObject.push(JSON.parse(s))
      var newData = JSON.stringify(myObject[0]);
      fs.writeFileSync(file_name, newData) 
      exportFilterToExcel(myObject[0], f);
      const file = `${__dirname}/filtered_urls.xlsx`;
      console.log(file)
      res.send("new file created , done!")
    }catch(e){
      console.log("*** ####"+e)
    }
   
  }
  //  console.log("")


})
// Scrape Aircraft information & UPDATE Air-craft Information 



function exportFilterToExcel(myObject, file_name) {
  try {
    var jsonArray = [];
    var f = file_name + '.xlsx'
    console.log('Exporting to Excele check ' + f)
    //var rawFile = fs.readFileSync("filter_result.json")
    //var json = JSON.parse(rawFile)

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Worksheet Name');
    const headingColumnNames = [
      "graph_name",
      "date",
      "value",
      "by",
      "change"

    ]
    let headingColumnIndex = 1;
    headingColumnNames.forEach(heading => {
      ws.cell(1, headingColumnIndex++)
        .string(heading)
    });
    let rowIndex = 2;
    myObject.forEach(record => {
      let columnIndex = 1;
      Object.keys(record).forEach(columnName => {
        ws.cell(rowIndex, columnIndex++)
          .string(record[columnName])
      });
      rowIndex++;
    });
    wb.write(f, function (re) {
      console.log("sucessfully exported!")
    });

  } catch (err) {
    console.log("er"+err)
  }
}



app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup")
  console.log("Server listening on Port", PORT);
})

