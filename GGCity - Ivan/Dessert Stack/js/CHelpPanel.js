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
                    60, "center", "#403e39", FONT_GAME, 0.8,
                    2, 2,
                    TEXT_HELP1,
                    true, true, true,
                    false );
        _oTextStroke1.setOutline(4);            

        _oText1 = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    60, "center", "#ffff21", FONT_GAME, 0.8,
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
                    60, "center", "#403e39", FONT_GAME, 0.8,
                    2, 2,
                    TEXT_HELP2,
                    true, true, true,
                    false );
        _oTextStroke1.setOutline(4);            

        _oText2 = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    60, "center", "#ffff21", FONT_GAME, 0.8,
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
