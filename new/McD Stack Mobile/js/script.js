var CANVAS_WIDTH = 1400;
var CANVAS_HEIGHT = 1920;

var EDGEBOARD_X = 160;
var EDGEBOARD_Y = 160;

var FPS = 30;
var FPS_TIME      = 1000/FPS;
var DISABLE_SOUND_MOBILE = false;

var FONT_GAME = "upheaval_tt_brkregular";

var SOUNDTRACK_VOLUME_IN_GAME = 0.2;

var STATE_LOADING = 0;
var STATE_INTRO   = 1;
var STATE_MENU    = 2;
var STATE_HELP    = 3;
var STATE_GAME    = 4;

var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_DRAG_START  = 4;
var ON_DRAG_END    = 5;
var ON_CONTROLLER_END = 6;
var ON_CONTROLLER_REMOVE = 7;

var STATE_HOOK_ROTATE = 0;
var STATE_BLOCK_ROTATE = 1;
var STATE_BLOCK_FALLING = 2;
var STATE_BLOCK_MISPLACED = 3;
var STATE_SHOW_THE_TOWER = 4;


var BG_HEIGHT = 2185;
var FIRST_BLOCK_LANDING_Y = 1735;
var HOOK_START_X = CANVAS_WIDTH/2;
var HOOK_START_Y = EDGEBOARD_Y+ 124;
var START_HOOK_ROT_SPEED;
var HOOK_ROT_INCREASE_FACTOR;
var HOOK_THICKNESS = 4;
var HOOK_MAX_ROT; //FROM 0.1 TO 1
var LINE_LENGTH = 300;
var NUM_LEVELS;
var NUM_LIVES;
var FALL_SPEED;
var TIME_GROUND_MOVE = 800;
var Y_OFFSET_CAMERA = CANVAS_HEIGHT/2 + 300;
var BONUS_TOLLERANCE = 10;
var SPEED_TOWER_SHOWING = 15;
var MAX_SCORE_PER_BLOCK = 350;
var BEST_MULTIPLIER;
var MULTIPLIER_BONUS_POINT;
var BIRD_SPEED = 5000;
var BIRD_OCCURRENCE = 7000;

var ENABLE_FULLSCREEN;
var ENABLE_CHECK_ORIENTATION;
function CSpriteLibrary(){

    var _oLibSprites = {};
    var _oSpritesToLoad;
    var _iNumSprites;
    var _iCntSprites;
    var _cbCompleted;
    var _cbTotalCompleted;
    var _cbOwner;
    
    this.init = function( cbCompleted,cbTotalCompleted, cbOwner ){
        _oSpritesToLoad = {};
        _iNumSprites = 0;
        _iCntSprites = 0;
        _cbCompleted = cbCompleted;
        _cbTotalCompleted = cbTotalCompleted;
        _cbOwner     = cbOwner;
    };
    
    this.addSprite = function( szKey, szPath ){
        if ( _oLibSprites.hasOwnProperty(szKey) ){
            return ;
        }
        
        var oImage = new Image();
        _oLibSprites[szKey] = _oSpritesToLoad[szKey] = { szPath:szPath, oSprite: oImage ,bLoaded:false};
        _iNumSprites++;
    };
    
    this.getSprite = function( szKey ){
        if (!_oLibSprites.hasOwnProperty(szKey)){
            return null;
        }else{
            return _oLibSprites[szKey].oSprite;
        }
    };
    
    this._onSpritesLoaded = function(){
        _iNumSprites = 0;
        _cbTotalCompleted.call(_cbOwner);
    };

    this._onSpriteLoaded = function(){
        _cbCompleted.call(_cbOwner);
        if (++_iCntSprites === _iNumSprites) {
            this._onSpritesLoaded();
        }
        
    };    

    this.loadSprites = function(){
        
        for (var szKey in _oSpritesToLoad) {
            
            _oSpritesToLoad[szKey].oSprite["oSpriteLibrary"] = this;
            _oSpritesToLoad[szKey].oSprite["szKey"] = szKey;
            _oSpritesToLoad[szKey].oSprite.onload = function(){
                this.oSpriteLibrary.setLoaded(this.szKey);
                this.oSpriteLibrary._onSpriteLoaded(this.szKey);
            };
            _oSpritesToLoad[szKey].oSprite.onerror  = function(evt){
                var oSpriteToRestore = evt.currentTarget;
                
                setTimeout(function(){
                        _oSpritesToLoad[oSpriteToRestore.szKey].oSprite.src = _oSpritesToLoad[oSpriteToRestore.szKey].szPath;
                },500);
            };
            _oSpritesToLoad[szKey].oSprite.src = _oSpritesToLoad[szKey].szPath;
        } 
    };
    
    this.setLoaded = function(szKey){
        _oLibSprites[szKey].bLoaded = true;
    };
    
    this.isLoaded = function(szKey){
        return _oLibSprites[szKey].bLoaded;
    };
    
    this.getNumSprites=function(){
        return _iNumSprites;
    };
}
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
            szColor = "#FFFFFF";
            szColorStroke = "#000000";
        }else if(iLevel === 2){
            szColor = "#FFFFFF";
            szColorStroke = "#000000";
        }else{
            szColor = "#FFFFFF";
            szColorStroke = "#000000";
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
CTLText.prototype = {
    
    constructor : CTLText,
    
    __autofit : function(){
        if(this._bFitText){
            
            var iFontSize = this._iFontSize;            

            while(
                    this._oText.getBounds().height > (this._iHeight -this._iPaddingV*2) ||
                    this._oText.getBounds().width > (this._iWidth-this._iPaddingH*2)                
                 ){
                iFontSize--;
                   
                this._oText.font = iFontSize+"px "+this._szFont;
                this._oText.lineHeight = Math.round(iFontSize*this._fLineHeightFactor);   
                
                this.__updateY();        
                this.__verticalAlign();                                
         
                if ( iFontSize < 8 ){
                    break;
                }
            };
            
            this._iFontSize = iFontSize;
        }        
    },
    
    __verticalAlign : function(){
        if(this._bVerticalAlign){
            var iCurHeight = this._oText.getBounds().height;          
            this._oText.y -= (iCurHeight-this._iHeight)/2 + (this._iPaddingV);            
        }        
    },

    __updateY : function(){

        this._oText.y = this._y + this._iPaddingV;

        switch(this._oText.textBaseline){
            case "middle":{
                this._oText.y += (this._oText.lineHeight/2) +
                                 (this._iFontSize*this._fLineHeightFactor-this._iFontSize);                    
            }break;
        }
    },

    __createText : function(szMsg){
        
        if (this._bDebug){
            this._oDebugShape = new createjs.Shape();
            this._oDebugShape.graphics.beginFill("rgba(255,0,0,0.5)").drawRect(
                    this._x, this._y, this._iWidth, this._iHeight);
            this._oContainer.addChild(this._oDebugShape);
        }

        this._oText = new createjs.Text(szMsg, this._iFontSize+"px "+this._szFont, this._szColor);
        this._oText.textBaseline = "middle";
        this._oText.lineHeight = Math.round(this._iFontSize*this._fLineHeightFactor);
        this._oText.textAlign = this._szAlign;
        
        
        if ( this._bMultiline ){
            this._oText.lineWidth = this._iWidth - (this._iPaddingH*2);
        }else{
            this._oText.lineWidth = null;
        }
        
        switch(this._szAlign){
            case "center":{
                this._oText.x = this._x+(this._iWidth/2);
            }break;
            case "left":{
                this._oText.x = this._x+this._iPaddingH;
            }break;   
            case "right":{
                this._oText.x = this._x+this._iWidth-this._iPaddingH;
            }break;       
        }

        this._oContainer.addChild(this._oText);  
        
        this.refreshText(szMsg);

    },    
    
    setVerticalAlign : function( bVerticalAlign ){
        this._bVerticalAlign = bVerticalAlign;
    },
    
    setOutline : function(iSize){
        if ( this._oText !== null ){
            this._oText.outline = iSize;
        }
    },
    
    setShadow : function(szColor,iOffsetX,iOffsetY,iBlur){
        if ( this._oText !== null ){
            this._oText.shadow = new createjs.Shadow(szColor, iOffsetX,iOffsetY,iBlur);
        }
    },
    
    setColor : function(szColor){
        this._oText.color = szColor;
    },
    
    setAlpha : function(iAlpha){
        this._oText.alpha = iAlpha;
    },
    
    setY : function(iNewY){
        this._oText.y = iNewY;
        this._y = iNewY;
    },
    
    removeTweens : function(){
        createjs.Tween.removeTweens(this._oText);
    },
    
    getText : function(){
        return this._oText;
    },
    
    getY : function(){
        return this._y;
    },
    
    getFontSize : function(){
        return this._iFontSize;
    },
    
    refreshText : function(szMsg){    
        if(szMsg === ""){
            szMsg = " ";
        }
        if ( this._oText === null ){
            this.__createText(szMsg);
        }
        
        this._oText.text = szMsg;

        this._oText.font = this._iFontSize+"px "+this._szFont;
        this._oText.lineHeight = Math.round(this._iFontSize*this._fLineHeightFactor);   
        
        this.__autofit();
        this.__updateY();        
        this.__verticalAlign();
    }
}; 

function CTLText( oContainer, 
                    x, y, iWidth, iHeight, 
                    iFontSize, szAlign, szColor, szFont,iLineHeightFactor,
                    iPaddingH, iPaddingV,
                    szMsg,
                    bFitText, bVerticalAlign, bMultiline,
                    bDebug ){

    this._oContainer = oContainer;

    this._x = x;
    this._y = y;
    this._iWidth  = iWidth;
    this._iHeight = iHeight;
    
    this._bMultiline = bMultiline;

    this._iFontSize = iFontSize;
    this._szAlign   = szAlign;
    this._szColor   = szColor;
    this._szFont    = szFont;

    this._iPaddingH = iPaddingH;
    this._iPaddingV = iPaddingV;

    this._bVerticalAlign = bVerticalAlign;
    this._bFitText       = bFitText;
    this._bDebug         = bDebug;
    //this._bDebug         = true;

    // RESERVED
    this._oDebugShape = null; 
    this._fLineHeightFactor = iLineHeightFactor;
    
    this._oText = null;
    if ( szMsg ){
        this.__createText(szMsg);
        
    }
}
function CGame(oData){
    var _bUpdate = false;
    var _bBlock;
    var _iCurLevel;
    var _iCurLives;
    var _iCurState;
    var _iBlockSpeed;
    var _iCurBlock;
    var _iLevelMultiplier;
    var _iScore;
    var _iNumScrollDown;
    var _iCurBuildingHeight;
    var _iNumBlockFalling;
    var _iCont;
    var _iTimeBirdElaps;
    var _iBestScore;
    var _iCurHookSpeed;
    var _iCurTrembleIndex;
    var _iIdInterval;
    var _aPiledBlocks;
    var _aPrevRectList;
    var _rBlockPile;
    var _oCurBlock;
    var _oHitArea;
    
    var _oBg = null;
    var _oCrane;
    var _oHook;
    var _oGameOverPanel;
    var _oWinPanel;
    var _oInterface;
    var _oBgContainer;
    var _oBonusContainer;
    var _oBlockContainer;
    var _oTrajectoryContainer;
    
    var _oFade;

    var _oInputPanel;

    this._init = function(aBlocksPerLevels){
        _iCurLevel = 1;
        _iScore = 0;
        _iBestScore = 0;
        _iCurLives = NUM_LIVES;
        
        new CGameSettings(aBlocksPerLevels);
        
        _iCurHookSpeed = s_aHookSpeed[_iCurLevel-1];

        _oBgContainer = new createjs.Container();
        _oBgContainer.y = CANVAS_HEIGHT -  BG_HEIGHT;
        s_oStage.addChild(_oBgContainer);
	
        var oSpriteCrane = s_oSpriteLibrary.getSprite('crane');
        _oCrane = createBitmap(oSpriteCrane);
        _oCrane.x = CANVAS_WIDTH - oSpriteCrane.width;
        _oCrane.y = EDGEBOARD_Y + 60;
        s_oStage.addChild(_oCrane);
        
        _oHook = new CHook();

        _oBlockContainer = new createjs.Container();
        s_oStage.addChild(_oBlockContainer);
        
        _oBonusContainer = new createjs.Container();
        s_oStage.addChild(_oBonusContainer);
        
        _oHitArea = new CGfxButton(CANVAS_WIDTH/2,CANVAS_HEIGHT/2,s_oSpriteLibrary.getSprite('hit_area'),s_oStage);
        
        _oInterface = new CInterface();
        this._initLevel();
        
        this._attachNextBlock();

        var oGraphics = new createjs.Graphics().beginFill("#fff").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade = new createjs.Shape(oGraphics);
        _oFade.alpha = 0;
        s_oStage.addChild(_oFade);
        
	   _oGameOverPanel = new CGameOver(0,0);
        _oWinPanel = new CWinPanel(0,0);

        if(s_bMobile === false){
            document.onkeydown   = onKeyDown; 
        }

        setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
        
        s_oRollingTextManager = new CRollingTextManager();
        
        new CHelpPanel(s_oStage); 
    };
    
    this.unload = function(){
        _oInterface.unload();
        
        s_oStage.removeEventListener("mousedown", this._onMouseDown);
        if(s_bMobile === false){
            document.onkeydown   = null; 
        }
        s_oStage.removeAllChildren();
    };
    
    this.startGame = function(){
        startPlay();
        _oTrajectoryContainer.alpha = 1;
        
        _iCurState = STATE_BLOCK_ROTATE;
        _bUpdate = true;
    };
    
    this._initLevel = function(){
        _iCurBlock = 0;
        _iTimeBirdElaps = 0;
        _iCurBuildingHeight = FIRST_BLOCK_LANDING_Y;
        _iNumScrollDown = 1;
        _iBlockSpeed = FALL_SPEED;
        _oBgContainer.removeAllChildren();
        
        _aPiledBlocks = new Array();
        _aPrevRectList = new Array();
        _aPrevRectList.push( new createjs.Rectangle(0,FIRST_BLOCK_LANDING_Y,CANVAS_WIDTH,100));
        
        var oSpriteBG = s_oSpriteLibrary.getSprite("game_bg");
        _oBg = createBitmap(oSpriteBG);
        _oBgContainer.addChild(_oBg);
        
        var oSprite = s_oSpriteLibrary.getSprite("perfect_landing");
        var oPerfectLanding = createBitmap(oSprite);
        oPerfectLanding.x  = CANVAS_WIDTH/2;
        oPerfectLanding.y  = CANVAS_HEIGHT -15
        oPerfectLanding.regX = oSprite.width/2
        _oBgContainer.addChild(oPerfectLanding);

        _oTrajectoryContainer = new createjs.Container();
        _oTrajectoryContainer.alpha = 0;
        s_oStage.addChild(_oTrajectoryContainer);
        
        var oTraject = createBitmap(s_oSpriteLibrary.getSprite("trajectory"));
        oTraject.x = oPerfectLanding.x - oSprite.width/2;
        oTraject.y = 0;
        _oTrajectoryContainer.addChild(oTraject);
        
        oTraject = createBitmap(s_oSpriteLibrary.getSprite("trajectory"));
        oTraject.x = oPerfectLanding.x + oSprite.width/2;
        oTraject.y = 0;
        _oTrajectoryContainer.addChild(oTraject);
        
        _oInterface.reset(s_aBlocksPerLevel[_iCurLevel-1],_iCurLives);
        
        _oHitArea.addEventListener(ON_MOUSE_DOWN, this._onMouseDown, this);
        _bBlock = false;
    };
    
    this._resetLevel = function(){
        
        //REMOVE BLOCK
        for(var i=0;i<_aPiledBlocks.length;i++){
            _aPiledBlocks[i].unload();
        }
        
        _oBonusContainer.removeAllChildren();
        
        _iCurLevel++;
        if(_iCurLevel > NUM_LEVELS ){
            this._win();
        }else{
            _iCurHookSpeed = s_aHookSpeed[_iCurLevel-1];parseFloat(_iCurHookSpeed.toFixed(2));
            this._initLevel();
            _oCrane.y = EDGEBOARD_Y + 60;
            _oHook.reset();
            this._attachNextBlock();
            _iCurState = STATE_BLOCK_ROTATE;
            
        }
        
    };
    
    this.stopUpdate = function(){
        _bBlock = true;
    };

    this.startUpdate = function(){
        _bBlock = false;
    };
    
    this._attachNextBlock = function(){
        _iCurBlock++;
        
        if(_iCurBlock > 1){
            _oTrajectoryContainer.alpha = 0;
        }
        
        _oInterface.refreshNumBlocks(_aPiledBlocks.length );
        
        if(_iCurBlock > s_aBlocksPerLevel[_iCurLevel-1]){
            if(_iCurLives > 0){
                this._levelComplete();
            }
            return false;
        }
        
        
        
        _iNumBlockFalling = 0;
        _iCont = 0;
        
        var pPos = _oHook.getAttachBlockPoint();

        var iType = s_aBlockSequence[_iCurLevel-1][_iCurBlock-1];

        var oSprite = createSprite(s_aBlockSpriteSheet[_iCurLevel-1],"block_"+iType,s_aBlockSize[_iCurLevel-1][iType].width/2,0,
                                                        s_aBlockSize[_iCurLevel-1][iType].width,s_aBlockSize[_iCurLevel-1][iType].height);
        
        _oCurBlock = new CBlock(pPos.x,pPos.y,oSprite,s_aBlockSize[_iCurLevel-1][iType].width,s_aBlockSize[_iCurLevel-1][iType].height,_oBlockContainer);
        _aPiledBlocks.push(_oCurBlock);
        
        return true;
    };
    
    this.tweenTrajectory = function(iAlpha,iCont){
        iCont--;

        if(iCont > 0){
            
            createjs.Tween.get(_oTrajectoryContainer).to({alpha:iAlpha}, 200,createjs.Ease.cubicOut).call(function(){s_oGame.tweenTrajectory(iAlpha===0?1:0,iCont);}); 
        }else{
            _oTrajectoryContainer.alpha = 0;
        }
        
    };
    
    this._scrollDownCamera = function(){
        _bBlock = true;
        var iDistY = (CANVAS_HEIGHT/2) - 310 - _oCurBlock.getHeight();
        
        for(var i=0;i<_aPiledBlocks.length;i++){
            _aPiledBlocks[i].scrollDownCamera(iDistY);
        }
        
        _iCurBuildingHeight = _oCurBlock.getY() + iDistY /*- _oCurBlock.getHeight()*/;
        
        //ADD SKY BG
        var oGraphics = new createjs.Graphics().beginFill("#F7F0DE").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT/2);
        var oShape = new createjs.Shape(oGraphics);
        oShape.y = - ((CANVAS_HEIGHT/2) * _iNumScrollDown)+_iNumScrollDown;
        _oBgContainer.addChild(oShape);

        //ATTACH RANDOM CLOUDS
        var iRandNum = Math.floor((Math.random() * 3) + 3);
        for(var k=0;k<iRandNum;k++){
            var iRandType = Math.floor(Math.random() * (4 - 1) + 1);
            var iRandX = Math.floor(Math.random() * (CANVAS_WIDTH - 100));
            var iRandY = Math.floor(Math.random() * (700 - 200) + 200);
            var oCloud =  createBitmap( s_oSpriteLibrary.getSprite("cloud_"+iRandType));
            oCloud.x = iRandX;
            oCloud.y = oShape.y + iRandY;
            _oBgContainer.addChild(oCloud);
        }
        
        var oParent = this;
        createjs.Tween.get(_oBonusContainer).to({y: _oBonusContainer.y + iDistY}, TIME_GROUND_MOVE,createjs.Ease.cubicOut);
        createjs.Tween.get(_oBgContainer).to({y: _oBgContainer.y + iDistY}, TIME_GROUND_MOVE,createjs.Ease.cubicOut).call(function(){oParent._endScroll();}); 
        _iNumScrollDown++;
    };
    
    this._endScroll = function(){
        _bBlock = false;
        _bUpdate = true;
        
        //REFRESH LOGIC BLOCK RECTANGLES
        _aPrevRectList = new Array();
        _aPrevRectList.push( new createjs.Rectangle(0,FIRST_BLOCK_LANDING_Y,CANVAS_WIDTH,100));
        for(var j=0;j<_aPiledBlocks.length-1;j++){
            _aPrevRectList.push( new createjs.Rectangle(_aPiledBlocks[j].getX() - _aPiledBlocks[j].getHalfWidth(),
                                                        _aPiledBlocks[j].getY() ,
                                                        _aPiledBlocks[j].getWidth(),
                                                        _aPiledBlocks[j].getHeight()));
            
        }
    };
    
    this.tremble = function(){
        var oDir = s_aTrembleSequence[_iCurTrembleIndex];
        _oBgContainer.x = _oBgContainer.x + oDir.x;
        _oBgContainer.y = _oBgContainer.y + oDir.y;

        _iCurTrembleIndex++;
        if(_iCurTrembleIndex === s_aTrembleSequence.length){
            _iCurTrembleIndex = 0;
            clearInterval(_iIdInterval);
        }
    };
    
    this._checkForBonus = function(){
         if(_aPiledBlocks.length < 2){
             return false;
         }

         if(_oCurBlock.getX() > _aPiledBlocks[_aPiledBlocks.length-2].getX()- BONUS_TOLLERANCE && 
                                            _oCurBlock.getX() < _aPiledBlocks[_aPiledBlocks.length-2].getX()+BONUS_TOLLERANCE ){
            
            //GREAT FALL!!
            this.attachBonus();
            return true;
         }else{
             return false;
         }
    };
    
    this.attachBonus = function(){
        var oData = {   
                        framerate:5,
                        images: [s_oSpriteLibrary.getSprite('bonus')], 
                        frames: {width: 77, height: 74,regY:37}, 

                        animations: {  idle: [0,1,"idle"]}
                   };

        var oSpriteSheet = new createjs.SpriteSheet(oData); 
        
        var oBonusSprite = createSprite(oSpriteSheet, "idle", 0,37,77, 74);
        oBonusSprite.alpha = 0;
        oBonusSprite.x = _oCurBlock.getX() + (s_aBlockSize[_iCurLevel-1][s_aBlockSequence[_iCurLevel-1][_iCurBlock-1]].width/2) ;
        oBonusSprite.y = _oCurBlock.getY() - _oBonusContainer.y + (s_aBlockSize[_iCurLevel-1][s_aBlockSequence[_iCurLevel-1][_iCurBlock-1]].height/2) + 30;
        _oBonusContainer.addChild(oBonusSprite);

        createjs.Tween.get(oBonusSprite).to({alpha: 1}, 1000,createjs.Ease.cubicOut);
        playSound("bonus",1,false);                                    
    };
    
    this.checkIfOtherBlocksFalling = function(){
        _iCont++;

        if(_iCont < _iNumBlockFalling){
            var oBlock = _aPiledBlocks.pop();
            oBlock.setY(_aPrevRectList[_aPrevRectList.length-1].y);
            this._blockMisplaced(oBlock);
        }else if(_iCont === _iNumBlockFalling){
            if( this._attachNextBlock()){
                _iCurState = STATE_BLOCK_ROTATE;
            }
        }
    };
    
    this.setBlock = function(bBlock){
        _bBlock = bBlock;
    };
    
    this.blockFall = function(){
        if(_iCont === _iNumBlockFalling){
            if( this._attachNextBlock()){
                _iCurState = STATE_BLOCK_ROTATE;
            }
        }
    };
    
    this._blockMisplaced = function(oBlock){
        playSound("fall_fail",1,false);
        
        var iXOffset;
        
        if(oBlock.getX() > (_aPrevRectList[_aPrevRectList.length-1].x + (_aPrevRectList[_aPrevRectList.length-1].width)/2) ){
            //FALL ON THE RIGHT
            iXOffset = -Math.abs(oBlock.getX() - (_aPrevRectList[_aPrevRectList.length-1].x + _aPrevRectList[_aPrevRectList.length-1].width));
        }else{
            //FALL ON THE LEFT
            iXOffset = Math.abs(_aPrevRectList[_aPrevRectList.length-1].x  - oBlock.getX());
        }
        oBlock.misplaced(iXOffset);
        
        this.loseLife();
    };
    
    this.loseLife = function(){
        //SHOW RED FADE
        var oGraphics = new createjs.Graphics().beginFill("#f00").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        var oHurtFade = new createjs.Shape(oGraphics);
        oHurtFade.alpha = 0;
        s_oStage.addChild(oHurtFade);
        
        createjs.Tween.get(oHurtFade).to({alpha: 0.5}, 200,createjs.Ease.cubicOut).call(function(){
                                            createjs.Tween.get(oHurtFade).to({alpha: 0}, 200,createjs.Ease.cubicOut).call(function(){
                                                s_oStage.removeChild(oHurtFade);
                                            }); 
                                        }); 
        
        //LOSE A LIFE
        _iCurLives--;
        if(_iCurLives === 0){
            this._gameOver();
        }
        
        _oInterface.refreshLives(_iCurLives);
    };
    
    this.showAllTower = function(){
        _iCurState = STATE_SHOW_THE_TOWER;
        _bUpdate = true;
    };
    
    this._levelComplete = function(){
        _bBlock = true;
        _oHitArea.removeEventListener(ON_MOUSE_DOWN);
        
        _oInterface.refreshNumBlocks(_aPiledBlocks.length);
        _oInterface.levelComplete(_iCurLevel);
        
        playSound("end_level",1,false); 
    };
    
    this._gameOver = function(){
        _bBlock = true;
        _bUpdate = false;
        _iCurState = STATE_BLOCK_ROTATE;

        if(_iScore > _iBestScore){
            _iBestScore = _iScore;
        }
        // _oInputPanel.show(_iScore);
        _oGameOverPanel.show(_iScore);
    };
    
    this._win = function(){
        _bBlock = true;
        if(_iScore > _iBestScore){
            _iBestScore = _iScore;
        }
        
        _oWinPanel.show(_iScore);
    };
    
    function onKeyDown(evt) { 
        if(!evt){ 
            evt = window.event; 
        }  

        switch(evt.keyCode) {  
           // spacebar  
           case 32: {
                    if(!_bBlock){
                        _iCurState = STATE_BLOCK_FALLING;
                    }else if(!_bUpdate && _oGameOverPanel.isVisible()){
                        _oGameOverPanel.onButPlayAgainRelease();
                    }else if(!_bUpdate && _oWinPanel.isVisible()){
                        _oWinPanel.onButRestartRelease();
                    }
                   
                   break; 
               }
        }
        evt.preventDefault();
        return false;
    }

    //DESKTOP EVENTS
    this._onMouseDown = function(evt){
        if(!_bBlock){
            _iCurState = STATE_BLOCK_FALLING;
        }
    };
    
    this.onExit = function(){
        this.unload();
        
        s_oGame = null;
        s_oMain.gotoMenu();
    };

    this.update = function(){
        if(_bUpdate === false){
            return;
        }
        
        //CHECK BIRD OCCURRENCE
        _iTimeBirdElaps += s_iTimeElaps;
        if(_iTimeBirdElaps > BIRD_OCCURRENCE){
            _iTimeBirdElaps = 0;
            var aRandDir = new Array(-1,1);
            var iRand = Math.floor(Math.random() * aRandDir.length);
            var iDir = aRandDir[iRand];
            var iRandHeight = Math.floor(Math.random() * ( (600 - _oBgContainer.y) - ( 200 - _oBgContainer.y)) + ( 200 - _oBgContainer.y) );
            new CBird(iDir>0?-100:CANVAS_WIDTH+100,iRandHeight,iDir,_oBgContainer);
        }

        switch(_iCurState){
            case STATE_BLOCK_ROTATE:{
                    _oHook.updateRotation(_iCurHookSpeed);
                    _oCurBlock.updateRotation(_oHook.getAttachBlockPoint());
                    break;
            }
            case STATE_BLOCK_FALLING:{
                    _oCurBlock.updateFalling(_iBlockSpeed);
                    var oRect = _oCurBlock.getRectangle();
                    if(checkRectIntersection(oRect,_aPrevRectList[_aPrevRectList.length-1]) === true ){
                        //BLOCKS COLLISION
                        
                        if(_oCurBlock.getX() > _aPrevRectList[_aPrevRectList.length-1].x && 
                                            _oCurBlock.getX() < (_aPrevRectList[_aPrevRectList.length-1].x + _aPrevRectList[_aPrevRectList.length-1].width) ){
                            
                            //CHECK IF TOWER BARYCENTER IS STABLE
                            _rBlockPile = _oBlockContainer.getBounds();
                            var iCenterX = _rBlockPile.x + Math.round(_rBlockPile.width/2);

                            var oRect = _oCurBlock.getRectangle();
                            if(_aPiledBlocks.length > 1 && pointInRect(iCenterX,_oCurBlock.getY(),oRect.x,oRect.y,oRect.x+oRect.width,oRect.y+oRect.height) === false){
                                //DESTROY TOWER
                                _iNumBlockFalling = 2;

                                var oPrevBlock = _aPiledBlocks.pop();

                                this._blockMisplaced(_oCurBlock);
                                _aPrevRectList.splice(_aPrevRectList.length-1,1);
                                _iCurBuildingHeight += oPrevBlock.getHeight();
                                _iCurState = STATE_BLOCK_MISPLACED;
                                return;
                            }else{
                                //WELL PLACED
                                _oCurBlock.setY(_iCurBuildingHeight - _oCurBlock.getHeight());
                                
                                //ASSIGN LEVEL MULTIPLIER IF THIS IS THE FIRST BLOCK
                                var iDistFromCenter = Math.abs( (CANVAS_WIDTH/2) - _oCurBlock.getX());
                                var iValue = (iDistFromCenter/(CANVAS_WIDTH/2)).toFixed(2);
                                iValue = 1 - iValue; //THIS IS A PERCENTAGE VALUE FROM 0 TO 1


                                _iLevelMultiplier = (BEST_MULTIPLIER * iValue).toFixed(2);
                                _oInterface.showMultiplier(_iLevelMultiplier);
                                var iBlockScore;

                                iBlockScore = Math.round( MAX_SCORE_PER_BLOCK - Math.abs((CANVAS_WIDTH/2) - _oCurBlock.getX())* _iLevelMultiplier);

                                if (this._checkForBonus()){
                                    iBlockScore *= MULTIPLIER_BONUS_POINT;
                                }
                                
                                _oInterface.refreshScore(Math.round(iBlockScore));
                                
                                _iScore += Math.round(iBlockScore);
                                _oCurBlock.attachScore(iBlockScore,_iCurLevel);
                                
                                if(_iCurBuildingHeight < Y_OFFSET_CAMERA && _iCurBlock < s_aBlocksPerLevel[_iCurLevel-1]){
                                    this._scrollDownCamera();
                                }else{
                                    
                                    var iType = s_aBlockSequence[_iCurLevel-1][_iCurBlock];
                                    if(iType !== undefined){
                                        _iCurBuildingHeight = _oCurBlock.getY();
                                    }

                                    _iCurTrembleIndex = 0;
                                    var oParent = this;
                                    _iIdInterval = setInterval(function(){oParent.tremble();},20);    
                                }

                                if(_iCurBlock === s_aBlocksPerLevel[_iCurLevel-1]){
                                    this._levelComplete();
                                    _iCurState = STATE_HOOK_ROTATE;
                                    return;
                                }else{
                                    _aPrevRectList.push( new createjs.Rectangle(_oCurBlock.getX() - _oCurBlock.getHalfWidth(),_oCurBlock.getY(),_oCurBlock.getWidth(),_oCurBlock.getHeight()));
                                    this._attachNextBlock();
                                }
                                playSound("fall_ok",1,false);                                    
                            }
                            _iCurState = STATE_BLOCK_ROTATE;
                        }else{
                            //BAD PLACED
                            _bBlock = true;
                            _iNumBlockFalling = 1;

                            _aPiledBlocks.pop();
                            _oCurBlock.setY(_aPrevRectList[_aPrevRectList.length-1].y);
                            this._blockMisplaced(_oCurBlock);
                            _iCurState = STATE_BLOCK_MISPLACED;
                        }
                        
                    }else if(_oCurBlock.getYBase() > CANVAS_HEIGHT){
                        //BUILDING MISSED
                        this.loseLife();
                        _iNumBlockFalling = 1;

                        _iCont = 1;
                        _aPiledBlocks.pop();
                        _oCurBlock.unload();
                        this.blockFall(); 
                        
                        _iCurState = STATE_BLOCK_ROTATE;
                    }
                    break;
            }
            case STATE_BLOCK_MISPLACED:{
                    
                    break;
            }
            case STATE_SHOW_THE_TOWER:{
                    if(_oBgContainer.y > (CANVAS_HEIGHT -  BG_HEIGHT)){
                        _oBgContainer.y -= SPEED_TOWER_SHOWING;
                        _oBonusContainer.y -= SPEED_TOWER_SHOWING;
                        
                        for(var i=0;i<_aPiledBlocks.length;i++){
                            _aPiledBlocks[i].decreaseY(SPEED_TOWER_SHOWING)
                        }
                        
                        _oCrane.y -= SPEED_TOWER_SHOWING;
                        _oHook.decreseY(SPEED_TOWER_SHOWING);
                    }else{
                        _iCurState = -1;
                        var oParent = this;
                        createjs.Tween.get(_oFade).to({alpha:1}, 1000,createjs.Ease.cubicOut).call(function(){
                                                                                                oParent._resetLevel();
                                                                                                createjs.Tween.get(_oFade).to({alpha:0}, 1000,createjs.Ease.cubicOut);
                                                                                            });
                    }
                    
                    break;
            }
        }
        
        s_oRollingTextManager.update();
    };
    
    s_oGame = this;
    
    START_HOOK_ROT_SPEED = oData.start_hook_rot_speed;
    HOOK_ROT_INCREASE_FACTOR = oData.hook_rot_increase;
    HOOK_MAX_ROT = oData.hook_max_rot;
    NUM_LIVES = oData.num_lives;
    BEST_MULTIPLIER = oData.best_mult;
    MULTIPLIER_BONUS_POINT = oData.bonus_mult;
    FALL_SPEED = oData.block_fall_speed;
    NUM_LEVELS = oData.levels.length;
    
    this._init(oData.levels);
}

var s_oGame = null;
function CGameOver(iX,iY){
    var _oMsgText;
    var _oMsgTextStroke;
    var _oScoreText;
    var _oScoreTextStroke;
    var _oButPlayAgain;
    var _oButBackHome;
    var _oContainer;
    var _oScore;
    
    this._init = function(iX,iY){
        _oContainer = new createjs.Container();
        _oContainer.alpha = 0;
        _oContainer.x = iX;
        _oContainer.y = iY;
        s_oStage.addChild(_oContainer);

	var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);

        var iWidth = 500;
        var iHeight = 90;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 820;
        _oMsgTextStroke = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#B11821", FONT_GAME, 1,
                    2, 2,
                    TEXT_GAMEOVER,
                    true, true, true,
                    false );
        _oMsgTextStroke.setOutline(4);            

        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#FFFFFF", FONT_GAME, 1,
                    2, 2,
                    TEXT_GAMEOVER,
                    true, true, true,
                    false );

        var iWidth = 500;
        var iHeight = 250;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 1020;
        _oScoreTextStroke = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    100, "center", "#B11821", FONT_GAME, 1,
                    2, 2,
                    TEXT_SCORE +":\n0",
                    true, true, true,
                    false );
        _oScoreTextStroke.setOutline(4);            

        _oScoreText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    100, "center", "#FFFFFF", FONT_GAME, 1,
                    2, 2,
                    TEXT_SCORE +":\n0",
                    true, true, true,
                    false );
       
       
	// _oButPlayAgain = new CGfxButton(860,1340,s_oSpriteLibrary.getSprite('but_play_again'),_oContainer);
 //        _oButPlayAgain.addEventListener(ON_MOUSE_UP, this.onButPlayAgainRelease, this);
		
	_oButBackHome = new CGfxButton(CANVAS_WIDTH/2,1340,s_oSpriteLibrary.getSprite('but_play'),_oContainer);
        _oButBackHome.addEventListener(ON_MOUSE_UP, this._onButBackHomeRelease, this);
        
    };
    
    this.show = function(iScore){
        _oScore = iScore;
        _oScoreText.refreshText( TEXT_SCORE +":\n"+iScore );
        _oScoreTextStroke.refreshText(  TEXT_SCORE +":\n"+iScore );
        
	createjs.Tween.get(_oContainer).to({alpha:1}, 500);
        
        setVolume("soundtrack",1);
    };
    // ini jd button ke input data
    this._onButBackHomeRelease = function(){

        //
        var _oInputPanel = new CInputPanel(0,0);
        //
        _oInputPanel.show(_oScore);
        //s_oGame.onExit();
    };
	
    this.onButPlayAgainRelease = function(){
        _oContainer.alpha = 0;
        s_oGame.unload();
        s_oMain.gotoGame();
    };
    
    this.isVisible = function(){
        return _oContainer.alpha===0?false:true;
    };
	
    this._init(iX,iY);
}
function CGameSettings(aBlocksPerLevels){
    
    this._init = function(aBlocksPerLevels){
        this._initBlockSpriteSheet(aBlocksPerLevels.length);
        this._initLevelInfo(aBlocksPerLevels);
        
        s_aTrembleSequence = new Array({x:10,y:0},{x:-20,y:0},{x:10,y:-10},{x:0,y:20},{x:10,y:-10},{x:-10,y:0});
    };
    
    this._initBlockSpriteSheet = function(iNumLevels){
        //BLOCK SPRITESHEETS
        s_aBlockSize = new Array();
        for(var k=0;k<iNumLevels;k++){
            s_aBlockSize[k] = new Array();
            for(var t=0;t<8;t++){
                s_aBlockSize[k][t] = {width:264,height:120};
            }
        }

        //BLOCK SPRITESHEET
        s_aBlockSpriteSheet = new Array();
        var iCont = 1;
        for(var s=0;s<iNumLevels;s++){
            if(iCont === 4){
                iCont = 1;
            }
            var oData = {   
                        images: [s_oSpriteLibrary.getSprite('block'+iCont)], 
                        frames: {width: 264, height: 120, regX: 132, regY: 0}, 

                        animations: {  block_0: [0], block_1:[1], block_2: [2],block_3: [3], block_4:[4], block_5: [5],block_6: [6], block_7:[7]}
                   };

            s_aBlockSpriteSheet[s] = new createjs.SpriteSheet(oData); 
            
            iCont++;
        }
        
    };
    
    this._initLevelInfo = function(aBlocksPerLevels){
        s_aHookSpeed = new Array();
        s_aHookSpeed[0] = START_HOOK_ROT_SPEED;
        for(var i=1;i<NUM_LEVELS;i++){
            s_aHookSpeed[i] = parseFloat( (s_aHookSpeed[i-1] +HOOK_ROT_INCREASE_FACTOR).toFixed(2));
        }
        
        s_aBlockSequence = new Array();
        for(var i=0;i<aBlocksPerLevels.length;i++){
            s_aBlockSequence[i] = new Array();
            for(var j=0;j<aBlocksPerLevels[i];j++){
                if(j === 0){
                    s_aBlockSequence[i][j] = 0;
                }else if(j === aBlocksPerLevels[i]-1){
                    s_aBlockSequence[i][j] = 7;
                }else{
                    s_aBlockSequence[i][j] = Math.floor(Math.random() * (6 - 1) + 1);
                }
            }
            
        }
        
        s_aBlocksPerLevel = new Array();
        for(var k=0;k<aBlocksPerLevels.length;k++){
            s_aBlocksPerLevel[k] = s_aBlockSequence[k].length;
        }
    };
                
    this._init(aBlocksPerLevels);
}

var s_aBlockSpriteSheet;
var s_aBlocksPerLevel;
var s_aBlockSize;
var s_aBlockSpeed;
var s_aHookSpeed;
var s_aTrembleSequence;
function CGfxButton(iXPos,iYPos,oSprite,oParentContainer){
    var _bDisable;
    var _iWidth;
    var _iHeight;
    var _aCbCompleted;
    var _aCbOwner;
    var _aParams = [];
    var _oListenerPress;
    var _oListenerRelease;
    
    var _oButton;
    var _oParentContainer;
    
    this._init =function(iXPos,iYPos,oSprite,oParentContainer){
        _bDisable = false;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _iWidth = oSprite.width;
        _iHeight = oSprite.height;
        
        _oButton = createBitmap( oSprite);
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
                                   
        _oButton.regX = oSprite.width/2;
        _oButton.regY = oSprite.height/2;
        _oButton.cursor = "pointer";
        oParentContainer.addChild(_oButton);
        
        _oParentContainer = oParentContainer;
        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown", _oListenerPress);
       _oButton.off("pressup" , _oListenerRelease); 
       
       _oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this._initListener = function(){
       _oListenerPress = _oButton.on("mousedown", this.buttonDown);
       _oListenerRelease = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,aParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };
    
    this.removeEventListener = function( iEvent){
        _aCbCompleted[iEvent]=null;
        _aCbOwner[iEvent] = null; 
    };
    
    this.buttonRelease = function(){
        if(_bDisable){
            return;
        }
        
        playSound("click",1,false);                                    
        
        _oButton.scaleX = 1;
        _oButton.scaleY = 1;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisable){
            return;
        }
        _oButton.scaleX = 0.9;
        _oButton.scaleY = 0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_aParams);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setX = function(iXPos){
         _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
         _oButton.y = iYPos;
    };

    this.enable = function(){
        _bDisable = false;
        
        _oButton.filters = [];

        _oButton.cache(0,0,_iWidth,_iHeight);
    };
    
    this.disable = function(){
        _bDisable = true;
        
        var matrix = new createjs.ColorMatrix().adjustSaturation(-100).adjustBrightness(40);
        _oButton.filters = [
                 new createjs.ColorMatrixFilter(matrix)
        ];
        _oButton.cache(0,0,_iWidth,_iHeight);
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };
    
    
    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };

    this._init(iXPos,iYPos,oSprite,oParentContainer);
    
    return this;
}
function CHelpPanel(oParentContainer){
    var _oText1;
    var _oTextStroke1;
    var _oText2;
    var _oTextStroke2;
    
    var _oThis;
    var _oContainer;
    var _oParentContainer;

    this._init = function(){
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        
        
        var oGraphics = new createjs.Graphics().beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        var oFade = new createjs.Shape(oGraphics);
        oFade.alpha = 0.8;
        _oContainer.addChild(oFade);
        
        var oSprite = s_oSpriteLibrary.getSprite('help1');
        var oHelpBg = createBitmap(oSprite);
        oHelpBg.regX = oSprite.width/2;
        oHelpBg.x = CANVAS_WIDTH/2;
        oHelpBg.y = 520;
        _oContainer.addChild(oHelpBg);
        
        oSprite = s_oSpriteLibrary.getSprite('help2');
        oHelpBg = createBitmap(oSprite);
        oHelpBg.regX = oSprite.width/2;
        oHelpBg.x = CANVAS_WIDTH/2 + 50;
        oHelpBg.y = 1400;
        _oContainer.addChild(oHelpBg);



        var iWidth = CANVAS_WIDTH - 400;
        var iHeight = 200;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 420;
        _oTextStroke1 = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    60, "center", "#000000", FONT_GAME, 0.8,
                    2, 2,
                    TEXT_HELP1,
                    true, true, true,
                    false );
        _oTextStroke1.setOutline(4);            

        _oText1 = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    60, "center", "#FFFFFF", FONT_GAME, 0.8,
                    2, 2,
                    TEXT_HELP1,
                    true, true, true,
                    false );

        var iWidth = CANVAS_WIDTH - 400;
        var iHeight = 200;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 1320;
        _oTextStroke2 = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    60, "center", "#000000", FONT_GAME, 0.8,
                    2, 2,
                    TEXT_HELP2,
                    true, true, true,
                    false );
        _oTextStroke1.setOutline(4);            

        _oText2 = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    60, "center", "#FFFFFF", FONT_GAME, 0.8,
                    2, 2,
                    TEXT_HELP2,
                    true, true, true,
                    false );
       
        var oParent = this;
        _oContainer.on("pressup",function(){oParent._onExitHelp();});
    };

    this.unload = function(){
        _oParentContainer.removeChild(_oContainer);

        var oParent = this;
        _oContainer.off("pressup",function(){oParent._onExitHelp();});
    };

    this._onExitHelp = function(){
        _oThis.unload();
        
        s_oGame.startGame();
    };

    _oParentContainer = oParentContainer;
    _oThis = this;
    
    this._init();

}

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

function CInputPanel(iX,iY){
    var _oMsgText;
    var _oMsgTextStroke;
    var _oScoreText;
    var _oScoreTextStroke;
    var _oButPlayAgain;
    var _oButBackHome;
    var _oContainer;
    var _oScore;
    //
    var _oNameText;
    var _oNameTextStroke;
    var _oPhoneText;
    var _oPhoneTextStroke;
    var _oEmailText;
    var _oEmailTextStroke;
    //
    var nameInputElement;
    var phoneInputElement;
    var emailInputElement;
    
    this._init = function(iX,iY){
        // akses input field
        nameInputElement = document.getElementById('nameInput');
        phoneInputElement = document.getElementById('phoneInput');
        emailInputElement = document.getElementById('emailInput');
        this.enableKeyboardInput();
        //
        _oContainer = new createjs.Container();
        _oContainer.alpha = 0;
        _oContainer.x = iX;
        _oContainer.y = iY;
        s_oStage.addChild(_oContainer);

	    var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box2');
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);

        var iWidth = 500;
        var iHeight = 90;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 820;
        _oMsgTextStroke = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#B11821", FONT_GAME, 1,
                    2, 2,
                    TEXT_GAMEOVER,
                    true, true, true,
                    false );
        _oMsgTextStroke.setOutline(4);            

        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#FFFFFF", FONT_GAME, 1,
                    2, 2,
                    TEXT_GAMEOVER,
                    true, true, true,
                    false );

        var iWidth = 500;
        var iHeight = 250;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 1020;

    // Name Label
    _oNameTextStroke = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*45.5/100, iWidth, iHeight, 
                40, "center", "#B11821", FONT_GAME, 1.1,
                36, 0,
                "",
                true, true, false,
                false );
            
    _oNameTextStroke.setOutline(5);

    _oNameText = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*45.5/100, oSpriteBg.width, 70, 
                40, "center", "#FFFFFF", FONT_GAME, 1.1,
                50, 0,
                "",
                true, true, false,
                false );
    // Phone Label
    _oPhoneTextStroke = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*50.5/100, oSpriteBg.width, 70, 
                40, "center", "#B11821", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
                
    _oPhoneTextStroke.setOutline(5);

    _oPhoneText = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*50.5/100, oSpriteBg.width, 70, 
                40, "center", "#FFFFFF", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
    // Email Label
    _oEmailTextStroke = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*56/100, oSpriteBg.width, 70, 
                40, "center", "#B11821", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
                
    _oEmailTextStroke.setOutline(5);

    _oEmailText = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*56/100, oSpriteBg.width, 70, 
                40, "center", "#FFFFFF", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
    //
   
	_oButPlayAgain = new CGfxButton(860,1340,s_oSpriteLibrary.getSprite('but_play_again'),_oContainer);
        _oButPlayAgain.addEventListener(ON_MOUSE_UP, this.onButPlayAgainRelease, this);
		
	_oButBackHome = new CGfxButton(540,1340,s_oSpriteLibrary.getSprite('but_back_home'),_oContainer);
        _oButBackHome.addEventListener(ON_MOUSE_UP, this._onButBackHomeRelease, this);
        
    };
    
    this.show = function(iScore){
        _oScore = iScore;
        this.inputVisibility(true);


        _oMsgText.refreshText("Data");
        _oMsgTextStroke.refreshText("Data");

        createjs.Tween.get(_oContainer).to({alpha:1}, 500);

        _oNameTextStroke.refreshText("Name");
        _oNameText.refreshText("Name");

        _oPhoneTextStroke.refreshText("Phone");
        _oPhoneText.refreshText("Phone");

        _oEmailTextStroke.refreshText("Email");
        _oEmailText.refreshText("Email");
        
        setVolume("soundtrack",1);
        
    };
    this.inputVisibility = function (x){
        if(x == true){
            $("#nameInput").fadeIn(1000);
            $("#phoneInput").fadeIn(1000);
            $("#emailInput").fadeIn(1000);
        }
        else{
            $("#nameInput").fadeOut(10);
            $("#phoneInput").fadeOut(10);
            $("#emailInput").fadeOut(10);
        }
    }
    this.inputGetValue = function(){
        var nameVal = nameInputElement.value;
        var phoneVal = phoneInputElement.value;
        var emailVal = emailInputElement.value;
        var scoreVal = _oScore;
        if(nameVal == "" || phoneVal == "" || emailVal == ""){
            // alert("Isi data");
            return false;
        }

        nameInputElement.value = "";
        phoneInputElement.value = "";
        emailInputElement.value = "";
        doRecordVisit();
        saveData(nameVal,scoreVal,phoneVal,emailVal);
        this.inputVisibility(false);
        return true;

        // console.log("Name : " + nameVal);
        // console.log("Phone : " + phoneVal);
        // console.log("Email : " + emailVal);
    }
    
    this._onButBackHomeRelease = function(){
        if(this.inputGetValue()) s_oGame.onExit();
    };
	
    this.onButPlayAgainRelease = function(){
        if(this.inputGetValue()){
            _oContainer.alpha = 0;
            s_oGame.unload();
            s_oMain.gotoGame();
        }
    };
    
    this.isVisible = function(){
        return _oContainer.alpha===0?false:true;
    };

    this.enableKeyboardInput = function(){
        $("#nameInput").off('keydown');
        $("#phoneInput").off('keydown');
        $("#emailInput").off('keydown');

        $("#nameInput").on('keydown', (e) => {
            if(e.key === "Backspace") nameInputElement.value = nameInputElement.value.slice(0,nameInputElement.value.length-1);
            else if(e.key.length == 1) nameInputElement.value += e.key;
        })
        $("#phoneInput").on('keydown', (e) => {
            if(e.key === "Backspace") phoneInputElement.value = phoneInputElement.value.slice(0,phoneInputElement.value.length-1);
            else if(e.key.length == 1) phoneInputElement.value += e.key;
        })
        $("#emailInput").on('keydown', (e) => {
            if(e.key === "Backspace") emailInputElement.value = emailInputElement.value.slice(0,emailInputElement.value.length-1);
            else if(e.key.length == 1) emailInputElement.value += e.key;
        })
    }
	
    this._init(iX,iY);
}
function CInterface(){
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosScoreContainer;
    var _pStartPosFloorContainer;
    var _pStartPosFullscreen;
    
    var _oNumBlockText;
    var _oLivesTextStroke;
    var _oLivesText;
    var _oNumScoreStroke;
    var _oNumScore;
    var _oNumBlockTextStroke;
    var _oExitBut;
    var _oAudioToggle;
    var _oBestNumScore;
    var _oScoreContainer;
    var _oFloorContainer;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    this._init = function(){
        _pStartPosScoreContainer = {x:10,y:10};
        _oScoreContainer = new createjs.Container();
        _oScoreContainer.x = _pStartPosScoreContainer.x;
        _oScoreContainer.y = _pStartPosScoreContainer.y;
        s_oStage.addChild(_oScoreContainer);
        
        var oScoreBg = createBitmap(s_oSpriteLibrary.getSprite('information_panel'));
        _oScoreContainer.addChild(oScoreBg);
        
        _oNumScoreStroke = new createjs.Text("0","50px "+FONT_GAME, "#000000");
        _oNumScoreStroke.x = 80;
        _oNumScoreStroke.y = 50;
        _oNumScoreStroke.outline = 4;
        _oNumScoreStroke.textAlign = "left";
	_oNumScoreStroke.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oNumScoreStroke);
        
        _oNumScore = new createjs.Text("0","50px "+FONT_GAME, "#FFFFFF");
        _oNumScore.x = 80;
        _oNumScore.y = 50;
        _oNumScore.textAlign = "left";
	_oNumScore.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oNumScore);
        
        _oLivesTextStroke = new createjs.Text("" ,"50px "+FONT_GAME, "#000000");
        _oLivesTextStroke.x = 80;
        _oLivesTextStroke.y = 110;
        _oLivesTextStroke.outline = 4;
        _oLivesTextStroke.textAlign = "left";
	_oLivesTextStroke.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oLivesTextStroke);
        
        _oLivesText = new createjs.Text("" ,"50px "+FONT_GAME, "#FFFFFF");
        _oLivesText.x = 80;
        _oLivesText.y = 110;
        _oLivesText.textAlign = "left";
	_oLivesText.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oLivesText);
        
        var oSpriteFloor = s_oSpriteLibrary.getSprite('floor_icon');
        _pStartPosFloorContainer = {x: CANVAS_WIDTH - oSpriteFloor.width - 20,y:CANVAS_HEIGHT - EDGEBOARD_Y  };
        
        _oFloorContainer = new createjs.Container();
        _oFloorContainer.x = _pStartPosFloorContainer.x;
        _oFloorContainer.y = _pStartPosFloorContainer.y;
        s_oStage.addChild(_oFloorContainer);

        var oFloorIcon = createBitmap(oSpriteFloor);
        _oFloorContainer.addChild(oFloorIcon);
        
        _oNumBlockTextStroke = new createjs.Text(0 ,"60px "+FONT_GAME, "#000000");
        _oNumBlockTextStroke.x =  oSpriteFloor.width/2 + 3;
        _oNumBlockTextStroke.y =  30;
        _oNumBlockTextStroke.outline = 4;
        _oNumBlockTextStroke.textAlign = "center";
	_oNumBlockTextStroke.textBaseline  = "middle";
        _oFloorContainer.addChild(_oNumBlockTextStroke);
        
        _oNumBlockText = new createjs.Text(0 ,"60px "+FONT_GAME, "#FFFFFF");
        _oNumBlockText.x = oSpriteFloor.width/2 + 3;
        _oNumBlockText.y = 30;
        _oNumBlockText.textAlign = "center";
	_oNumBlockText.textBaseline  = "middle";
        _oFloorContainer.addChild(_oNumBlockText);
        
        var oSprite = s_oSpriteLibrary.getSprite('exit_button');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10}; 
        _oExitBut = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,s_oStage);
        _oExitBut.addEventListener(ON_MOUSE_UP, this._onButExitRelease, this);
        
	if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - (oSprite.width/2) - 10, y: (oSprite.height/2) + 10}; 
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 - 10 ,y:_pStartPosAudio.y};
        }else{
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: _pStartPosExit.x - (oSprite.width/2) - 10, y: (oSprite.height/2) + 10}; 
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        _oExitBut.unload();
        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        s_oInterface = null;
    };
	
    this.reset = function(iBlocks,iLives){
        _oNumBlockText.text = iBlocks;
        _oNumBlockTextStroke.text = iBlocks;
        _oLivesText.text = "x" + iLives;
        _oLivesTextStroke.text = "x" + iLives;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oExitBut.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oScoreContainer.x = _pStartPosScoreContainer.x + iNewX;
        _oScoreContainer.y = _pStartPosScoreContainer.y + iNewY;
        _oFloorContainer.x = _pStartPosFloorContainer.x - iNewX;
        _oFloorContainer.y = _pStartPosFloorContainer.y - iNewY;
    };
    
    this.refreshNumBlocks = function(iBlocks){
        _oNumBlockText.text = iBlocks;
        _oNumBlockTextStroke.text = iBlocks;
    };

    this.refreshScore = function(iAmountToIncrease){
        s_oRollingTextManager.add(_oNumScore,_oNumScoreStroke,iAmountToIncrease,1000,EASE_LINEAR,null);
    };

    this.refreshBestScore = function(iBestScore){
        _oBestNumScore.text = iBestScore;
    };
    
    this.refreshLives = function(iLives){
        _oLivesText.text = "x"+iLives;
        _oLivesTextStroke.text = "x"+iLives;
    };
    
    this.showMultiplier = function(iLevelMultiplier){
        var szEncouragment;
        if(iLevelMultiplier > 1.9){
            szEncouragment = TEXT_PERFECT;
        }else if(iLevelMultiplier > 1.8 && iLevelMultiplier <= 1.9){
            szEncouragment = TEXT_GREAT;
        }else if(iLevelMultiplier >1.5 && iLevelMultiplier<= 1.8){
            szEncouragment = TEXT_GOOD;
        }else{
            szEncouragment = TEXT_BAD;
            s_oGame.tweenTrajectory(1,10);
        }
        
        var oMultiplierTextStroke = new createjs.Text(szEncouragment+"\nX "+iLevelMultiplier,"80px "+FONT_GAME, "#000000");
        oMultiplierTextStroke.lineHeight = 90;
        oMultiplierTextStroke.x = CANVAS_WIDTH/2;
        oMultiplierTextStroke.y = -100;
        oMultiplierTextStroke.textAlign = "center";
	oMultiplierTextStroke.textBaseline  = "alphabetic";
        oMultiplierTextStroke.outline = 8;
        s_oStage.addChild(oMultiplierTextStroke);
        
        var oMultiplierText = new createjs.Text(szEncouragment+"\nX "+iLevelMultiplier,"80px "+FONT_GAME, "#FFFFFF");
        oMultiplierText.lineHeight = 90;
        oMultiplierText.x = CANVAS_WIDTH/2;
        oMultiplierText.y = -100;
        oMultiplierText.textAlign = "center";
	oMultiplierText.textBaseline  = "alphabetic";
        s_oStage.addChild(oMultiplierText);
        
        createjs.Tween.get(oMultiplierText).to({y:250}, 500,createjs.Ease.elasticOut).call(function(){
                                                            createjs.Tween.get(oMultiplierText).wait(600).to({y:-100}, 200,createjs.Ease.cubicOut).call(function(){
                                                                                                            s_oStage.removeChild(oMultiplierText);
                                                                                            });                                    
                                                            });
                                                            
        createjs.Tween.get(oMultiplierTextStroke).to({y:250}, 500,createjs.Ease.elasticOut).call(function(){
                                                            createjs.Tween.get(oMultiplierTextStroke).wait(600).to({y:-100}, 200,createjs.Ease.cubicOut).call(function(){
                                                                                                            s_oStage.removeChild(oMultiplierTextStroke);
                                                                                            });                                    
                                                            });                                                    
    };
    
    this.levelComplete = function(iLevel){
        var oLevelOutlineText = new createjs.Text(TEXT_CONGRATS + "\n" + TEXT_LEVEL +" "+ iLevel+" "+TEXT_COMPLETED + "!","100px "+FONT_GAME, "#000000");
        oLevelOutlineText.textAlign="center";
        oLevelOutlineText.lineWidth = 550;
        oLevelOutlineText.outline = 8;
        oLevelOutlineText.scaleX = oLevelOutlineText.scaleY = 3;
        oLevelOutlineText.x = CANVAS_WIDTH/2;
        oLevelOutlineText.y = CANVAS_HEIGHT/2
        s_oStage.addChild(oLevelOutlineText);
        
        var oLevelText = new createjs.Text(TEXT_CONGRATS + "\n" + TEXT_LEVEL +" "+ iLevel+" "+TEXT_COMPLETED + "!","100px "+FONT_GAME, "#FFFFFF");
        oLevelText.textAlign="center";
        oLevelText.lineWidth = 550;
        oLevelText.scaleX = oLevelText.scaleY = 3;
        oLevelText.x = CANVAS_WIDTH/2;
        oLevelText.y = CANVAS_HEIGHT/2
        s_oStage.addChild(oLevelText);

        var oParent = this;
        createjs.Tween.get(oLevelText).to({scaleX:1,scaleY:1}, 1500, createjs.Ease.elasticOut).call(function(){oParent.fadeOutLevelCompleteText(oLevelText,oLevelOutlineText)});
        createjs.Tween.get(oLevelOutlineText).to({scaleX:1,scaleY:1}, 1500, createjs.Ease.elasticOut);

    };
    
    this.showLevelCompleteText = function(iLevel){
        var oLevelOutlineText = new createjs.Text("COMPLIMENTI, HAI SUPERATO IL " + iLevel+ "° LIVELLO!","70px "+FONT_GAME, "#000000");
        oLevelOutlineText.textAlign="center";
        oLevelOutlineText.lineWidth = 550;
        oLevelOutlineText.outline = 5;
        oLevelOutlineText.x = CANVAS_WIDTH/2;
        oLevelOutlineText.y = -50;
        s_oStage.addChild(oLevelOutlineText);
        
        var oLevelText = new createjs.Text("COMPLIMENTI, HAI SUPERATO IL " + iLevel+ "° LIVELLO!","70px "+FONT_GAME, "#FFFFFF");
        oLevelText.textAlign="center";
        oLevelText.lineWidth = 550;
        oLevelText.x = CANVAS_WIDTH/2;
        oLevelText.y = -50;
        s_oStage.addChild(oLevelText);

        var oParent = this;
        createjs.Tween.get(oLevelText).to({y:CANVAS_HEIGHT/2 - 150}, 1500, createjs.Ease.bounceOut).call(function(){oParent.fadeOutLevelCompleteText(oLevelText,oLevelOutlineText)});
        createjs.Tween.get(oLevelOutlineText).to({y:CANVAS_HEIGHT/2 - 150}, 1500, createjs.Ease.bounceOut);
    };
    
    this.fadeOutLevelCompleteText = function(oLevelText,oLevelOutlineText){
        createjs.Tween.get(oLevelText).to({alpha:0}, 1000, createjs.Ease.quadIn).call(function(){
                                                    s_oStage.removeChild(oLevelText);s_oGame.showAllTower();});  
                                                
        createjs.Tween.get(oLevelOutlineText).to({alpha:0}, 1000, createjs.Ease.quadIn).call(function(){
                                                    s_oStage.removeChild(oLevelOutlineText);});  
    };
    
    this._onButExitRelease = function(){
        s_oGame.onExit();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };


    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();

    };
    
    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;
var TEXT_GAMEOVER   = "GAME OVER";
var TEXT_CONGRATS   = "CONGRATULATIONS!!";
var TEXT_WIN        = "YOU WIN!!!";
var TEXT_PLAY       = "PLAY";
var TEXT_EXIT       = "EXIT";
var TEXT_SCORE      = "SCORE";
var TEXT_BEST_SCORE = "BEST";
var TEXT_LEVEL      = "LEVEL";
var TEXT_LIVES      = "LIVES";
var TEXT_COMPLETED  = "COMPLETED";
var TEXT_PERFECT    = "PERFECT!!";
var TEXT_GREAT      = "GREAT!";
var TEXT_GOOD       = "GOOD";
var TEXT_BAD        = "TOO BAD!!";
var TEXT_MULTIPLIER = "YOUR MULTIPLIER IS";
var TEXT_HELP1      = "DROP THE BLOCKS IN THE CENTER OF THE SCREEN TO GET BEST SCORE MULTIPLIER!!";
var TEXT_HELP2      = "STACK BLOCKS PERFECTLY TO GET AN EXTRA BONUS!";
var TEXT_CREDITS_DEVELOPED = "DEVELOPED BY";
var TEXT_PRELOADER_CONTINUE = "START";

var TEXT_SHARE_IMAGE = "200x200.jpg";
var TEXT_SHARE_TITLE = "Congratulations!";
var TEXT_SHARE_MSG1 = "You collected <strong>";
var TEXT_SHARE_MSG2 = " points</strong>!<br><br>Share your score with your friends!";
var TEXT_SHARE_SHARE1 = "My score is ";
var TEXT_SHARE_SHARE2 = " points! Can you do better?";
function CCreditsPanel() {

    var _oBg;
    var _oButLogo;
    var _oButExit;
    var _oMsgText;
    var _oMsgTextOutline;

    var _oHitArea;

    var _oLink;
    var _oLinkOutline;

    var _pStartPosExit;

    var _oContainer;

    this._init = function () {
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.5;
        _oHitArea.on("click", this._onLogoButRelease);
        _oHitArea.cursor = "pointer";
        _oContainer.addChild(_oHitArea);

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH/2;
        _oBg.y = CANVAS_HEIGHT/2;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;

        _oContainer.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('exit_button');
        _pStartPosExit = {x: CANVAS_WIDTH * 0.5 + 230, y: 780};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);

        var iWidth = 450;
        var iHeight = 60;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT * 0.5 -74;
        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    50, "center", "#ffffff", FONT_GAME, 1,
                    2, 2,
                    TEXT_CREDITS_DEVELOPED,
                    true, true, true,
                    false );


        oSprite = s_oSpriteLibrary.getSprite('logo_ctl');
        _oButLogo = createBitmap(oSprite);
        _oButLogo.regX = oSprite.width / 2;
        _oButLogo.regY = oSprite.height / 2;
        _oButLogo.x = CANVAS_WIDTH / 2;
        _oButLogo.y = CANVAS_HEIGHT/2;
        _oContainer.addChild(_oButLogo);

        var iWidth = 450;
        var iHeight = 50;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT * 0.5 +70;
        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    40, "center", "#ffffff", FONT_GAME, 1,
                    2, 2,
                    "WWW.CODETHISLAB.COM",
                    true, true, true,
                    false );
       
    };

    this.unload = function () {
        _oHitArea.off("click", this._onLogoButRelease);

        _oButExit.unload();
        _oButExit = null;

        s_oStage.removeChild(_oContainer);
    };

    this._onLogoButRelease = function () {
        window.open("http://www.codethislab.com/index.php?&l=en", "_blank");
    };

    this._init();


}



function CMain(oData){
    var _bUpdate = true;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    
    var _oData;
    var _oPreloader;
    var _oHelp;
    var _oMenu;
    var _oGame;

    var _oSplash;
    this.initContainer = function(){
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas); 
        s_oStage.preventSelection = false;
        createjs.Touch.enable(s_oStage);
        
        s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
        }
        s_iPrevTime = new Date().getTime();

        createjs.Ticker.framerate = FPS;
	createjs.Ticker.addEventListener("tick", this._update);
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
    };

    this.soundLoaded = function(){
         _iCurResource++;
         var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        _oPreloader.refreshLoader(iPerc);
    };

    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);
        
        s_aSoundsInfo = new Array();
        s_aSoundsInfo.push({path: './sounds/',filename:'bonus',loop:false,volume:1, ingamename: 'bonus'});
        s_aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'end_level',loop:false,volume:1, ingamename: 'end_level'});
        s_aSoundsInfo.push({path: './sounds/',filename:'fall_fail',loop:false,volume:1, ingamename: 'fall_fail'});
        s_aSoundsInfo.push({path: './sounds/',filename:'fall_ok',loop:false,volume:1, ingamename: 'fall_ok'});
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
        
    };  
    
    this.tryToLoadSound = function(oSoundInfo, bDelay){
        
       setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                                                            src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: oSoundInfo.loop, 
                                                            volume: oSoundInfo.volume,
                                                            onload: s_oMain.soundLoaded,
                                                            onloaderror: function(szId,szMsg){
                                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                         s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                                                         break;
                                                                                     }
                                                                                }
                                                                        },
                                                            onplayerror: function(szId) {
                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                          s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                                                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                                                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                                                                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                                                                                            }

                                                                                          });
                                                                                         break;
                                                                                     }
                                                                                 }
                                                                       
                                                            } 
                                                        });

            
        }, (bDelay ? 200 : 0) );
    };
    
    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );
        
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("bonus","./sprites/bonus.png");
        s_oSpriteLibrary.addSprite("hook","./sprites/hook.png");
        s_oSpriteLibrary.addSprite("crane","./sprites/crane.png");
        s_oSpriteLibrary.addSprite("block1","./sprites/block1.png");
        s_oSpriteLibrary.addSprite("block2","./sprites/block2.png");
        s_oSpriteLibrary.addSprite("block3","./sprites/block3.png");
        s_oSpriteLibrary.addSprite("but_back_home","./sprites/but_back_home.png");
        s_oSpriteLibrary.addSprite("but_play_again","./sprites/but_play_again.png");
        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("hit_area","./sprites/hit_area.png");
        s_oSpriteLibrary.addSprite("game_bg","./sprites/game_bg.jpg");
        s_oSpriteLibrary.addSprite("perfect_landing","./sprites/perfect_landing.png");
        s_oSpriteLibrary.addSprite("logo","./sprites/logo.png");
        s_oSpriteLibrary.addSprite("exit_button","./sprites/exit_button.png");
        s_oSpriteLibrary.addSprite("bird","./sprites/bird.png");
        s_oSpriteLibrary.addSprite("cloud_1","./sprites/cloud_1.png");
        s_oSpriteLibrary.addSprite("cloud_2","./sprites/cloud_2.png");
        s_oSpriteLibrary.addSprite("cloud_3","./sprites/cloud_3.png");
        s_oSpriteLibrary.addSprite("cloud_4","./sprites/cloud_4.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("information_panel","./sprites/information_panel.png");
        s_oSpriteLibrary.addSprite("floor_icon","./sprites/floor_icon.png");
        s_oSpriteLibrary.addSprite("help1","./sprites/help1.jpg");
        s_oSpriteLibrary.addSprite("help2","./sprites/help2.png");
        s_oSpriteLibrary.addSprite("trajectory","./sprites/trajectory.png");
        s_oSpriteLibrary.addSprite("logo_ctl","./sprites/logo_ctl.png");
        s_oSpriteLibrary.addSprite("but_info","./sprites/but_info.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");

        s_oSpriteLibrary.addSprite("msg_box2","./sprites/msg_box2.png");
        s_oSpriteLibrary.addSprite("logo_glo", "./sprites/logo_glo.png");
        s_oSpriteLibrary.addSprite("logo_glogames", "./sprites/logo_glogames.png");
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();

        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        _oPreloader.refreshLoader(iPerc);
    };
    
    this.preloaderReady = function(){
        this._loadImages();
		
	if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
    };
    
    this._onRemovePreloader = function(){
        _oPreloader.unload();

        s_oSoundTrack = playSound("soundtrack", 1, true);

        // this.gotoMenu();
        this.gotoSplash();
    };
    
    this._onAllImagesLoaded = function(){
        
    };


    this.gotoSplash = function(){
        _oSplash = new CSplashScreen();
    }
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    
    this.gotoGame = function(){
        _oGame = new CGame(_oData);   
							
        _iState = STATE_GAME;
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };
    
    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };

    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);
    };
    
    s_oMain = this;
    _oData = oData;
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    s_bAudioActive = oData.audio_enable_on_startup;


    this.initContainer();
}

var s_bMobile;
var s_bAudioActive = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oRollingTextManager;
var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack = null;
var s_bFullscreen = false;
var s_aSounds;
var s_aSoundsInfo;
function CMenu(){
    var _pStartPosAudio;
    var _pStartPosLogo;
    // var _pStartPosInfo;
    var _pStartPosFullscreen;
    
    var _oBg;
    var _oButPlay;
    var _oLogo;
    var _oFade;
    var _oAudioToggle;
    // var _oButInfo;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    this._init = function(){
        _oBg = new createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);
        
        var oSprite = s_oSpriteLibrary.getSprite('logo');
        _pStartPosLogo = {x:CANVAS_WIDTH/2,y:120};
        _oLogo = new createBitmap(oSprite);
        _oLogo.x = _pStartPosLogo.x;
        _oLogo.y = _pStartPosLogo.y; 
        _oLogo.regX = oSprite.width/2;
        s_oStage.addChild(_oLogo);

        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((CANVAS_WIDTH/2),CANVAS_HEIGHT/2 - 90,oSprite,s_oStage);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};   
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
			

            setVolume("soundtrack",1);
            	 
        }
        
        // var oSpriteInfo = s_oSpriteLibrary.getSprite("but_info");
        // _pStartPosInfo = {x: (oSpriteInfo.height / 2) + 10, y: (oSpriteInfo.height / 2) + 10};
        // _oButInfo = new CGfxButton(_pStartPosInfo.x, _pStartPosInfo.y, oSpriteInfo, s_oStage);
        // _oButInfo.addEventListener(ON_MOUSE_UP, this._onButInfoRelease, this);
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: (oSprite.height / 2) + 10, y: (oSprite.height / 2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        
        if(s_bMobile === false){
            document.onkeydown   = onKeyDown; 
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        _oButPlay.unload(); 
        _oButPlay = null;
        // _oButInfo.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        s_oStage.removeAllChildren();
        s_oMenu = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
            
        }   
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        // _oButInfo.setPosition(_pStartPosInfo.x + iNewX, _pStartPosInfo.y + iNewY);
        
        _oLogo.y = _pStartPosLogo.y + iNewY;
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    // this._onButInfoRelease = function () {
    //     var oCreditsPanel = new CCreditsPanel();
    // };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };


    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();

    };
    
    function onKeyDown(evt) { 
        if(!evt){ 
            evt = window.event; 
        }  

        switch(evt.keyCode) {  
           // spacebar  
           case 32: {
                   s_oMenu._onButPlayRelease();
                   break; 
               }
        }  
        evt.preventDefault();
        return false;
    }
    
    this._onButPlayRelease = function(){
        s_oMenu.unload();

        s_oMain.gotoGame();
        $(s_oMain).trigger("start_session");
    };
	
    s_oMenu = this;
        
    this._init();
}

var s_oMenu = null;

function CPreloader() {
    var _iMaskWidth;
    var _iMaskHeight;
    var _oLoadingText;
    var _oProgressBar;
    var _oMaskPreloader;
    var _oFade;
    var _oIcon;
    var _oIconMask;
    var _oButStart;
    var _oContainer;

    this._init = function () {
        s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
        s_oSpriteLibrary.addSprite("progress_bar", "./sprites/progress_bar.png");
        s_oSpriteLibrary.addSprite("200x200", "./sprites/200x200.jpg");
        s_oSpriteLibrary.addSprite("but_start", "./sprites/but_start.png");
        s_oSpriteLibrary.loadSprites();

        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
        
    };

    this.unload = function () {
        _oContainer.removeAllChildren();
        _oButStart.unload();
    };

    this._onImagesLoaded = function () {

    };

    this._onAllImagesLoaded = function () {
        
        this.attachSprites();

        s_oMain.preloaderReady();
        
    };

    this.attachSprites = function () {
        
        var oBg = new createjs.Shape();
        oBg.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainer.addChild(oBg);

        var oSprite = s_oSpriteLibrary.getSprite('200x200');
        _oIcon = createBitmap(oSprite);
        _oIcon.regX = oSprite.width * 0.5;
        _oIcon.regY = oSprite.height * 0.5;
        _oIcon.x = CANVAS_WIDTH/2;
        _oIcon.y = CANVAS_HEIGHT/2 - 180;
        _oContainer.addChild(_oIcon);

        _oIconMask = new createjs.Shape();
        _oIconMask.graphics.beginFill("rgba(0,0,0,0.01)").drawRoundRect(_oIcon.x - 100, _oIcon.y - 100, 200, 200, 10);
        _oContainer.addChild(_oIconMask);
        
        _oIcon.mask = _oIconMask;

        var oSprite = s_oSpriteLibrary.getSprite('progress_bar');
        _oProgressBar = createBitmap(oSprite);
        _oProgressBar.x = CANVAS_WIDTH/2 - (oSprite.width / 2);
        _oProgressBar.y = CANVAS_HEIGHT/2 + 50;
        _oContainer.addChild(_oProgressBar);

        _iMaskWidth = oSprite.width;
        _iMaskHeight = oSprite.height;
        _oMaskPreloader = new createjs.Shape();
        _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBar.x, _oProgressBar.y, 1, _iMaskHeight);

        _oContainer.addChild(_oMaskPreloader);

        _oProgressBar.mask = _oMaskPreloader;

        _oLoadingText = new createjs.Text("", "30px " + FONT_GAME, "#fff");
        _oLoadingText.x = CANVAS_WIDTH/2;
        _oLoadingText.y = CANVAS_HEIGHT/2 + 100;
        _oLoadingText.textBaseline = "alphabetic";
        _oLoadingText.textAlign = "center";
        _oContainer.addChild(_oLoadingText);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_start');
        _oButStart = new CTextButton(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, oSprite, TEXT_PRELOADER_CONTINUE, "Arial", "#000", "bold "+ 50, _oContainer);        
        _oButStart.addEventListener(ON_MOUSE_UP, this._onButStartRelease, this);
        _oButStart.setVisible(false);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainer.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha: 0}, 500).call(function () {            
            createjs.Tween.removeTweens(_oFade);
            _oContainer.removeChild(_oFade);
        });        
        
        
    };

    this._onButStartRelease = function(){
        s_oMain._onRemovePreloader();
    };

    this.refreshLoader = function (iPerc) {
        _oLoadingText.text = iPerc + "%";
        
        if (iPerc === 100) {
            s_oMain._onRemovePreloader();
            _oButStart.setVisible(false);
            _oLoadingText.visible = false;
            _oProgressBar.visible = false;
        };     

        _oMaskPreloader.graphics.clear();
        var iNewMaskWidth = Math.floor((iPerc * _iMaskWidth) / 100);
        _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBar.x, _oProgressBar.y, iNewMaskWidth, _iMaskHeight);
    };

    this._init();
}
function CRollingTextController(oTarget,oTargetStroke,iAmountToIncrease,iTime,szEasing){
    var _iCntFrames;
    var _iMaxFrames;
    var _iCurStart;
    var _iTotWin;
    var _iTime;
    var _iNextAmount;
    var _szCurEasing;
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oTarget;
    var _oTargetStroke;
    
    this._init = function(oTarget,oTargetStroke,iAmountToIncrease,iTime,szEasing){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _iTime = iTime;
        this.setUpdateInfo(iAmountToIncrease);
        
        _szCurEasing = szEasing;
        
        _oTarget = oTarget;
        _oTargetStroke = oTargetStroke;
    };
    
    this.setUpdateInfo = function(iAmountToIncrease){
        _iCurStart = parseFloat(oTarget.text);
        _iTotWin = _iCurStart + iAmountToIncrease;

        _iCntFrames = 0;
        _iMaxFrames = Math.round(_iTime/FPS);
        _iNextAmount = 0;
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.increaseValue = function(iNewAmount){
        _iNextAmount = iNewAmount;
    };
    
    this.getTarget = function(){
        return _oTarget;
    };
    
    this.update = function(){
        _iCntFrames++;
        if ( _iCntFrames > _iMaxFrames ){
            _iCntFrames = 0;
            
            _oTarget.text =  _iTotWin.toFixed(0);
            if(_oTargetStroke !== null){
                _oTargetStroke.text =  _iTotWin.toFixed(0);
            } 
            
            //CALLBACK
            if(_aCbCompleted[ON_CONTROLLER_END] !== null){
                _aCbCompleted[ON_CONTROLLER_END].call(_aCbOwner[ON_CONTROLLER_END],this);
            }
            
            if(_iNextAmount > 0){
                this.setUpdateInfo(_iNextAmount);
            }else{
                _aCbCompleted[ON_CONTROLLER_REMOVE].call(_aCbOwner[ON_CONTROLLER_REMOVE],this);
            }
            
            return;
        }
        
        var fLerpY;
        switch(_szCurEasing){
            case EASE_BACKIN: {
                    fLerpY = s_oTweenController.easeInBack( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            case EASE_BACKOUT:{
                    fLerpY = s_oTweenController.easeOutBack( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            case EASE_CUBIC_IN:{
                    fLerpY = s_oTweenController.easeInCubic( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            case EASE_CUBIC_OUT:{
                    fLerpY = s_oTweenController.easeOutCubic( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            case EASE_ELASTIC_OUT:{
                    fLerpY = s_oTweenController.easeOutElastic( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            case EASE_LINEAR:{
                    fLerpY = s_oTweenController.easeLinear( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            case EASE_QUART_BACKIN:{
                    fLerpY = s_oTweenController.easeBackInQuart( _iCntFrames, 0 ,1, _iMaxFrames);
                    break;
            }
            default:{
                    fLerpY = s_oTweenController.easeLinear( _iCntFrames, 0 ,1, _iMaxFrames);
            }
        }
        
        var iValue = s_oTweenController.tweenValue( _iCurStart, _iTotWin, fLerpY);

        //trace("iValue: "+iValue)
        _oTarget.text =  iValue.toFixed(0);
        if(_oTargetStroke !== null){
            _oTargetStroke.text =  iValue.toFixed(0);
        }        
    };
    
    this._init(oTarget,oTargetStroke,iAmountToIncrease,iTime,szEasing);
};
function CRollingTextManager(){
    
    var _aControllerList = new Array();
    var _aControllerToRemove = new Array();
    s_oTweenController = new CTweenController();
    
    this.add = function(oTarget,oTargetStroke,iAmountToIncrease,iTime,szEasing,oCallback,oCallbackOwner){
        var iCheck = this._checkIfControllerExist(oTarget);
        if( iCheck === -1){
            
            var oController = new CRollingTextController(oTarget,oTargetStroke,iAmountToIncrease,iTime,szEasing);
            oController.addEventListener(ON_CONTROLLER_END,oCallback,oCallbackOwner);
            oController.addEventListener(ON_CONTROLLER_REMOVE,this._onRemoveController,this);

            _aControllerList.push(oController);
        }else{
            _aControllerList[iCheck].increaseValue(iAmountToIncrease);
        }
        
    };
    
    this._checkIfControllerExist = function(oTarget){
        for(var i=0;i<_aControllerList.length;i++){
            if(_aControllerList[i].getTarget() === oTarget){
                return i;
            }
        }
        
        return -1;
    };
    
    this._onRemoveController = function(oController){
        _aControllerToRemove.push(oController);
    };
    
    this.update = function(){
        for(var i=0;i<_aControllerList.length;i++){
            _aControllerList[i].update();
        }
        
        //REMOVE UNUSED CONTROLLERS
        for(var j=0;j<_aControllerToRemove.length;j++){
            for(var k=0;k<_aControllerList.length;k++){
                if(_aControllerToRemove[j] === _aControllerList[k]){
                    _aControllerList.splice(k,1);
                    break;
                }
            }
        }
        
        _aControllerToRemove = new Array();
    };
}

var s_oTweenController;
function CSplashScreen() {    
    var _oBg;
    var _oFade;

    var _oLogoGLO;
    var _oLogoGLOG;

    var _oContainer;

    var _oPanel;
    var _oPanel2;

    this._init = function () {

        _oContainer = new createjs.Container();

        var oGraphics = new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        var oShape = new createjs.Shape(oGraphics);
        _oContainer.addChild(oShape);
        s_oStage.addChild(_oContainer);

        _oLogoGLO = s_oSpriteLibrary.getSprite('logo_glo');
        _oPanel = createBitmap(_oLogoGLO);
        _oPanel.regX = -200;
        _oPanel.regY = -500;
        _oPanel.visible = false;
        _oContainer.addChild(_oPanel);

        _oLogoGLOG = s_oSpriteLibrary.getSprite('logo_glogames');
        _oPanel2 = createBitmap(_oLogoGLOG);
        _oPanel2.regX = -200;
        _oPanel2.regY = -500;
        _oPanel2.visible = false;
        _oContainer.addChild(_oPanel2);

        
        this.animationLogo();
    };

    this.animationLogo = function(){
        createjs.Tween.get(_oPanel)
            .to({alpha: 0}, 0)
            .call(function () {
                createjs.Tween.get(_oPanel2)
                .to({alpha: 0}, 0)
                .call(function () {
                    createjs.Tween.get(_oPanel)
                        .to({alpha: 1, visible:true}, 250)
                        .wait(1000)
                        .to({alpha: 0, visible:false}, 250)
                        .call(function () {
                            createjs.Tween.get(_oPanel2)
                                .to({alpha: 1, visible:true}, 250)
                                .wait(1000)
                                .to({alpha: 0, visible:false}, 250)
                                .call(function () {
                                    unload();
                                });
                        });
                });
            });
    }


    function unload(){
        s_oStage.removeAllChildren();
        s_oMain.gotoMenu();
    };

    this._init();
}
function CTextButton(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize,oParentContainer){
    var _bDisable;
    var _iCurScale;
    var _iWidth;
    var _iHeight;
    var _aCbCompleted;
    var _aCbOwner;
    var _oListenerDown;
    var _oListenerUp;
    var _oParams;
    
    var _oButton;

    var _oText;
    var _oButtonBg;
    var _oParentContainer = oParentContainer;
    
    this._init =function(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize){
        _bDisable = false;
        _iCurScale = 1;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();

        _oButtonBg = createBitmap( oSprite);
	_iWidth = oSprite.width;
        _iHeight = oSprite.height;

        

        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.regX = oSprite.width/2;
        _oButton.regY = oSprite.height/2;
	if (!s_bMobile){
            _oButton.cursor = "pointer";
	}
        _oButton.addChild(_oButtonBg,_oText);

        _oParentContainer.addChild(_oButton);
        
        _oText = new CTLText(_oButton, 
                    40, 0, oSprite.width-80, oSprite.height, 
                    iFontSize, "center", szColor, szFont, 1,
                    2, 2,
                    szText,
                    true, true, false,
                    false );
                    
        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown", _oListenerDown);
       _oButton.off("pressup" , _oListenerUp); 
       
       _oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.setAlign = function(szAlign){
        _oText.textAlign = szAlign;
    };
    
    this.setTextX = function(iX){
        _oText.x = iX;
    };
    
    this.setScale = function(iScale){
        _oButton.scaleX = _oButton.scaleY = iScale;
        _iCurScale = iScale;
    };
    
    this.enable = function(){
        _bDisable = false;

    };
    
    this.disable = function(){
        _bDisable = true;

    };
    
    this._initListener = function(){
       _oListenerDown = _oButton.on("mousedown", this.buttonDown);
       _oListenerUp = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,oParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        
        _oParams = oParams;
    };
    
    this.buttonRelease = function(){
        if(_bDisable){
            return;
        }
        
        playSound("click",1,false);
        
        _oButton.scaleX = _iCurScale;
        _oButton.scaleY = _iCurScale;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_oParams);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisable){
            return;
        }
        _oButton.scaleX = _iCurScale*0.9;
        _oButton.scaleY = _iCurScale*0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.tweenPosition = function(iXPos,iYPos,iTime,iDelay,oEase,oCallback,oCallOwner){
        createjs.Tween.get(_oButton).wait(iDelay).to({x:iXPos,y:iYPos}, iTime,oEase).call(function(){
            if(oCallback !== undefined){
                oCallback.call(oCallOwner);
            }
        }); 
    };
    
    this.changeText = function(szText){
        _oText.refreshText(szText);
    };
    
    this.setX = function(iXPos){
         _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
         _oButton.y = iYPos;
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };

    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };
    
    this.getSprite = function(){
        return _oButton;
    };
    
    this.getScale = function(){
        return _oButton.scaleX;
    };

    this._init(iXPos,iYPos,oSprite,szText,szFont,szColor,iFontSize);
}
function CToggle(iXPos,iYPos,oSprite,bActive,oParentContainer){
    var _bActive;
    var _aCbCompleted;
    var _aCbOwner;
    var _oListenerPress;
    var _oListenerRelease;
    
    var _oButton;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iXPos,iYPos,oSprite,bActive){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width/2, height: oSprite.height, regX: (oSprite.width/2)/2, regY: oSprite.height/2}, 
                        animations: {state_true:[0],state_false:[1]}
                   };
                   
         var oSpriteSheet = new createjs.SpriteSheet(oData);
         
         _bActive = bActive;
		_oButton = createSprite(oSpriteSheet, "state_"+_bActive,(oSprite.width/2)/2,oSprite.height/2,oSprite.width/2,oSprite.height);
         
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.stop();
        _oButton.cursor = "pointer";
        _oParentContainer.addChild(_oButton);
        
        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown", _oListenerPress);
       _oButton.off("pressup" , _oListenerRelease);
	   
       _oParentContainer.removeChild(_oButton);
    };
    
    this._initListener = function(){
       _oListenerPress = _oButton.on("mousedown", this.buttonDown);
       _oListenerRelease = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.setActive = function(bActive){
        _bActive = bActive;
        _oButton.gotoAndStop("state_"+_bActive);
    };
    
    this.buttonRelease = function(){
        _oButton.scaleX = 1;
        _oButton.scaleY = 1;
        
        playSound("click",1,false); 
        
        _bActive = !_bActive;
        _oButton.gotoAndStop("state_"+_bActive);

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_bActive);
        }
    };
    
    this.buttonDown = function(){
        _oButton.scaleX = 0.9;
        _oButton.scaleY = 0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this._init(iXPos,iYPos,oSprite,bActive);
}
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
function CVector2(){
    var x;
    var y;
    
    this._init = function(){
        x = 0;
        y = 0;
    };
	
    this.add = function( v){
        x += v.getX();
        y += v.getY(); 
    };
	
    this.scalarDivision = function(n) {
        x /= n;
        y /= n;		
    };
	
    this.subtract = function(v){
        x -= v.getX();
        y -= v.getY(); 
    };
	
    this.scalarProduct = function(n){
        x*=n;
        y*=n;
    };
	
    this.invert = function(){
        x*=-1;
        y*=-1;		
    };
	
    this.dotProduct = function( v){
        return ( x*v.getX()+ y*v.getY()  );
    };	
	
    this.set = function( fx, fy ){
        x = fx;
        y = fy;
    };
	
    this.setV = function(v){
        x = v.getX();
        y = v.getY();
    };
    
    this.setY = function(fy){
        y = fy;
    };
	
    this.length = function(){
        return Math.sqrt( x*x+y*y );
    };
	
    this.length2 = function(){
        return x*x+y*y;
    };
	
    this.normalize = function(){
        var len = this.length();
        if (len > 0 ){
                x/= len; y/=len; 
        }
    };
	
    this.getNormalize = function( outV) {
        var len = this.length();
        outV.set(x,y);
        outV.normalize();
    };	
	
    this.rot90CCW = function(){
        var a = x;
        x = -y;
        y = a;
    };
	
    this.rot90CW = function(){
        var a = x;
        x = y;
        y = -a;
    };

    this.getRotCCW = function(outV) {
        outV.set( x, y );
        outV.rot90CCW();
    };
	
    this.getRotCW = function( outV) {
        outV.set( x, y );
        outV.rot90CW();
    };
	
    this.ceil = function(){
	x = Math.ceil( x );
	y = Math.ceil( y );
    };
	
    this.round = function(){
        x = Math.round( x );
        y = Math.round( y );		
    };
    
    this.getX = function(){
        return x;
    };
    
    this.getY = function(){
        return y;
    };
    
    this._init();
}
function CWinPanel(iX,iY){
    var _oMsgTextStroke;
    var _oMsgText;
    var _oScoreTextStroke;
    var _oScoreText;
    var _oButPlayAgain;
    var _oButBackHome;
    var _oContainer;
    var _oScore;
    
    this._init = function(iX,iY){
        _oContainer = new createjs.Container();
        _oContainer.alpha = 0;
        _oContainer.x = iX;
        _oContainer.y = iY;
        s_oStage.addChild(_oContainer);

	var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);

        var iWidth = 500;
        var iHeight = 90;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 820;
        _oMsgTextStroke = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#B11821", FONT_GAME, 1,
                    2, 2,
                    TEXT_WIN,
                    true, true, true,
                    false );
        _oMsgTextStroke.setOutline(4);            

        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#FFFFFF", FONT_GAME, 1,
                    2, 2,
                    TEXT_WIN,
                    true, true, true,
                    false );

        var iWidth = 500;
        var iHeight = 250;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 1020;
        _oScoreTextStroke = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    100, "center", "#B11821", FONT_GAME, 1,
                    2, 2,
                    TEXT_SCORE +":\n0",
                    true, true, true,
                    false );
        _oScoreTextStroke.setOutline(4);            

        _oScoreText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    100, "center", "#FFFFFF", FONT_GAME, 1,
                    2, 2,
                    TEXT_SCORE +":\n0",
                    true, true, true,
                    false );
        
	// _oButPlayAgain = new CGfxButton(860,1340,s_oSpriteLibrary.getSprite('but_play_again'),_oContainer);
 //        _oButPlayAgain.addEventListener(ON_MOUSE_UP, this.onButPlayAgainRelease, this);
		
    _oButBackHome = new CGfxButton(CANVAS_WIDTH/2,1340,s_oSpriteLibrary.getSprite('but_play'),_oContainer);
        _oButBackHome.addEventListener(ON_MOUSE_UP, this._onButBackHomeRelease, this);
        
    };
	
    this.unload = function(){

    };
    
    this.show = function(iScore){
        _oScore = iScore;
        _oScoreText.refreshText( TEXT_SCORE +":\n"+iScore );
        _oScoreTextStroke.refreshText(  TEXT_SCORE +":\n"+iScore );
        
	createjs.Tween.get(_oContainer).to({alpha:1}, 500);
        
        setVolume("soundtrack",1);
    };
    
    this.hide = function(){
        _oContainer.visible = false;
    };
	
    // ini jd button ke input data
    this._onButBackHomeRelease = function(){
        //
        var _oInputPanel = new CInputPanel(0,0);
        //
        _oInputPanel.show(_oScore);
        //s_oGame.onExit();
    };
	
    this.onButPlayAgainRelease = function(){
        _oContainer.alpha = 0;
        s_oGame.unload();
        s_oMain.gotoGame();
    };
    
    this.isVisible = function(){
        return _oContainer.alpha===0?false:true;
    };
	
    this._init(iX,iY);
}
