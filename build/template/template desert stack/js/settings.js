/*******************************************************/ 
// INI UNTUK COLOR TEXT
// Color untuk text +score saat mendapat score
var COLOR_TEXT_SCORE_LV1 	= "#FFFFFF"
var COLOR_OUTLINE_SCORE_LV1 = "#000000"
var COLOR_TEXT_SCORE_LV2 	= "#FFFFFF"
var COLOR_OUTLINE_SCORE_LV2 = "#000000"
var COLOR_TEXT_SCORE_LV3 	= "#FFFFFF"
var COLOR_OUTLINE_SCORE_LV3 = "#000000"

// Color untuk langit (diluar image background)
var COLOR_SKY_BG = "#F7F0DE";

// Color untuk pesan game over dan score pada game over
var COLOR_TEXT_GAMEOVER 	= "#FFFFFF";
var COLOR_OUTLINE_GAMEOVER 	= "#B11821";
var COLOR_TEXT_GAMEOVER2 	= "#FFFFFF";
var COLOR_OUTLINE_GAMEOVER2 = "#B11821";

// Color untuk pesan help/tutorial
var COLOR_TEXT_HELP 	= "#FFFFFF";
var COLOR_OUTLINE_HELP 	= "#000000";
var COLOR_TEXT_HELP2 	= "#FFFFFF";
var COLOR_OUTLINE_HELP2 = "#000000";

// Color untuk tali hook
var COLOR_HOOK  = "#000000";
var COLOR_HOOK2 = "#000000";

// Color untuk text di input panel
var COLOR_TEXT_INPUT_TITLE 		= "#FFFFFF";
var COLOR_OUTLINE_INPUT_TITLE 	= "#B11821";
var COLOR_TEXT_INPUT_LABEL		= "#FFFFFF";
var COLOR_OUTLINE_INPUT_LABEL 	= "#B11821";

// Color untuk text dalam game
var COLOR_TEXT_GAME 	= "#FFFFFF";
var COLOR_OUTLINE_GAME 	= "#000000";
/*******************************************************/ 

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
//
var windowW = $(window).width();
var windowH = $(window).height();
var scale = windowW/windowH;
var change;
if(scale < 0.72){
	change = 1 - ((scale-0.56)/(0.72-0.56));
	if(change < 0) change = 0;
	FIRST_BLOCK_LANDING_Y = 1735 + (155 * change);
}
//

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