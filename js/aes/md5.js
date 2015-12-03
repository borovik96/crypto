// MD5 algorithm. RFC 1321.

md5 = {}

md5.paddedlen = function(len)
{			
	var padded = ((len + 63) >>> 6) * 64
	
	if (padded - len < 9)
		padded += 64		
		
	return padded
}

md5.byteat = function(str, index)
{
	var len = str.length
	
	if (index < len)
		return str[index]
		
	if (index == len)
		return 0x80
		
	var n = md5.paddedlen(len)				
		
	if (index < n - 8)
		return 0		
		
	var i = index
	var b = 0
	var m = len		
				
	while (i > n - 8)
	{
		i--
		b = m & 0xff
		m >>>= 8			
	}
	
	m = (m << 3) | (b >>> 5)
	return m & 0xff
}		

md5.hash = function(str)
{		
	var F = function(x, y, z) { return x & y | ~x & z }
	var G = function(x, y, z) { return x & z | y & ~z }
	var H = function(x, y, z) { return x ^ y ^ z }
	var I = function(x, y, z) { return y ^ (x | ~z) }
			
	var S = function(i) { return md5.byteat(str, i) }
	var M = function(i) { return bits.concat(S(i * 4), S(i * 4 + 1), S(i * 4 + 2), S(i * 4 + 3)) }
	
	var X = []
	var T = []
	
	for (var i = 1; i <= 256; i++)
		T[i] = Math.floor(0x100000000 * Math.abs(Math.sin(i)))
	
	var W = 
	[
		bits.concat(0x01, 0x23, 0x45, 0x67),
		bits.concat(0x89, 0xab, 0xcd, 0xef), 
		bits.concat(0xfe, 0xdc, 0xba, 0x98),
		bits.concat(0x76, 0x54, 0x32, 0x10),
	]
	
	// Vector [A, B, C, D, k, s, i] corresponds to [ABCD k s i] operation.
	
	var rounds =
	[		
		// Round F.
	
		[
			[ 0,  7],
			[ 1, 12],
			[ 2, 17],
			[ 3, 22],
			[ 4,  7],
			[ 5, 12],
			[ 6, 17],
			[ 7, 22],
			[ 8,  7],
			[ 9, 12],
			[10, 17],
			[11, 22],
			[12,  7],
			[13, 12],
			[14, 17],
			[15, 22],
		],
		
		// Round G.


		[
			[ 1,  5],
			[ 6,  9],
			[11, 14],
			[ 0, 20],
			[ 5,  5],
			[10,  9],
			[15, 14],
			[ 4, 20],
			[ 9,  5],
			[14,  9],
			[ 3, 14],
			[ 8, 20],
			[13,  5],
			[ 2,  9],
			[ 7, 14],
			[12, 20],
		],
		
		// Round H.

		[
			[ 5,  4],
			[ 8, 11],
			[11, 16],
			[14, 23],
			[ 1,  4],
			[ 4, 11],
			[ 7, 16],
			[10, 23],
			[13,  4],
			[ 0, 11],
			[ 3, 16],
			[ 6, 23],
			[ 9,  4],
			[12, 11],
			[15, 16],
			[ 2, 23],
		],
		
		// Round I.

		[
			[ 0,  6],
			[ 7, 10],
			[14, 15],
			[ 5, 21],
			[12,  6],
			[ 3, 10],
			[10, 15],
			[ 1, 21],
			[ 8,  6],
			[15, 10],
			[ 6, 15],
			[13, 21],
			[ 4,  6],
			[11, 10],
			[ 2, 15],
			[ 9, 21],
		],
	]			
			
	for (var i = 0; i < (md5.paddedlen(str.length) >> 6); i++)
	{			
		for (var j = 0; j < 16; j++)
			X[j] = M(i * 16 + j)
			
		var Q = [W[0], W[1], W[2], W[3]]			
		
		for (var ri = 0; ri < 4; ri++)		
		for (var ti = 0; ti < 16; ti++)
		{
			var f = [F, G, H, I][ri]
			var t = rounds[ri][ti]					
			
			var a = W[(0 - ti) & 3]
			var b = W[(1 - ti) & 3]
			var c = W[(2 - ti) & 3]
			var d = W[(3 - ti) & 3]
			
			var k = t[0]
			var s = t[1]
			var m = ri * 16 + ti + 1
			
			a = b + bits.rol(a + X[k] + T[m] + f(b, c, d), s)
			
			W[(0 - ti) & 3] = a					
		}		
		
		W = [W[0] + Q[0], W[1] + Q[1], W[2] + Q[2], W[3] + Q[3]]			
	}				
	
	var $ = function(i)
	{
		return bits.split(W[i], 4)
	}
		
	return [].concat($(0), $(1), $(2), $(3))
}	

md5.selftest = function()
{
	var pairs = [
		['', 'd41d8cd98f00b204e9800998ecf8427e'],
		['a', '0cc175b9c0f1b6a831c399e269772661'],
		['abc', '900150983cd24fb0d6963f7d28e17f72'],
		['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
		['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
		['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'd174ab98d277d9f5a5611c2c9f419d9f']]		
	
	for (var i in pairs)
	{
		var message = pairs[i][0]
		var digest = pairs[i][1]
		var hash = md5.hash(message.bytes('ascii'))			
		
		if (bits.hex(hash, 1, '') != digest)			
			return false			
	}
	
	return true
}