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
// MD5

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
// AES algorithm. FIPS 197.

aes = {}

aes.nk = 4		// the number of 4-byte words in a key
aes.nb = 4		// the number of columns in the state
aes.nr = 10		// the number of rounds

aes.select = function(bits)
{
	if (bits == 128)
	{
		aes.nk = 4
		aes.nb = 4
		aes.nr = 10
	}

	if (bits == 192)
	{
		aes.nk = 6
		aes.nb = 4
		aes.nr = 12
	}

	if (bits == 256)
	{
		aes.nk = 8
		aes.nb = 4
		aes.nr = 14
	}
}

/*	Encrypts an arbitrary string of bytes with an arbitrary password.
	Returns a string with encrypted data. This algorithm uses
	AES 128 because MD5 returns 128-bit hashes.

	data		array of bytes
	password	array of bytes */

aes.encrypt = function(data, password)
{
	aes.select(128)

	var hash = md5.hash(password)
	var w = aes.keyexpansion(hash)
	var length = bits.split(data.length, 16)
	var result = aes.cipher(length, w)

	for (var i = 0; i < data.length; i += 16)
	{
		var input = data.slice(i, i + 16)
		while (input.length < 16)
			input.push(0)

		result = result.concat(aes.cipher(input, w))
	}

	return result
}

aes.decrypt = function(data, password)
{
	aes.select(128)

	var hash = md5.hash(password)
	var w = aes.keyexpansion(hash)
	var length = aes.invcipher(data.slice(0, 16), w)
	var result = []

	for (var i = 16; i < data.length; i += 16)
		result = result.concat(aes.invcipher(data.slice(i, i + 16), w))

	length = bits.merge(length)

	if (length >= 0 && length <= result.length)
		result.length = length

	return result
}

/*	Returns an element from the S-Box table.
	The argument must be in range 0..255. */

aes.sbox = function(b)
{
	var m = 0xf8
	var r = 0
	var q = gf.inv(b) || 0

	for (var i = 0; i < 8; i++)
	{
		r = (r << 1) | bits.xorbits(q & m)
		m = (m >> 1) | ((m & 1) << 7)
	}

	return r ^ 0x63
}

aes.invsbox = function(b)
{
	for (var i = 0; i < 256; i++)
		if (aes.sbox(i) == b)
			return i
}

/*	Mixes columns of s using a vector toprow
	with 4 bytes. AES uses two values of toprow:

	[02, 03, 01, 01]	for encrypting
	[0e, 0b, 0d, 09]	for decrypting */

aes.mixcolumns = function(s, toprow)
{
	for (var c = 0; c < aes.nb; c++)
	{
		var col = []

		for (var r = 0; r < 4; r++)
			col[r] = s[r][c]

		var k = toprow

		for (var r = 0; r < 4; r++)
		{
			s[r][c] = aes.scalarmul(k, col)
			k = array.ror(k, 1)
		}
	}
}

/*	aes.cipher transforms an 16-byte input to an 16-byte output.

	input	array[16] of byte
	w		array[4, aes.nb] of byte (got from aes.keyexpansion)
	output	array[16] of byte */

aes.cipher = function(input, w)
{
	var s = aes.input2state(input)

	aes.addroundkey(s, w.slice(0, aes.nb))

	for (var i = 1; i <= aes.nr - 1; i++)
	{
		aes.apply(aes.sbox, s)
		aes.shiftrows(s)
		aes.mixcolumns(s, [0x02, 003, 0x01, 0x01])
		aes.addroundkey(s, w.slice(aes.nb * i, aes.nb * (i + 1)))
	}

	aes.apply(aes.sbox, s)
	aes.shiftrows(s)
	aes.addroundkey(s, w.slice(aes.nb * aes.nr, aes.nb * (aes.nr + 1)))

	return aes.state2output(s)
}

aes.invcipher = function(input, w)
{
	var s = aes.input2state(input)

	aes.addroundkey(s, w.slice(aes.nb * aes.nr, aes.nb * (aes.nr + 1)))

	for (var i = aes.nr - 1; i >= 1; i--)
	{
		aes.invshiftrows(s)
		aes.apply(aes.invsbox, s)
		aes.addroundkey(s, w.slice(aes.nb * i, aes.nb * (i + 1)))
		aes.mixcolumns(s, [0x0e, 0x0b, 0x0d, 0x09])
	}

	aes.invshiftrows(s)
	aes.apply(aes.invsbox, s)
	aes.addroundkey(s, w.slice(0, aes.nb))

	return aes.state2output(s)
}

/*	Transforms a key to a "key-schedule".
	This key-schedule is passed to aes.cipher and aes.invcipher.

	key		array [aes.nk * 4] of byte
	w		array [4, aes.nb * (aes.nr + 1)] of byte */

aes.keyexpansion = function(key)
{
	var w = []

	for (var i = 0; i < aes.nk; i++)
		w[i] = key.slice(4 * i, 4 * i + 4)

	for (var i = aes.nk; i < aes.nb * (aes.nr + 1); i++)
	{
		var t = w[i - 1]

		if (i % aes.nk == 0)
			t = aes.xor(aes.sbox.map(array.rol(t, 1)), aes.rcon(i / aes.nk))

		if (i % aes.nk == 4 && aes.nk > 6)
			t = aes.sbox.map(t)

		w[i] = aes.xor(w[i - aes.nk], t)
	}

	return w
}

aes.apply = function(f, s)
{
	for (var c = 0; c < aes.nb; c++)
	for (var r = 0; r < 4; r++)
		s[r][c] = f(s[r][c])
}

aes.shiftrows = function(s)
{
	for (var r = 0; r < 4; r++)
		s[r] = array.rol(s[r], r)
}

aes.invshiftrows = function(s)
{
	for (var r = 0; r < 4; r++)
		s[r] = array.ror(s[r], r)
}

aes.addroundkey = function(s, w)
{
	for (var c = 0; c < aes.nb; c++)
	for (var r = 0; r < 4; r++)
		s[r][c] = s[r][c] ^ w[c][r]
}

aes.xor = function(v1, v2)
{
	var r = []

	for (var i = 0; i < 4; i++)
		r[i] = v1[i] ^ v2[i]

	return r
}

aes.scalarmul = function(v1, v2)
{
	var sum = 0

	for (var i in v1)
		sum ^= gf.mul(v1[i], v2[i])

	return sum
}

aes.rcon = function(i)
{
	var r = 1

	for (var j = 1; j < i; j++)
		r = gf.xtime(r)

	return [r, 0, 0, 0]
}

aes.input2state = function(input)
{
	var s = [[], [], [], []]
	var i = 0

	for (var c = 0; c < aes.nb; c++)
	for (var r = 0; r < 4; r++)
	{
		s[r][c] = input[i]
		i++
	}

	return s
}

aes.state2output = function(s)
{
	var output = []
	var i = 0

	for (var c = 0; c < aes.nb; c++)
	for (var r = 0; r < 4; r++)
	{
		output[i] = s[r][c]
		i++
	}

	return output
}
function tohexarray(str){
	var s = '0123456789abcdef'
	var ht = {}
	for (var i = 0; i < 16; i++)
		ht[s[i]] = i
	var a = str.split(' ')
	for (var i in a)
		a[i] = 16 * ht[a[i][0]] + ht[a[i][1]]
	return a
}

aes.sbox = aes.sbox.cached()
aes.rcon = aes.rcon.cached()
aes.invsbox = aes.invsbox.cached()