// GF(2^8)

gf = {}

gf.xtime = function(b)
{
	var highbit = b & 0x80
	var shl = (b << 1) & 0xff
	return highbit == 0 ? shl : shl ^ 0x1b	
}

gf.mul = function(b1, b2)
{
	var t = [b1]
	var r = 0
	
	for (var i = 1; i < 8; i++)
		t[i] = gf.xtime(t[i - 1])
	
	for (var i = 0; i < 8; i++)	
		if (b2 & (1 << i))
			r ^= t[i]	
	
	return r
}

gf.inv = function(b)
{
	for (var i = 0; i < 256; i++)
		if (gf.mul(i, b) == 1)
			return i	
}