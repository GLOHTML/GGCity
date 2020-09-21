//THIS CLASS MANAGES THE TWEEN AND EASING FOR THE REEL MOVEMENTS
var EASE_LINEAR = 0;
var EASE_CUBIC_IN = 1;
var EASE_QUART_BACKIN = 2;
var EASE_BACKIN = 3;
var EASE_CUBIC_OUT = 4;
var EASE_ELASTIC_OUT = 5;
var EASE_BACKOUT = 6;

function CTweenController(){
    
    this.tweenValue = function( fStart, fEnd, fLerp ){
        return fStart + fLerp *( fEnd-fStart);     
    };
    
    this.easeLinear = function(t, b, c, d) {
            return c*t/d + b;
    };
    
    this.easeInCubic = function(t, b, c, d) {
	var tc=(t/=d)*t*t;
	return b+c*(tc);
    };


    this.easeBackInQuart =  function(t, b, c, d) {
	var ts=(t/=d)*t;
	var tc=ts*t;
	return b+c*(2*ts*ts + 2*tc + -3*ts);
    };
    
    this.easeInBack = function(t, b, c, d ) {
        return c*(t/=d)*t*((1.70158+1)*t - 1.70158) + b;
    };
    
    this.easeOutCubic = function(t, b, c, d){
        return c*((t=t/d-1)*t*t + 1) + b;
    };
    
    this.easeOutElastic = function(t, b, c, d){
	var s = 0;
        var a;
        var p;
        
        if (t === 0) {
                return b;
        }
        if ((t /= d) === 1) {
                return b + c;  
        }

        p=d*.3;
        a = c; 
        s = p / 4; 

        return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
    };
    
    this.easeOutBack =  function(t, b, c, d) {
        var s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    };
}