// Bitwise operations.

bits = 
{
	concat: function(b0, b1, b2, b3)
	{
		return ((b3 & 0xff) << 24) | ((b2 & 0xff) << 16) | ((b1 & 0xff) << 8) | (b0 & 0xff)
	},
	
	split: function(int, bytes)
	{
		var res = []
		
		for (var i = 0; i < bytes; i++)
		{
			res.push(int & 0xff)
			int >>>= 8
		}
		
		return res
	},
	
	merge: function(bytes)
	{
		var res = 0
		
		for (var i = bytes.length - 1; i >= 0; i--)		
			res = (res << 8) | bytes[i]		
			
		return res
	},
	
	// Rotates to the left a 32-bit integer.
	
	rol: function(value, shift)
	{		
		var high = value >>> (32 - shift)
		return (value << shift) | high
	},
	
	// Converts an integer to hex digits.	
	
	hex: function(value, bytes, delim)
	{
		bytes = bytes || 4		
		
		if (delim === undefined)
			delim = ' '
		
		if (typeof value == 'object')
		{		
			var r = []
			
			for (var i in value)
				r.push(bits.hex(value[i], bytes))
				
			return r.join(delim)
		}
		
		var s = ''
		
		while (bytes > 0)
		{
			bytes--
			
			var h0 = value & 0x0f
			var h1 = (value & 0xf0) >>> 4
			
			s += bits.hexdigits.charAt(h1) + bits.hexdigits.charAt(h0)
			value >>>= 8
		}
		
		return s
	},
	
	hexdigits: '0123456789abcdef',	
	
	revert: function(value, bytes)
	{					
		bytes = bytes || 4
		var r = 0
		
		for (var i = 0; i < bytes; i++)
		{
			r <<= 8
			r |= value & 0xff			
			value >>= 8
		}
		
		return r
	},	
	
	xorbits: function(int, n)
	{
		n = n || 8
		var res = 0
		
		for(var i = 0; i < n; i++)
		{
			res ^= int & 1
			int >>>= 1
		}
		
		return res
	},	
}