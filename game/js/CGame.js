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
        _oTrajectoryContainer.alpha = 1;
        
        _iCurState = STATE_BLOCK_ROTATE;
        _bUpdate = true;
        $(s_oMain).trigger("start_level");
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
        var oGraphics = new createjs.Graphics().beginFill("#76c8f7").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT/2);
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
        $(s_oMain).trigger("save_score",_iScore);
        $(s_oMain).trigger("end_level");
    };
    
    this._gameOver = function(){
        _bBlock = true;
        _bUpdate = false;
        _iCurState = STATE_BLOCK_ROTATE;

        if(_iScore > _iBestScore){
            _iBestScore = _iScore;
        }
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
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("share_event",_iScore);
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
                                                                                                $(s_oMain).trigger("show_interlevel_ad");
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