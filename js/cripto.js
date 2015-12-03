jQuery(document).ready(function($){
	var shifr = $('#shifr'),
	to1 = $('#l-cd-radio-1'),
	to2 = $('#l-cd-radio-2'),
	text1 = $('#cd-textarea-1'),
	text2 = $('#cd-textarea-2'),
	btn = $('#btn'),
	pubKey = $('#pub-key')
	privKey = $('#priv-key'),
	keys = $('.keys');
	function initEvent () {
		shifr.on('change', function () {
			var method = parseInt(shifr.val());
			switch(method){
				case 0:
				case 1:
					privKey.parent().removeClass('hide');
					pubKey.prev().text('Публичный ключ');
					break;
				case 2:
				case 3:
					privKey.parent().addClass('hide');
					pubKey.prev().text('Ключ');
					break;
			}
		});
		to1.on('click', function() {
			text1.removeAttr('disabled');
			text2.attr('disabled','disabled');
		});
		to2.on('click', function() {
			text1.attr('disabled','disabled');
			text2.removeAttr('disabled');
		});
		keys.each(function (i, item) {
			$(item).on('focus', function () {
				$(this).removeClass('error');
			});
		})
		btn.click(function(e){
			e.preventDefault();
			var method = parseInt(shifr.val()),
					encrypt = to1.prev().prop("checked"),
					privateKey = privKey.val(), publicKey = pubKey.val(), text, result;
			text = encrypt ? text1.val() : text2.val();
			switch(method){
				case 3:
					console.log("key: ", publicKey);
					var hash = md5.hash(publicKey.bytes('ascii')),
					key = bits.hex(hash, 1, '');
					console.log("hash: ", key);
					var gost = new ClassGost();
					result = encrypt ? gost.Encode(text, key) : gost.Decode(text, key);
				break;
				case 2:
					var key = encodeURIComponent(publicKey).bytes('ascii');
					if (!encrypt) {
						var tmp = [];
						for (var i = 0; i < text.length; i++) {
							tmp.push(text.charCodeAt(i));
						};
						text = tmp;
					}else{
						text = encodeURIComponent(text).bytes('ascii');
					}
					console.log("key: ", publicKey);
					console.log("hash: ", bits.hex(md5.hash(key), 1, ''));
					arr = encrypt ? aes.encrypt(text, publicKey) : aes.decrypt(text, publicKey);
					result = '';
					arr.forEach(function (s) {
						result += String.fromCharCode(s);
					})
					result = decodeURIComponent(result);
				break;
				case 1:
					console.log("Публичный ключ: ", publicKey);
					console.log("Приватный ключ: ", privateKey);
					publicKey = getSimple(getNumberFromString(publicKey));
					privateKey = getNumberFromString(privateKey) % publicKey;
					console.log("Публичный ключ число: ", publicKey);
					console.log("Приватный ключ число: ", privateKey);
					result = encrypt ? elGamal.crypt(publicKey, privateKey, encodeURIComponent(text)) : elGamal.decrypt(publicKey, privateKey,text);
					if (!encrypt) {
						result = decodeURIComponent(result);
					};
				break;
				case 0:
					if(encrypt){
						var keys = rsa.init();
						privKey.val(keys.d);
						pubKey.val(keys.n);
						console.log("Публичный ключ: ", keys.n);
						console.log("Приватный ключ: ", keys.d);
					}else{
						console.log("Публичный ключ: ", publicKey);
						console.log("Приватный ключ: ", privateKey);
					}
					result = encrypt ? rsa.crypt(keys.e, keys.n, text) : rsa.decrypt(parseInt(privateKey), parseInt(publicKey), text);
				break;
			}
			console.log("result: ", result);
			if(encrypt){
				text2.val(result);
				checkVal(text2);
			}else{
				text1.val(result);
				checkVal(text1);
			}
		});
	}
	initEvent();
});
