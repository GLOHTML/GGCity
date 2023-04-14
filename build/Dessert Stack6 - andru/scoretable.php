
<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"> 
	<meta charset="UTF-8">
	<link rel="stylesheet" href="scoretable.css">
</head>
<body>
	<div class="loading">Loading&#8230;</div>
<div class="lboard_header sticky">
	<h1 class="lboard_title">
    Top 20 Leaderboard
    </h1><img class="lboard_img" src="testt.gif" >
</div>
<div class="wrapper">
	<div class="lboard_section">
		<div class="lboard_wrap">
            <div class="lboard_item">	
            
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>1.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 1</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>1.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 2</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>1.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 3</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>4.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 4</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>5.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 4</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>6.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 4</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
                <div class="lboard_mem">
				    <div class="no_bar">
						<p><span>7.</span></p>
					</div>
					<div class="name_bar">
						<p>glo 4</p>
					</div>
					<div class="points">
						1000 points
					</div>
				</div>
            </div>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script>
	var animationDur=500;
	//setup height body & position setiap anak
	var scoreHeight = ($(".lboard_mem").height() +20);
	var totalHeight = scoreHeight* $(".lboard_item").children().length;

	for(var i=0;i<$(".lboard_item").children().length;i++){
		var child = $('.lboard_item').children(".lboard_mem").eq(i);
		child.css({'top' : (i*scoreHeight) + 'px'});
	}
	$('body').height( $("body").height() + totalHeight );
	$(".loading").addClass("loading-disabled");


	setTimeout(function(){
		animatePositionReplace(5,2); 
		setTimeout(function(){
			animatePositionReplace(6,5); 
		}, 200);
	}, 2000);

	setTimeout(function(){
		var newdata = {
			name: "si baru",
			score: 1200
			};
		animateNewIntoPosition(2,newdata);
	}, 1000);

	function animatePositionReplace(idxfrom,idxto){
		//hanya untuk posisi dari bawah ke atas (index lebih besar ke lebih kecil)
		if(idxfrom<idxto){
			return;
		}
		var objTarget = $('.lboard_item').children(".lboard_mem").eq(idxto);
		var objToMove = $('.lboard_item').children(".lboard_mem").eq(idxfrom);
		objToMove.addClass("zoomEffect");
		objToMove.animate( {
			top: idxto*scoreHeight
		}, animationDur, "easeOutQuad", function() {
			objToMove.removeClass("zoomEffect");
		});
		shiftDown(idxfrom,idxto);
		objToMove.insertBefore(objTarget);
	
	}

	function shiftDown(idxfrom,idxto){
		for(var i=idxto;i<idxfrom;i++){
			console.log(i);
			var child = $('.lboard_item').children(".lboard_mem").eq(i);
			child.animate( {
				top: (i+1)*scoreHeight
			}, animationDur,"easeOutQuad", function() {
			});
		}
	}
	
	function reorderWithAnimation(){
		for(var i=0;i<$(".lboard_item").children().length;i++){
			console.log(i);
			var child = $('.lboard_item').children(".lboard_mem").eq(i);
			child.animate( {
				top: i*scoreHeight
			}, animationDur,"easeOutQuad", function() {
			});
		}
	}

	function animateNewIntoPosition(idx,data){
		var objTarget = $('.lboard_item').children(".lboard_mem").eq(idx);
		var scoreElementTxt = '<div class="lboard_mem insertEffect">'+
                      '<div class="no_bar">'+
                      '<p><span>'+(idx+1)+'</span></p>'+
                      '</div>'+
                      '<div class="name_bar">'+
                        '<p>'+data.name+'</p>'+
                      '</div>'+
                      '<div class="points">'+
                        '<p>'+data.score+' points</p>'+
                      '</div>';
		var scoreElement = $($.parseHTML(scoreElementTxt)).insertBefore(objTarget);
		scoreElement.css({'top' : (idx*scoreHeight) + 'px'});
		reorderWithAnimation();
		setTimeout(function(){
			scoreElement.removeClass("insertEffect");
		}, 500);
	}
	jQuery.easing['jswing'] = jQuery.easing['swing'];

	jQuery.extend( jQuery.easing,
	{
		def: 'easeOutQuad',
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		}
	});
	
</script>

</body>
</html>