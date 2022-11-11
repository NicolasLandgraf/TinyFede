const express = require('express')
const router = express.Router()

// Defino mi apikey en mi archivo .env en el root
require('dotenv').config()

const tinify = require("tinify");

const apikey = process.env.NL_TINYPNG_APIKEY
tinify.key = apikey;

router.get("/", (req, res) => {
  res.send('get optim')
})

router.post("/rename", (req, res) => {

  const path = require('path');
  const fs = require('fs');
  //joining path of directory 
  
  const directoryPath = path.join(__dirname, '../images');

  if (!fs.existsSync(directoryPath)){
    fs.mkdirSync(directoryPath);
  }

  //passsing directoryPath and callback function
  fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 

      //listing all files using forEach
      files.forEach(function (file) {

          let newName = file.replace(/[&\/\\#,+()$~%_'":*?<>{}\s+]/g,'-').toLowerCase();

          if ( newName.charAt( 0 ) == '-' ) {
            newName = newName.substring(1);
          }
          
          if ( newName.includes("-.")) {
            newName = newName.replace('-.','.');
          }

          if ( newName.includes("--")) {
            newName = newName.replace('--','-');
          }

          if ( newName.includes("--")) {
            newName = newName.replace('--','-');
          }

          if ( newName.includes(".-")) {
            newName = newName.replace('.-','-');
          }

          if ( newName.includes("..")) {
            newName = newName.replace('..','.');
          }

          // Quito tildes
          newName = newName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          fs.rename(directoryPath+'/'+file, directoryPath+'/'+newName, () => {});
      });

      res.json({
        done: 'its done',
      });
  })

})

router.get("/compress", (req, res) => {

  //requiring path and fs modules
  const path = require('path');
  const fs = require('fs');
  //joining path of directory 
  const directoryPath = path.join(__dirname, '../images');

  if (!fs.existsSync(directoryPath)){
    fs.mkdirSync(directoryPath);
  }

  const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
  var files = dirents
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

  const cantidad = files.length

  res.render("compress", { fileList: files, apikey: apikey, cantidad: cantidad })
})

router.post("/results", (req, res) => {

  ans = Array.isArray(req.body.file);
  if (ans) {
    var files = req.body.file;
    var cantidad = req.body.file.length
  } else {
    var files = [req.body.file];
    var cantidad = 1
  }

  res.render('results', { fileList: files, ancho: req.body.ancho, cantidad: cantidad})
})

router.post("/action", (req, res) => {

  const fs = require("fs")
  var stats = fs.statSync('./images/'+req.body.image)
  var antes = formatBytes(stats.size)

  var width = 1920;
  if (req.body.ancho !== 'empty') {
    width = req.body.ancho;
  }

  const source = tinify.fromFile('./images/'+req.body.image);
  var resized = source.resize({
      method: "scale",
      width: parseInt(width),
  });

  resized.result().size(function(err, size) {

    if (!fs.existsSync('./images-optimized/')){
      fs.mkdirSync('./images-optimized/');
    }

    resized.toFile('./images-optimized/'+req.body.image);
    var result = formatBytes(size)

    var proximo = parseInt(req.body.id) + 1;

    res.json({
      antes: antes,
      size: result,
      id: req.body.id,
      proximo: proximo,
    });
  });
  
})


function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}



module.exports = router