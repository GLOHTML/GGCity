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
        s_oStage.addChild(_oContainer);

        _oLogoGLO = s_oSpriteLibrary.getSprite('logo_glo');
        _oPanel = createBitmap(_oLogoGLO);
        _oPanel.regX = -430;
        _oPanel.regY = -520;
        _oPanel.visible = false;
        _oContainer.addChild(_oPanel);

        _oLogoGLOG = s_oSpriteLibrary.getSprite('logo_glogames');
        _oPanel2 = createBitmap(_oLogoGLOG);
        _oPanel2.regX = -430;
        _oPanel2.regY = -520;
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