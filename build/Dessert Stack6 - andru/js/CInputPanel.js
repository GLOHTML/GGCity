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
                    80, "center", "#9E1F62", FONT_GAME, 1,
                    2, 2,
                    TEXT_GAMEOVER,
                    true, true, true,
                    false );
        _oMsgTextStroke.setOutline(4);            

        _oMsgText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    80, "center", "#EE327B", FONT_GAME, 1,
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
                40, "center", "#9E1F62", FONT_GAME, 1.1,
                36, 0,
                "",
                true, true, false,
                false );
            
    _oNameTextStroke.setOutline(5);

    _oNameText = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*45.5/100, oSpriteBg.width, 70, 
                40, "center", "#EE327B", FONT_GAME, 1.1,
                50, 0,
                "",
                true, true, false,
                false );
    // Phone Label
    _oPhoneTextStroke = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*50.5/100, oSpriteBg.width, 70, 
                40, "center", "#9E1F62", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
                
    _oPhoneTextStroke.setOutline(5);

    _oPhoneText = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*50.5/100, oSpriteBg.width, 70, 
                40, "center", "#EE327B", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
    // Email Label
    _oEmailTextStroke = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*56/100, oSpriteBg.width, 70, 
                40, "center", "#9E1F62", FONT_GAME, 1.1,
                0, 0,
                "",
                true, true, false,
                false );
                
    _oEmailTextStroke.setOutline(5);

    _oEmailText = new CTLText(_oContainer, 
                CANVAS_WIDTH / 2 -oSpriteBg.width*8/10, CANVAS_HEIGHT*56/100, oSpriteBg.width, 70, 
                40, "center", "#EE327B", FONT_GAME, 1.1,
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
        
        $(s_oMain).trigger("save_score",iScore);
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
        //saveDataCustom(nameVal,scoreVal);
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