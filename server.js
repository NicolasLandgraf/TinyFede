const express = require('express')
const app = express()

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}))

app.set("view engine", "ejs")

app.get("/", (req, res) => {

  //requiring path and fs modules
  const path = require('path');
  const fs = require('fs');
  //joining path of directory 
  
  const directoryPath = path.join(__dirname, '/images');

  if (!fs.existsSync(directoryPath)){
    fs.mkdirSync(directoryPath);
  }

  const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });

  const files = dirents
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

  res.render("index", { fileList: files })

})

const optimizerRouter = require('./routes/optimizer')
app.use('/optimizer', optimizerRouter)


app.listen(3000, () => { console.log('server started on port 3000')})
