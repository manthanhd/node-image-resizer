var express = require('express');
var router = express.Router();
var hat = require('hat');
var fs = require('fs');

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var easyimg = require('easyimage');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/', upload.single('imageFile'), function(req, res) {
	console.log(req.file);
	req.session.file = req.file;
	res.redirect('/result');
	// return fs.readFile(req.files.imageFile.path, function (err, data) {
	// 	var newFileName = hat() + ".jpg";
	// 	var newPath = __dirname + "/uploads/" + newFileName;
	// 	return fs.writeFile(newPath, data, function (err) {
	// 		req.session.filepath = newPath;
	// 		return res.redirect("/result");
	// 	});
	// });
});
var widths = [240, 360, 480, 720, 800, 1080];

var generateImages = function(sourcePath) {
	
	for(var i = 0; i < widths.length; i++) {
		var width = widths[i];
		var destination = sourcePath + "_" + width;

		easyimg.rescrop({
		     src: sourcePath, dst: destination,
		     width: width,
		  }).then(
		  function(image) {
		     console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
		  },
		  function (err) {
		    console.log(err);
		  }
		);
	}
}

router.get('/result', function(req, res) {
	var file = req.session.file;
	if(!file) {
		return res.redirect('/');
	}

	var sourcePath = appRoot + '/uploads/' + file.filename;
	generateImages(sourcePath);
	
	var model = {sourceUrl: "/getImg/" + file.filename};
	model.urls = [];
	for(var i = 0; i < widths.length; i++) {
		var width = widths[i];

		var url = model.sourceUrl + "_" + width;
		model.urls.push(url);
	}
	return res.render('results', model);
});

router.get('/getImg/:filename', function(req, res) {
	var path = appRoot + '/uploads/' + req.params.filename;
	console.log(path);
	return res.sendFile(path);
});

module.exports = router;
