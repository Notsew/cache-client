var cache = require("../../../lib/cache");
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.get = function(req, res){
	cache.read("key",function(result){
		res.render('index', { title: result });
	});
};

exports.set = function(req, res){
  cache.write("key","value");
  res.render('index', { title: 'Express' });
};

exports.remove = function(req, res){
  cache.remove("key");
  res.render('index', { title: 'Express' });
};

exports.clear = function(req, res){
  cache.clear();
  res.render('index', { title: 'Express' });
};