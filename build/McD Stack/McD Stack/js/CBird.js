function CBird(iX,iY,iDir,oParentContainer){
    var _iDir;
    var _oSprite;
    var _oParentContainer;
    
    this._init = function(iX,iY,iDir){
        _iDir = iDir;

        var oData = {   
                        framerate:10,
                        images: [s_oSpriteLibrary.getSprite('bird')], 
                        frames: {width: 30, height: 26}, 

                        animations: {  fly: [0,3,"fly"]}
                   };

        var oSpriteSheet = new createjs.SpriteSheet(oData); 
        
        _oSprite = createSprite(oSpriteSheet, "fly", 0,0,30, 26);
        _oSprite.x = iX;
        _oSprite.y = iY;
        _oSprite.scaleX = _iDir;
        _oParentContainer.addChild(_oSprite);
        
        var oParent = this;
        createjs.Tween.get(_oSprite).to({x: iX + (_iDir * (CANVAS_WIDTH + 100))}, BIRD_SPEED).call(function(){oParent.unload();}); 
    };
    
    this.unload = function(){
        _oParentContainer.removeChild(_oSprite);
    };
    
    _oParentContainer = oParentContainer;
    
    this._init(iX,iY,iDir);
}