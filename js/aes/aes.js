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