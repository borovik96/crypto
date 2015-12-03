// Extensions to JavaScript objects.

array = {}

array.rol = function(a, n)
{
	return a.slice(n, a.length).concat(a.slice(0, n))
}

array.ror = function(a, n)
{
	return array.rol(a, a.length - n)
}

Function.prototype.cached = function()
{
	var old = this
	var cache = {}
	
	return function(x)
	{
		if (cache[x] !== undefined)
			return cache[x]
			
		cache[x] = old(x)
		return cache[x]
	}
}

Function.prototype.map = function(list)
{
	var res = {}
	
	for (var i in list)
		res[i] = this(list[i])
		
	return res
}

String.prototype.bytes = function(mode)
{
	var res = []
	
	for (var i = 0; i < this.length; i++)
	{
		var c = this.charCodeAt(i)
		var b0 = c % 256
		var b1 = (c - b0) / 256
		
		if (mode == 'ascii')
			res.push(b0)
		else
			res.push(b0, b1)
	}
	
	return res
}

String.prototype.frombytes = function(bytes)
{
	var res = ''
	
	for (var i in bytes)
		res += String.fromCharCode(bytes[i])
		
	return res
}