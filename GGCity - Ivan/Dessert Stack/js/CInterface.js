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
        
        _oNumScoreStroke = new createjs.Text("0","50px "+FONT_GAME, "#403e39");
        _oNumScoreStroke.x = 80;
        _oNumScoreStroke.y = 50;
        _oNumScoreStroke.outline = 4;
        _oNumScoreStroke.textAlign = "left";
	_oNumScoreStroke.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oNumScoreStroke);
        
        _oNumScore = new createjs.Text("0","50px "+FONT_GAME, "#ffff21");
        _oNumScore.x = 80;
        _oNumScore.y = 50;
        _oNumScore.textAlign = "left";
	_oNumScore.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oNumScore);
        
        _oLivesTextStroke = new createjs.Text("" ,"50px "+FONT_GAME, "#403e39");
        _oLivesTextStroke.x = 80;
        _oLivesTextStroke.y = 110;
        _oLivesTextStroke.outline = 4;
        _oLivesTextStroke.textAlign = "left";
	_oLivesTextStroke.textBaseline  = "alphabetic";
        _oScoreContainer.addChild(_oLivesTextStroke);
        
        _oLivesText = new createjs.Text("" ,"50px "+FONT_GAME, "#ffff21");
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
        
        _oNumBlockTextStroke = new createjs.Text(0 ,"60px "+FONT_GAME, "#403e39");
        _oNumBlockTextStroke.x =  oSpriteFloor.width/2 + 3;
        _oNumBlockTextStroke.y =  30;
        _oNumBlockTextStroke.outline = 4;
        _oNumBlockTextStroke.textAlign = "center";
	_oNumBlockTextStroke.textBaseline  = "middle";
        _oFloorContainer.addChild(_oNumBlockTextStroke);
        
        _oNumBlockText = new createjs.Text(0 ,"60px "+FONT_GAME, "#ffff21");
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
        
        var oMultiplierTextStroke = new createjs.Text(szEncouragment+"\nX "+iLevelMultiplier,"80px "+FONT_GAME, "#403e39");
        oMultiplierTextStroke.lineHeight = 90;
        oMultiplierTextStroke.x = CANVAS_WIDTH/2;
        oMultiplierTextStroke.y = -100;
        oMultiplierTextStroke.textAlign = "center";
	oMultiplierTextStroke.textBaseline  = "alphabetic";
        oMultiplierTextStroke.outline = 8;
        s_oStage.addChild(oMultiplierTextStroke);
        
        var oMultiplierText = new createjs.Text(szEncouragment+"\nX "+iLevelMultiplier,"80px "+FONT_GAME, "#ffff21");
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
        var oLevelOutlineText = new createjs.Text(TEXT_CONGRATS + "\n" + TEXT_LEVEL +" "+ iLevel+" "+TEXT_COMPLETED + "!","100px "+FONT_GAME, "#403e39");
        oLevelOutlineText.textAlign="center";
        oLevelOutlineText.lineWidth = 550;
        oLevelOutlineText.outline = 8;
        oLevelOutlineText.scaleX = oLevelOutlineText.scaleY = 3;
        oLevelOutlineText.x = CANVAS_WIDTH/2;
        oLevelOutlineText.y = CANVAS_HEIGHT/2
        s_oStage.addChild(oLevelOutlineText);
        
        var oLevelText = new createjs.Text(TEXT_CONGRATS + "\n" + TEXT_LEVEL +" "+ iLevel+" "+TEXT_COMPLETED + "!","100px "+FONT_GAME, "#fdba25");
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
        var oLevelOutlineText = new createjs.Text("COMPLIMENTI, HAI SUPERATO IL " + iLevel+ "° LIVELLO!","70px "+FONT_GAME, "#C5281C");
        oLevelOutlineText.textAlign="center";
        oLevelOutlineText.lineWidth = 550;
        oLevelOutlineText.outline = 5;
        oLevelOutlineText.x = CANVAS_WIDTH/2;
        oLevelOutlineText.y = -50;
        s_oStage.addChild(oLevelOutlineText);
        
        var oLevelText = new createjs.Text("COMPLIMENTI, HAI SUPERATO IL " + iLevel+ "° LIVELLO!","70px "+FONT_GAME, "#ffffff");
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