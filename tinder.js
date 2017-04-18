var runde = 0;
var user_select;
var rotateCSS;
var hovering = false;
var opg_type;
var json_Array = [];
var revert = false;

var score = 0;

$(document).ready(function() {

    console.log('document.ready - jsonData 1: ' + JSON.stringify(jsonData) + ', \njsonData.length: ' + jsonData.length);
    makePrefixedUnits(false, 2);
    makeSpecifiedUnits();
    insertCardNo();
    console.log('document.ready - jsonData 2: ' + JSON.stringify(jsonData, null, 4) + ', \njsonData.length: ' + jsonData.length);

    if (jsonData[0].Konklusion) {
        $(".instr_container").html(instruction("Du skal vurdere konklusionen og trække kortet til <span class='label label-success'>højre</span> hvis den er god og til <span class='label label-danger'>venstre</span> hvis den er dårlig."));
        // opg_type = "konklusion";
        opg_type = "konklusion";
    } else {
        $(".instr_container").html(instruction("Du skal vurdere om der er tale om en fysisk størrelse eller en enhed. Træk kortet til <span class='label label-success'>højre</span> hvis det er en fysisk størrelse og til <span class='label label-danger'>venstre</span> hvis det er en enhed."));
        opg_type = "problemformulering"
        // shuffle_Array(jsonData);   // <---------------------------  // Randomize jsonData  -  COMMENTED OUT 6/4-2017
        //$(".tinder_container").css("height", "750px"); 
    }

    $(".instr_container").find("div").removeClass("col-md-8");

    console.log(typeof(runde));
    enable_audio();
    generateHTML();
    updateStack();

    $(".btn_no, .btn_yes").click(function() {
        console.log(this);
        var class_type = $(this).attr("class").split(' ')[4];
        btn_click(class_type);
    });


    $(".dropzone").droppable({
        drop: function(event, ui) {
            var class_type = $(this).attr("class").split(' ')[1];

            if (class_type == "dropzone_no") {
                user_select = false;
                ui.draggable.animate({
                    opacity: 1,
                    left: "-=1400"
                }, 200, function() {
                    feedback(ui);
                });

            } else if (class_type == "dropzone_yes") {
                user_select = true;
                //UserMsgBox("body", "<h3>Du har svaret <span class='label label-danger'>Forkert</span> </h3><h3> Feedback:</h3><p>Lorem ipsum....</p>");

                ui.draggable.animate({
                    opacity: 1,
                    left: "+=1400"
                }, 200, function() {
                    feedback(ui);
                });
            }
        },
        hoverClass: function(event, ui, is_valid_drop) {
            var dropclass = $(this).attr("class").split(' ')[1];

            if (dropclass == "dropzone_no") {
                $(".txt_vurdering").eq(0).css("opacity", 1);
                // $(".txt_vurdering").eq(0).html("<span class='label label_feed label-danger'>Dårlig " + opg_type + "</span>");
                $(".txt_vurdering").eq(0).html("<span class='label label_feed label-danger'>Enhed</span>");
            } else if (dropclass == "dropzone_yes") {
                $(".txt_vurdering").eq(0).css("opacity", 1);
                // $(".txt_vurdering").eq(0).html("<span class='label label_feed label-success'>God " + opg_type + "</span>");
                $(".txt_vurdering").eq(0).html("<span class='label label_feed label-success'>Fysisk størrelse</span>");
            }
        }
    });

});

function generateHTML() {
    //alert(jsonData.length);

    for (var i = 0; i < jsonData.length; i++) {


        $(".tinder_container").append("<div class='text_container tinder_card card_" + i + "'></div>");
        if (opg_type == "problemformulering") {
            // $(".tinder_card").eq(i).html("<p class='card_header'><b>Emne:</b> ''" + jsonData[i].Nogleproblem + "''</p><p class='card_text'>" + jsonData[i].Problemformulering + "</p><div class='txt_vurdering'></div>");
            $(".tinder_card").eq(i).html("<p class='card_header'><b>Emne:</b> ''" + jsonData[i].Nogleproblem + "''</p><span class='card_number'>"+jsonData[i].no+"</span><p class='card_text'>" + jsonData[i].Problemformulering + "</p><div class='txt_vurdering'></div>");
        } else {
            $(".tinder_card").eq(i).html("<p class='card_header card_header_konkl'><b>Problemformulering:</b> ''" + jsonData[i].Problemformulering + "''</p><p class='card_text_konkl'></p><p class='card_text_konkl'>" + jsonData[i].Konklusion + "</p><div class='txt_vurdering'></div>");
        }
        $(".tinder_card").eq(i).css("z-index", 20 - i);
        $(".tinder_card").eq(i).css("margin-top", i * 7);
        if (i > 4) {
            $(".tinder_card").eq(i).fadeOut(0);
        }
    }
    $(".knap_container").css("z-index", 1);
    $(".txt_vurdering").css("opacity", 0);

    $(".tinder_container").append('<div class="knap_container col-md-12"><div class="btn_tinder btn-lg btn btn-info btn_no"><span class="glyphicon glyphicon-remove"></span></div><div class="btn_tinder btn btn-info btn-lg btn_yes"><span class="glyphicon glyphicon-heart"></span></div></div>');
    //$(".boxit").boxfit({ multiline: true });
    //$(".card_text").boxfit({ multiline: true });
    //$(".tinder_container .tinder_card").shuffle_div_position();
};

function makeDraggable() {
    $(".tinder_card").eq(0).draggable({
        revert: function(is_valid_drop) {
            if (is_valid_drop) {

            } else {

                revert = true;
                $(this).css({
                    '-moz-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    'transform': 'rotate(0deg)' /* Newer browsers (incl IE9) */
                });

                $(".txt_vurdering").eq(0).css("opacity", 0);
                return true;

            }
        },
        axis: "x",
        containment: ".container-fluid",
        revertDuration: 500,
        start: function(event, ui) {
            updateStack();
        },

        drag: function(event, ui) {
            var body_width = $("body").width() / 2;
            var this_width = $(this).width() / 2;
            var x_pos = body_width - this_width;

            //console.log("BW:" + body_width + ", this_width: " + this_width + "hej: " + x_pos);
            rotateCSS = 'rotate(' + (($(this).offset().left - x_pos) / 20) + 'deg)';
            //console.log("offset: " + $(this).offset().left);
            $(this).css({
                '-moz-transform': rotateCSS,
                '-webkit-transform': rotateCSS,
                'transform': rotateCSS

            });
        },
        stop: function(event, ui) {
            if (jsonData[runde].Korrekt === user_select && revert == false) {
                correct_sound();
                score++;
                console.log("Score: " + score + "LEnght: " + jsonData.length);

            } else if (jsonData[runde].Korrekt != user_select && revert == false) {
                error_sound();
            }
            revert = false;
        },
    });
}

function feedback(ui) {

    console.log('feedback - jsonData['+runde+'].Korrekt: '+jsonData[runde].Korrekt+', user_select: ' + user_select);

    if (jsonData[runde].Korrekt == user_select) {
        var svar_type = "<span class='label label-success'>Rigtigt</span>"; //$(".svar").html("Du svarede rigtigt.");
        //correct_sound();
    } else if (jsonData[runde].Korrekt != user_select) {
        var svar_type = "<span class='label label-danger'>Forkert</span>"; //$(".svar").html("Du svarede forkert.");
        //error_sound();
    }
    console.log("Runde: " + runde + ", Korrekt: " + jsonData[runde].Korrekt + ", " + user_select);
    if (opg_type == "problemformulering") {

        // if (jsonData[runde].Korrekt === true) {
        //     UserMsgBox("body", "<h3>Du svarede " + svar_type + "</h3><p class='hidden-xs hidden-sm'>'" + jsonData[runde].Problemformulering + "' <br/><h3>Denne " + opg_type + " er  <span class='label  label-success'>God</span></h3></p><p>" + jsonData[runde].Feedback + "</p>");
        // } else if (jsonData[runde].Korrekt === false) {
        //     UserMsgBox("body", "<h3>Du svarede " + svar_type + "</h3><p class='hidden-xs hidden-sm'>'" + jsonData[runde].Problemformulering + "' <br/><h3>Denne " + opg_type + " er  <span class='label label-danger'>Dårlig</span></h3></p><p>" + jsonData[runde].Feedback + "</p>");
        // }

        if (jsonData[runde].Korrekt === user_select) {
            UserMsgBox("body", "<h3>Du svarede " + svar_type + " på spørgsmålet: </h3><p class='hidden-xs hidden-sm'>'" + jsonData[runde].Problemformulering + "'</p>");
        } else if (jsonData[runde].Korrekt !== user_select) {
            UserMsgBox("body", "<h3>Du svarede " + svar_type + " på spørgsmålet: </h3><p class='hidden-xs hidden-sm'>'" + jsonData[runde].Problemformulering + "'</p><br/><p>" + jsonData[runde].Feedback + "</p>");
        }

    } else if (opg_type == "konklusion") {
        if (jsonData[runde].Korrekt === true) {
            UserMsgBox("body", "<h3>Du svarede " + svar_type + "</h3><p class='hidden-xs hidden-sm'>'" + jsonData[runde].Konklusion + "' <br/><h3>Denne " + opg_type + " er  <span class='label label-success'>God</span></h3></p><p>" + jsonData[runde].Feedback + "</p>");
        } else if (jsonData[runde].Korrekt === false) {
            UserMsgBox("body", "<h3>Du svarede " + svar_type + "</h3><p class='hidden-xs hidden-sm'>'" + jsonData[runde].Konklusion + "' <br/><h3>Denne " + opg_type + " er  <span class='label label-danger'>Dårlig</span></h3></p><p>" + jsonData[runde].Feedback + "</p>");
        }

    }


    $(".tinder_card").eq(0).remove();
    runde++;
    //generateHTML();
    //makeDraggable();
    updateStack();
}

function updateStack() {
    //console.log("hej");
    $(".tinder_card").each(function(index) {
        var ny_margin = index * 7 + "px";
        $(".tinder_card").eq(index).css("margin-top", ny_margin);
        if (index < 6) {
            $(".tinder_card").eq(index).fadeIn();
        }
    });

    if (runde >= jsonData.length) {
        slutFeedback();
    }

    var scrollheight = $(".tinder_card").eq(0)[0].scrollHeight;
    var innerheight = $(".tinder_card").eq(0).innerHeight();

    if (scrollheight > innerheight) {

        jQuery(function($) {
            $('.tinder_card').eq(0).on('scroll', function() {
                console.log("Runde: " + runde + " SH: " + scrollheight + "IH : " + innerheight + " scrolltop:  " + $(".tinder_card").scrollTop());
                if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    makeDraggable();
                    //alert('end reached');
                }
            })
        });
    } else {
        makeDraggable();
    }
}

function btn_click(class_type) {

    if (class_type == "btn_no") {
        user_select = false;
        var rotate = 0;
        var pos = "-=400";
    } else if (class_type == "btn_yes") {
        user_select = true;

        var rotate = 0;
        var pos = "+=400";
    }

    if (jsonData[runde].Korrekt == user_select) {
        correct_sound();
        score++;
        console.log("Score: " + score + " length: " + jsonData.length);
    } else {
        error_sound();
    }


    $(".tinder_card").eq(0).animate({
        left: pos,
        opacity: "0"
    }, 400, function() {



        feedback($(".tinder_card"));
        //$(".tinder_card").eq(0).remove();
        //updateStack();
    });
}

function slutFeedback() {
    var pct = Math.floor(score / jsonData.length * 100);
    var ord = "";
    var label = "";
    if (pct < 33) {
        ord = "Ikke et godt match :-(";
        label = "label-danger";

    } else if (pct < 67) {
        ord = "Et halvdårligt match :-/";
        label = "label-warning";
    } else {
        ord = "Et godt match :-)";
        label = "label-success";
    }

    // $(".tinder_container").html("<div class ='slutFeedback'><h2>" + ord + "<h2><h3>Du har <div class='label_container'><span class='label label-lg " + label + "'>" + pct + "%</span></div>rigtige svar i opgaven om " + opg_type + "er</h3><div class='btn btn-primary btn_again'>PRØV IGEN</div></div>");
    $(".tinder_container").html("<div class ='slutFeedback'><h2>" + ord + "<h2><h3>Du har <div class='label_container'><span class='label label-lg " + label + "'>" + pct + "%</span></div>rigtige svar i opgaven!</h3><div class='btn btn-primary btn_again'>PRØV IGEN</div></div>");

    $(".btn_again").click(function() {
        location.reload();
    });
}


/*
 *  Denne funktion laver ekstra opgaver ift enheder i dekadiske prefixer når jsonData IKKE rummer array-property'en "Enheder". 
 *      includeOriginalUnit_bool : "true" eller "false", og angiver om den orginale enhed medtages i jsonData eller ej.
 *      numOfPrefixes : angiver hvor mange prefixed enheder der skal laves (max 16). Hvis numOfPrefixes = null medtages alle prefixes.
 *  NOTE:
 *      Denne funktion aktivers KUN hvis jsonData IKKE rummer array-property'en "Enheder".
 *      Hvis jsonData rummer array-property'en "Prefixer", så overskrives arrayet "prefixArr" med array-property'en "Prefixer" fra jsonData.
 */
function makePrefixedUnits(includeOriginalUnit_bool, numOfPrefixes) {
    var prefixArr = ['yokto', 'zepto', 'atto', 'femto', 'piko', 'nano', 'mikro', 'milli', 'kilo', 'mega', 'giga', 'tera', 'peta', 'exa', 'zetta', 'yotta'];  // <---- HUSK at afstemme dette med "#9 omregneren".
    shuffle_Array(prefixArr);
    numOfPrefixes = (numOfPrefixes!==null)? numOfPrefixes : prefixArr.length; // Hvis numOfPrefixes = null, så medtages alle elementer i prefixArr;
    var prefixArr_mod = prefixArr.slice(0, numOfPrefixes); 
    var unit, quantity, TjsonData = [], prob, prob_mod;
    for (var n in jsonData) {
        if ((!jsonData[n].Korrekt) && (typeof(jsonData[n].Enheder)==='undefined')) {  // Korrekt = true <==> Fysisk størrelse _ELLER_ Korrekt = false <==> Enhed. Ekskluder alle opgaver 
            if (includeOriginalUnit_bool) {
                TjsonData.push(jsonData[n]);
            }
            prob = jsonData[n].Problemformulering;
            unit = prob.substring(prob.indexOf('>')+1, prob.indexOf('</'));
            quantity = jsonData[n].Feedback.substring(jsonData[n].Feedback.indexOf('>')+1, jsonData[n].Feedback.indexOf('</'));
            console.log('makePrefixedUnits - n: ' + n + ', unit: ' + unit + ', quantity: ' + quantity);

            if (typeof(jsonData[n].Prefixer)!=='undefined') {  // Dette giver nye prefixer fra jsonData, hvis de er specificeret.
                prefixArr_mod = (includeOriginalUnit_bool)? [''].concat(jsonData[n].Prefixer) : jsonData[n].Prefixer;
            }
            for (var m in prefixArr_mod) {
                prob_mod = JSON.parse(JSON.stringify(jsonData[n]));
                // prob_mod.Problemformulering = prob.substring(0, prob.indexOf('>')+1) + prefixArr_mod[m] + prob.substring(prob.indexOf('>')+1);  
                prob_mod.Problemformulering = prob.substring(0, prob.indexOf('>')+1) + ((prefixArr_mod[m].length>0)? prefixArr_mod[m]+unit.toLowerCase() : unit) + prob.substring(prob.indexOf('</')); // Dette indsætter f.eks "Joule" hvis ikke der er noget dekadisk prefix og "joule" hvis der er et prefix. Dvs f.eks "kilo" --> "kilojoule" og IKKE "kiloJoule".
                TjsonData.push(prob_mod);
            }
        } else {
            TjsonData.push(jsonData[n]);
        }
    }
    console.log('makePrefixedUnits - TjsonData: ' + JSON.stringify(TjsonData, null, 4));

    jsonData = TjsonData;
}


/*
 *  Denne funktion laver ekstra opgaver ift enheder når jsonData rummer array-property'en "Enheder" _OG_ en delimiter "(???)"" i teksten "Problemformulering".
 *  Alle enheder i arrayet "Enheder" indsættes istedet for delimiteren "(???)".
 */
function makeSpecifiedUnits() {
    var unit, quantity, TjsonData = [], prob, prob_mod;
    for (var n in jsonData) {
        console.log('makeSpecifiedUnits - A0');
        if ((!jsonData[n].Korrekt) && (typeof(jsonData[n].Enheder)!=='undefined')) {  // Hvis der er tale om enheder OG array-property'en "Enheder" er defineret, så...
            console.log('makeSpecifiedUnits - A1');
            prob = jsonData[n].Problemformulering;
            for (var m in jsonData[n].Enheder) {   
                console.log('makeSpecifiedUnits - A2');
                prob_mod = JSON.parse(JSON.stringify(jsonData[n]));
                prob_mod.Problemformulering = prob_mod.Problemformulering.replace('(???)', jsonData[n].Enheder[m]);
                TjsonData.push(prob_mod);
            }
        } else {
            TjsonData.push(jsonData[n]);
        }
    }
    console.log('makeSpecifiedUnits - TjsonData: ' + JSON.stringify(TjsonData, null, 4));

    jsonData = TjsonData;
}


function insertCardNo() {
    for (var n in jsonData) {
        jsonData[n].no = n;
    }
}

