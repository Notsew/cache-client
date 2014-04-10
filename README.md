# cache-client
This is a caching api that allows you to connect to redis, memcached, or lru-cache.  This utilizes the npm modules lru-cache, redis, or memcached.  So you must have one of those installed locally or globally.

I started this project so that I could have an easy way to interact with each cache mechanism, using a single api.  This made it easy to use between multiple environments and multiple projects.
Now Supports all three cache stores.
Added TTL support for Redis and Memcached, and LRU-cache.

The TTL for LRU is a bit experimental, I haven't tested it yet with the other lru-cache options.

Added in prefix support:  config.prefix = "your_prefix_here"; will prefix all keys no matter the store.

## Initialization
```javascript
config = {store: "redis", port:6379, host:"127.0.0.1", opts:{}, auth:"password"};
config = {store: "memory", opts:{}};
config = {store: "memcached", host:"localhost:11211", opts:{}};
var cacheClient = require("cache-client");
cacheClient.setup(config);

```

## Usage
Normal Methods
```javascript
cacheClient.read("foo", function(result)
{
	//do something here
});

cacheClient.write("foo", "bar");
```
Advanced Methods
You have access to the underlying modules(redis,memcached, lru) by calling cacheClient.client.method();
```javascript
cacheClient.client.keys();
cacheClient.client.values();

cacheClient.client.some_redis_method();
cacheClient.client.some_memcached_method();
```


## API

* ` write(key,value,ttl) if ttl is not provided, then it will default to 0, which will cache the item until it is cleared.`

* ` read(key, callback(result))`

* ` remove(key)`

* ` clear() -> must be careful with this, this will flush the entire cache, so if you are using the same store for both sessions and cache or multiple apps use the same store, this will clear everything.`