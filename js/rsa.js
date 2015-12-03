function sundaram (n) {
	var a = [], i, j, k;
	for(i = 1; 3 * i + 1 < n; ++i){
		for (j = 1; (k = i + j + 2 * i*j) < n && j <= i; j++){
			a[k] = 1;
		}
	}
	for (i = n - 1; i >= 1; i--){
		if (a[i] === undefined){
			return (2 * i + 1);
		}
	}
}

function gcd(a, b){
	var c;
	while (b){
		c = a % b;
		a = b;
		b = c;
	}
	return Math.abs(a);
}
var rsa = {};

rsa.init = function () {
	this.B_Default = 301;
	var p = rand(0, 100), q = rand(0, 100);
	var p_simple = sundaram(p),
			q_simple = sundaram(q);
	var n = p_simple*q_simple;
	var d, d_simple = 0;
	while (d_simple != 1){
		d = rand(0, 100);
		d_simple = gcd(d, ((p_simple - 1)*(q_simple - 1)));
	}
	var e = 0, e_simple = 0;
	while (e_simple != 1){
		e += 1;
		e_simple = (e*d) % ((p_simple - 1)*(q_simple - 1));
	}
	return {
		e : e,
		d : d,
		n : n
	}
}

rsa.crypt = function (e, n, text) {
	this.b = this.B_Default;
	var c, i, ASCIIcode, result = "";
	for (var j = 0; j < text.length; j++){
		c = 1;
		i = 0;
		ASCIIcode = text.charCodeAt(j) + this.b;
		while (i < e){
			c = c*ASCIIcode;
			c = c%n;
			i++;
		}
		result += String.fromCharCode(c);
		this.b += 1;
	}
	return result;
}
rsa.decrypt = function(d, n, text){
	this.b = this.B_Default;
	var m, i, result = "";
	for (var j = 0; j < text.length; j++){
		m = 1;
		i = 0;
		while (i < d){
			m = m*text.charCodeAt(j);
			m = m%n;
			i++;
		}
		m = m - this.b;
		result += String.fromCharCode(m);
		this.b += 1;
	}
	return result;
}