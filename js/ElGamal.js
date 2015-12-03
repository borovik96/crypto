var elGamal = {};

function isSimple (p) {
	var max = Math.floor(Math.sqrt(p));
	for (var i = 2; i <= max; i++) {
		if (p % i == 0) {
			return false;
		};
	};
	return true;
}

function getSimple (n) {
	for (var i = 1; ; i++) {
		if (isSimple(n - i)) {
			return n - i;
		};
		if (isSimple(n + i)) {
			return n + i;
		};
	};
}

function getNumberFromString (s) {
	var res = 1;
	for(var i = 0; i < s.length; ++i)
		res += s.charCodeAt(i);
	return res;
}
function rand(min, max) {
	return Math.floor(Math.random()*(max - min +1) + min);
}
function mul (a, b, n) {
	var sum = 0;
	for (var i = 0; i < b; i++) {
		sum += a;
		if (sum >= n) {
			sum -= n;
		};
	};
	return sum;
}

function power (a, b, n) {
	var tmp = a, sum = a;
	for (var i = 1; i < b; i++) {
		for (var j = 1; j < a; j++) {
			sum += tmp;
			if (sum >= n) {
				sum -= n;
			};
		};
		tmp = sum;
	};
	return tmp;
}

function generator (p) {
	var fact = [], phi = p-1, n = Math.ceil(Math.pow(phi, 0.5));
	for (var i = 2; i <= n; i++) {
		if (n % i == 0) {
			fact.push(i);
			while (n % i == 0)
				n /= i;
		}
	};
	if (n > 1)fact.push(n);
	for (var res = 2; res <= p; ++res) {
		var ok = true;
		for (var i = 0; i < fact.length && ok; ++i){
					ok &= power(res, phi / fact[i], p) != 1;
				}
		if (ok) return res;
	}
	return -1;
}

elGamal.crypt = function (p, x, text) {
	var g = generator(p), y = power(g, x, p), result = "";
	for (var i = 0; i < text.length; ++i){
		var m = text.charCodeAt(i);
		if (m > 0) {
			var k = rand(1, p-1),
			a = power(g, k, p),
			b = mul(power(y, k, p), m, p);
			result += String.fromCharCode(a) + String.fromCharCode(b);
		}
	}
	return result;
}
elGamal.decrypt = function (p, x, text) {
	var result = "", dem;
	for (var i = 0; i < text.length - 1; i += 2){
		var a = text.charCodeAt(i),
				b = text.charCodeAt(i+1);
		if (a != 0 && b != 0) {
			dem = mul(b, power(a, p - 1 - x, p), p);// m=b*(a^x)^(-1)mod p =b*a^(p-1-x)mod p
			var m = String.fromCharCode(dem);
			result += m;
		}
	}
	return result;
}