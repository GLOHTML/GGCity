<?php
    $dir = str_replace(basename($_SERVER["SCRIPT_FILENAME"]),"",$_SERVER["SCRIPT_NAME"]);
    $_GET['dom']=$_SERVER['HTTP_REFERER'];
    include_once($_SERVER['DOCUMENT_ROOT']."/includegl1/CheckAllow.php");
    if(!$playallow){
        header("location:/unavailable.html");
    }
    ob_end_clean();
?>

<!DOCTYPE html>
<html>
    <head>
        <title>McD Stack</title>

        <script type="text/javascript" src="recordvisit.js"></script>

        <link rel="stylesheet" href="css/reset.css" type="text/css">
        <link rel="stylesheet" href="css/main.css" type="text/css">
        <link rel="stylesheet" href="css/orientation_utils.css" type="text/css">
        <link rel="stylesheet" href="css/ios_fullscreen.css" type="text/css">
        <link rel='shortcut icon' type='image/x-icon' href='./favicon.ico' />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,minimal-ui" />
        <meta name="msapplication-tap-highlight" content="no"/>

        <script type="text/javascript" src="js/jquery-3.2.1.min.js"></script>
        <script type="text/javascript" src="js/createjs.min.js"></script>
        <script type="text/javascript" src="js/howler.min.js"></script>
        <script type="text/javascript" src="js/screenfull.min.js"></script>
        <script type="text/javascript" src="js/platform.js"></script>
        <script type="text/javascript" src="js/ios_fullscreen.js"></script>
        <script type="text/javascript" src="js/ctl_utils.js"></script>
        <script type="text/javascript" src="js/sprite_lib.js"></script>
        <script type="text/javascript" src="js/settings.js"></script>
        <script type="text/javascript" src="js/CCTLText.js"></script>
        <script type="text/javascript" src="js/CLang.js"></script>
        <script type="text/javascript" src="js/CPreloader.js"></script>
        <script type="text/javascript" src="js/CMain.js"></script>
        <script type="text/javascript" src="js/CTextButton.js"></script>
        <script type="text/javascript" src="js/CGfxButton.js"></script>
        <script type="text/javascript" src="js/CToggle.js"></script>
        <script type="text/javascript" src="js/CGame.js"></script>
        <script type="text/javascript" src="js/CInterface.js"></script>
        <script type="text/javascript" src="js/CGameSettings.js"></script>
        <script type="text/javascript" src="js/CGameOver.js"></script>
        <script type="text/javascript" src="js/CWinPanel.js"></script>
        <script type="text/javascript" src="js/CHook.js"></script>
        <script type="text/javascript" src="js/CBlock.js"></script>
        <script type="text/javascript" src="js/CVector2.js"></script>
        <script type="text/javascript" src="js/CMenu.js"></script>
        <script type="text/javascript" src="js/CBird.js"></script>
        <script type="text/javascript" src="js/CHelpPanel.js"></script>
        <script type="text/javascript" src="js/CRollingTextController.js"></script>
        <script type="text/javascript" src="js/CRollingTextManager.js"></script>
        <script type="text/javascript" src="js/CTweenController.js"></script>
        <script type="text/javascript" src="js/CSplashScreen.js"></script>
        <script type="text/javascript" src="js/CStartGame.js"></script>
    </head>
    <body ondragstart="return false;" ondrop="return false;" >
	<div style="position: fixed; background-color: transparent; top: 0px; left: 0px; width: 100%; height: 100%"></div>
          <script>
            $(document).ready(function(){
                StartGame();
           });

        </script>
        
        <div class="check-fonts">
            <p class="check-font-1">test 1</p>
        </div> 

        <canvas id="canvas" class='ani_hack' width="1400" height="1920"> </canvas>
        <input type="text" id="nameInput" style="position:absolute;left: 40%;margin: auto;height: 20px; width: 20%; left:43%; height: 3.5%; top:45%;display: none">
        <input type="text" id="phoneInput" style="position:absolute;left: 40%;margin: auto;height: 20px; width: 20%; left:43%; height: 3.5%; top:51%;display: none">
        <input type="text" id="emailInput" style="position:absolute;left: 40%;margin: auto;height: 20px; width: 20%; left:43%; height: 3.5%; top:57%;display: none">
 
        <div data-orientation="portrait" class="orientation-msg-container"><p class="orientation-msg-text">Please rotate your device</p></div>
        <div id="block_game" style="position: fixed; background-color: transparent; top: 0px; left: 0px; width: 100%; height: 100%; display:none"></div>
    </body>
</html>