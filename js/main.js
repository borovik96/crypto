jQuery(document).ready(function($){
	if( $('.floating-labels').length > 0 ) floatLabels();

	function floatLabels() {
		var inputFields = $('.floating-labels .cd-label').next();
		inputFields.each(function(){
			var singleInput = $(this);
			//check if user is filling one of the form fields
			// checkVal(singleInput);
			singleInput.on('change keyup', function(){
				checkVal(singleInput);
			});
		});
	}

	/* scroll */
	$.fn.scrollTo = function( target, options, callback ){
		if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
		var settings = $.extend({
			scrollTarget  : target,
			offsetTop     : 50,
			duration      : 500,
			easing        : 'swing'
		}, options);
		return this.each(function(){
			var scrollPane = $(this);
			var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
			var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
			scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
				if (typeof callback == 'function') { callback.call(this); }
			});
		});
	}
	/* /scroll */
});
function checkVal(inputField) {
		if(inputField.val() == ''){
			inputField.prev('.cd-label').removeClass('float')
		}else{
			inputField.prev('.cd-label').addClass('float');
		}
	}