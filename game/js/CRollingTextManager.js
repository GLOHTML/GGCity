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