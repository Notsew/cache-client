
var cache = function(){
	//this.setup()
};

cache.prototype.setup = function(config)
{
	var self = this;
	self.store = config.store;
	self.prefix = config.prefix || "";
	if(self.store =="redis")
	{
		var redis = require("redis");
		var port = config.port || null;
		var host = config.host || null;
		var opts = config.opts || {};
		self.client = redis.createClient(port,host,opts);
		if(config.auth)
		{
			self.client.auth(config.auth);
		}
	}
	else if(self.store == "memcached")
	{
		var memcached = require("memcached");
		self.client = new memcached(config.host, config.opts)
	}
	else if(self.store == "memory")
	{
		var lru = require("lru-cache");
		var opts = config.opts || {};
		self.client = lru(opts);
	}
}

cache.prototype.read = function(key,callback)
{
	var self = this;
	key = self.prefix+key;
	if(self.store =="redis")
	{
		self.client.hgetall(key,function(err,result){
			callback(self.deserialize(result));
		});
	}
	else if(self.store == "memcached")
	{
		self.client.get(key, function(err,result){
			if(result != false)
			{
				callback(result);
			}
			else
			{
				callback(null);
			}
		});
	}
	else if(self.store == "memory")
	{
		if(self.client._cache[key] && self.client._cache[key].expireTime)
		{
			if(self.client._cache[key].expireTime > Date.now())
			{
				var result = self.client.get(key);
				callback(result);
			}
			else
			{
				self.client.del(key);
				callback(null);
			}
			
		}
		else
		{
			var result = self.client.get(key);
			callback(result);
		}
	}
};

cache.prototype.write = function(key,value,ttl)
{
	var self = this;
	var timeToLive = ttl || 0;
	key = self.prefix+key;
	if(self.store == "redis")
	{
		self.client.hmset(key,self.serialize({data:value}));
		if(ttl)
		{
			self.client.expire(key,ttl);
		}
		
	}
	else if(self.store == "memcached")
	{
		self.client.set(key,value, timeToLive, function (err) 
		{
			if(err)
			{
				throw err;
			}
		});
	}
	else if (self.store == "memory")
	{
		self.client.set(key,value);
		if(timeToLive != 0)
		{
			self.client._cache[key].expireTime = Date.now()+timeToLive*1000;
		}
	}
};


cache.prototype.clear = function()
{
	var self = this;
	if(self.store == "redis")
	{
		self.client.flushall();
	}
	else if(self.store == "memcached")
	{
		self.client.flush(function(err){
			if(err)
			{
				throw err;
			}
		});
	}
	else if(self.store == "memory")
	{
		self.client.reset();
	}
};

cache.prototype.remove = function(key)
{
	var self = this;
	key = self.prefix+key;
	if(self.store == "redis")
	{
		self.client.del(key);
	}
	else if(self.store == "memcached")
	{
		self.client.del(key,function(err){
			if(err)
			{
				throw err;
			}
		})
	}
	else if(self.store == "memory")
	{
		self.client.del(key);
	}
};


cache.prototype.serialize = function(data)
{
	var result = {};
	for (var k in data) {
		result[k] = JSON.stringify(data[k]);
	}
	return result;
};

cache.prototype.deserialize = function(data) {
	var result = {};
	for (var k in data) {
	 	result[k] = JSON.parse(data[k]);
	}
	return result.data;
};


module.exports = new cache;