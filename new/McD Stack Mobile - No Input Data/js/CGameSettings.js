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