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
                    80, "center", "#9E1F62", FONT_GAME, 1,
                    2, 2,
                    TEXT_WIN,
                    true, true, true,
                    false );
        _oMsgTextStroke.setOutline(4);            

        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#EE327B", FONT_GAME, 1,
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
                    100, "center", "#9E1F62", FONT_GAME, 1,
                    2, 2,
                    TEXT_SCORE +":\n0",
                    true, true, true,
                    false );
        _oScoreTextStroke.setOutline(4);            

        _oScoreText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    100, "center", "#EE327B", FONT_GAME, 1,
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
        
        $(s_oMain).trigger("save_score",iScore);
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