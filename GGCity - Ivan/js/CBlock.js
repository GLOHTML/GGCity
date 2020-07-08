function CBlock(iX,iY,oSprite,iWidth,iHeight,oParentContainer){
    var _bUpdate;
    var _iSpeedDown;
    var _iHalfWidth;
    var _iWidth;
    var _iHalfHeight;
    var _iHeight;
    var _vDir;
    var _oSprite;
    var _oContainer;
    var _oParentContainer;
    
    this._init = function(iX,iY,oSprite,iWidth,iHeight,oParentContainer){
        _iSpeedDown = 0;
        _iHalfWidth = Math.floor(iWidth/2);
        _iWidth = iWidth;
        _iHalfHeight = Math.floor(iHeight/2);
        _iHeight = iHeight;
        _vDir = new CVector2();
        _vDir.set(0,1);
        
        _oParentContainer = oParentContainer;
        _oSprite = oSprite;
        
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        _oContainer.addChild(oSprite);
        
        _bUpdate = true;
    };
    
    this.unload = function(){
        _oParentContainer.removeChild(_oContainer);
    };
    
    this.setY = function(iNewY){
        _oContainer.y = iNewY;
    };
    
    this.decreaseY = function(iDecrease){
        _oContainer.y -= iDecrease;
    };
    
    this.scrollDownCamera = function(iDistY){
        var iNewY = _oContainer.y+iDistY;
        createjs.Tween.get(_oContainer).to({y: iNewY}, TIME_GROUND_MOVE,createjs.Ease.cubicOut); 
    };
    
    this.misplaced = function(iXOffset){
        _oContainer.x += iXOffset;
        _oContainer.regX += iXOffset;
        _oContainer.regY = _iHeight;
        var iRotDir = 1;
        if(iXOffset > 0){
            iRotDir = -1;
        }

        _bUpdate = false;
        var oParent = this;
        createjs.Tween.get(_oContainer).to({rotation: 60 * iRotDir}, 510).call(function(){s_oGame.checkIfOtherBlocksFalling()});
        createjs.Tween.get(_oContainer).to({y: CANVAS_HEIGHT + 200}, 1000,createjs.Ease.backInOut).call(function(){oParent.unload();s_oGame.setBlock(false)});
    };
    
    this.attachScore = function(iScore,iLevel){
        var szColor;
        var szColorStroke;
        if(iLevel === 1){
            szColor = "#fffc6b";
            szColorStroke = "#0a2f77";
        }else if(iLevel === 2){
            szColor = "#56cc56";
            szColorStroke = "#fff";
        }else{
            szColor = "#fff";
            szColorStroke = "#0a2f77";
        }
        
        var oScoreStrokeText = new createjs.Text("+"+iScore,"50px "+FONT_GAME, szColorStroke);
        oScoreStrokeText.alpha = 0;
        oScoreStrokeText.outline = 6;
        oScoreStrokeText.x = 0;
        oScoreStrokeText.y = 0;
        oScoreStrokeText.textAlign = "center";
	oScoreStrokeText.textBaseline  = "alphabetic";
        _oContainer.addChild(oScoreStrokeText);
        
        var oScoreText = new createjs.Text("+"+iScore,"50px "+FONT_GAME, szColor);
        oScoreText.alpha = 0;
        oScoreText.x = 0;
        oScoreText.y = 0;
        oScoreText.textAlign = "center";
	oScoreText.textBaseline  = "alphabetic";
        _oContainer.addChild(oScoreText);
        
        createjs.Tween.get(oScoreStrokeText).to({alpha:1},500);
        createjs.Tween.get(oScoreStrokeText).to({y:-30}, 1500,createjs.Ease.cubicOut).call(function(){
                                                                        createjs.Tween.get(oScoreStrokeText).wait(300).to({alpha:0},300).call(function(){
                                                                                    _oContainer.removeChild(oScoreStrokeText);
                                                                        });
                                                        });
        
        createjs.Tween.get(oScoreText).to({alpha:1},500);
        createjs.Tween.get(oScoreText).to({y:-30}, 1500,createjs.Ease.cubicOut).call(function(){
                                                                        createjs.Tween.get(oScoreText).wait(300).to({alpha:0},300).call(function(){
                                                                                    _oContainer.removeChild(oScoreText);
                                                                        });
                                                        });
    };
    
    this.getYBase = function(){
        return _oContainer.y + _iHeight;
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getWidth = function(){
        return _iWidth;
    };
    
    this.getHalfWidth= function(){
        return _iHalfWidth;
    };
    
    this.getHeight = function(){
        return _iHeight;
    };
    
    this.getRectangle = function(){
        return new createjs.Rectangle(_oContainer.x-_iHalfWidth+20,_oContainer.y,_iWidth-20,_iHeight);
    };
    
    this.getSprite = function(){
        return _oSprite;
    };
    
    this.updateRotation = function(pHookPos){
        _oContainer.x = pHookPos.x;
        _oContainer.y = pHookPos.y;
    };
    
    this.updateFalling = function(iAccelleration){
        if(_bUpdate === false){
            return;
        }
        
        _iSpeedDown += iAccelleration;
        
        _oContainer.x += _iSpeedDown * _vDir.getX();
        _oContainer.y += _iSpeedDown * _vDir.getY();
    };
    
    this._init(iX,iY,oSprite,iWidth,iHeight,oParentContainer);
}