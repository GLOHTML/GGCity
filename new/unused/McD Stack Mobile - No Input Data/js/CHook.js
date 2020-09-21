function CHook(){
    var _iRotSpeed;
    var _iRotFactor;
    var _iXPos;
    var _iYPos;

    var _iRopeLen = 0;
    
    var _vDir = {x:0,y:1};
    var _oLine1;
    var _oLineGfx1;
    var _oLine2;
    var _oLineGfx2;
    var _oHookSprite;
    
    this._init = function(){
        _iRotFactor = 0;
        _iRotSpeed = 2;
       
        _oLineGfx1 = new createjs.Graphics();
        _oLineGfx1.setStrokeStyle(HOOK_THICKNESS);
        _oLineGfx1.beginStroke("#000");
        _oLineGfx1.moveTo(HOOK_START_X-10,HOOK_START_Y);
        _oLineGfx1.lineTo(HOOK_START_X-10,HOOK_START_Y+LINE_LENGTH);

        _oLine1 = new createjs.Shape(_oLineGfx1);
        s_oStage.addChild(_oLine1);
        
        _oLineGfx2 = new createjs.Graphics();
        _oLineGfx2.setStrokeStyle(HOOK_THICKNESS);
        _oLineGfx2.beginStroke("#000");
        _oLineGfx2.moveTo(HOOK_START_X+10,HOOK_START_Y);
        _oLineGfx2.lineTo(HOOK_START_X+10,HOOK_START_Y+LINE_LENGTH);

        _oLine2 = new createjs.Shape(_oLineGfx2);
        s_oStage.addChild(_oLine2);
        
        var oSpriteHookClosed = s_oSpriteLibrary.getSprite('hook')
        _oHookSprite = createBitmap(oSpriteHookClosed);
        _oHookSprite.regX = oSpriteHookClosed.width/2;     
        s_oStage.addChild(_oHookSprite);
        
        this._drawLine();
    };
	
    this.reset = function(){
        _iRopeLen = 0;
        _iXPos = HOOK_START_X;
        _iYPos = HOOK_START_Y+LINE_LENGTH;
        
        _oLine1.y = _oLine2.y = 0;
    };
    
    this.decreseY = function(iDecrease){
        _oLine1.y -= iDecrease;
        _oLine2.y -= iDecrease;
        _oHookSprite.y -= iDecrease;
    };
    
    this.normalize = function(v){
        var len = Math.sqrt( v.x*v.x+v.y*v.y );
        if (len > 0 ){
            v.x/= len; v.y/=len; 
        }
    };
    
    this.rotateVector2D = function( iAngle, v ) {		
        var iX = v.x *   Math.cos( iAngle )  + v.y * Math.sin( iAngle );
        var iY = v.x * (-Math.sin( iAngle )) + v.y * Math.cos( iAngle );		
        v.x = iX;
        v.y = iY;
    };
    
    this.toDegree = function(iAngleRad){
        return iAngleRad * (180/Math.PI);
    };
    
    this._drawLine = function(){
        var fLerp = Math.sin(_iRotFactor);
        _vDir.x = 0; 
        _vDir.y = 1;
        
        var fCurAngle = ((Math.PI/2)*HOOK_MAX_ROT) *fLerp;
        
        this.rotateVector2D( fCurAngle,_vDir);
        this.normalize(_vDir);
        var iNewX = _vDir.x * ( LINE_LENGTH + _iRopeLen);
        var iNewY = _vDir.y * ( LINE_LENGTH + _iRopeLen);
        
        _iXPos = HOOK_START_X+iNewX;
        _iYPos = HOOK_START_Y+iNewY;
        
        _oLineGfx1.clear();
        _oLineGfx1.setStrokeStyle(HOOK_THICKNESS);
        _oLineGfx1.beginStroke("#000");
        _oLineGfx1.moveTo(HOOK_START_X-8,HOOK_START_Y);
        _oLineGfx1.lineTo(_iXPos-8,_iYPos);
        
        _oLineGfx2.clear();
        _oLineGfx2.setStrokeStyle(HOOK_THICKNESS);
        _oLineGfx2.beginStroke("#000");
        _oLineGfx2.moveTo(HOOK_START_X+8,HOOK_START_Y);
        _oLineGfx2.lineTo(_iXPos+8,_iYPos);
        
        _oHookSprite.x = _iXPos;
        _oHookSprite.y = _iYPos - 10;
    };
    
    this.getAttachBlockPoint = function(){
        return { x: _oHookSprite.x,
                 y: _oHookSprite.y + 30};
    };

    this.updateRotation = function(iSpeed){
        _iRotFactor += iSpeed;
        
        this._drawLine();
    };

    this._init();
}
