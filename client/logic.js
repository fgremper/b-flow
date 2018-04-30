var currentPlaceType = undefined;
var newPlaceType = undefined;

var subGroup = 0;
var subPosition = [0, 0, 0];

var cardPosition = 0;

var cardPositionMax = 0;

var backwardsTrail = [0];

var supportsTouch = 'ontouchstart' in window;

var myId = makeId();

var timestamp = moment();

var sentSoftConversion = false;

var invalid = false;

var referrer = '';

var isFake = false;

function makeId() {
	var text = "";
	var possible = "0123456789abcdef";

	for (var i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
};

function userLog(message) {
	console.log('* ' + message);
	$.ajax({
		type: 'POST',
		url: '//customers2-backend.movu.ch/progress.php',
		data: {
			message: message,
			id: myId
		}
	});
}

function userLogStart() {
	$.ajax({
		type: 'POST',
		url: '//customers2-backend.movu.ch/start.php',
		data: {
			id: myId
		}
	});
}

function sendCompletedInquiry(message) {
	$('#completedInquirySending').show();
	$('#completedInquiryError').hide();
	$('#completedInquirySuccess').hide();

	userLog('send completed inquiry');
	
	$.ajax({
		type: 'POST',
		url: '//customers2-backend.movu.ch/completed.php',
		data: {
			message: getAllCardData(),
			referrer: '' + referrer,
			id: myId
		}
	})
	.done(function () {
		$('#completedInquirySending').hide();
		$('#completedInquiryError').hide();
		$('#completedInquirySuccess').show();
	})
	.fail(function () {
		$('#completedInquirySending').hide();
		$('#completedInquiryError').show();
		$('#completedInquirySuccess').hide();
	});
}

function loadCombined() {
	userLog('serviceType combined');
	serviceType = 'combined';
	$('#mainProgress, #subHeader').css('visibility', 'visible');
}

function loadMoving() {
	userLog('serviceType moving');
	serviceType = 'moving';
	$('#mainProgress, #subHeader').css('visibility', 'visible');
	$('.eCleaningOptions').remove();
	$('.eCleaningWindows').remove();
	$('.eCleaningBlinds').remove();
	$('.eCleaningBath').remove();
	$('.eCleaningAdditional').remove();

	$('.dateWrapperCleaning').remove();
}

function loadCleaning() {
	userLog('serviceType cleaning');
	serviceType = 'cleaning';
	$('#mainProgress, #subHeader').css('visibility', 'visible');

	$('.eCurrentPlaceElevator').remove();
	$('.eCurrentPlaceFloor').remove();
	$('.eCurrentPlaceAccessibility').remove();
	$('.eNumPeople').remove();
	$('.eInventory').remove();
	$('.eBoxes').remove();
	$('.eNewPlaceType').remove();
	$('.eNewPlaceFloor').remove();
	$('.eNewPlaceElevator').remove();
	$('.eNewPlaceAccessibility').remove();
	$('.eAdditionalServices').remove();

	$('.dateWrapperMoving').remove();
	$('.dateWrapperCleaning').find('h1').removeClass('headerSpacing');

	$('#mainProgress .step:nth-child(2)').remove();
	$('.subProgress:nth-child(2)').remove();

    $('#mainProgress .step:nth-child(1)').html('<div class="stepNumber">1</div> <span class="stepLabel">Fragen zur Reinigung</span>');
    $('#mainProgress .step:nth-child(2)').html('<div class="stepNumber">2</div> <span class="stepLabel">Letzte Schritte</span>');

    $('.card.eAddress .questionText').text('Adresse');
    $('.card.eAddress h1').eq(0).text('Adresse');
    $('.addressToBlock').remove();

	$('.card.eCurrentPlaceType .questionText').text('Wo soll gereinigt werden?')
}

function incProgress() {

	$('.subProgress:nth-child(' + (subGroup + 1) + ') .step').eq(subPosition[subGroup]).addClass('done');

	cardPosition++;
	cardPositionMax = Math.min(cardPosition, cardPositionMax);
	subPosition[subGroup]++;

	if (subPosition[subGroup] >= $('.subProgress:nth-child(' + (subGroup + 1) + ') .step').length) {
		subPosition[subGroup]--;
		$('.subProgress:nth-child(' + (subGroup + 1) + ')').hide();
		$('#mainProgress .step').eq(subGroup).addClass('done');
		$('#mainProgress .step').eq(subGroup).removeClass('active');
		subGroup++;
		$('#mainProgress .step').eq(subGroup).addClass('active');
		$('.subProgress:nth-child(' + (subGroup + 1) +')').show();
	}

	$('.subProgress .step').removeClass('active');
	$('.subProgress:nth-child(' + (subGroup + 1) + ') .step').eq(subPosition[subGroup]).addClass('active');

}

function decProgress() {

	cardPosition--;
	subPosition[subGroup]--;

	if (subPosition[subGroup] < 0) {
		subPosition[subGroup]++;
		$('.subProgress:nth-child(' + (subGroup + 1) + ')').hide();
		$('#mainProgress .step').eq(subGroup).removeClass('active');
		subGroup--;
		$('#mainProgress .step').eq(subGroup).addClass('active');
		$('.subProgress:nth-child(' + (subGroup + 1) + ')').show();
	}

	$('.subProgress .step').removeClass('active');
	$('.subProgress:nth-child(' + (subGroup + 1) + ') .step').eq(subPosition[subGroup]).addClass('active');

}

function getAllCardData() {
	var result = '';
	for (var i = 0; i < $('.card').length; i++) {
		result += $('.card').eq(i).data('card-name') + "\r\n" + getCardData(i) + "\r\n\r\n";
	}
	return result;
}

function getCardData(cardNumber) {

	var output = [];
	$('.card').eq(cardNumber).find('.choice, .numberDialField, .buttonCheck, .buttonRadio, textarea, input, .roomName, .roomItem, .dateInput').each(function (i, el) {
		if ($(el).hasClass('choice')) {
			if ($(el).hasClass('choiceSelected')) {
		    	output.push('[*] ' + $(el).text());
		    }
		    else {
				output.push('[ ] ' + $(el).text());
		    }
	    }
		if ($(el).hasClass('numberDialField')) {
			if ($(el).parent().prev().hasClass('numberDialLabel')) {
				output.push($(el).parent().prev().text() + ': ' + $(el).val());
			}
			else {
				output.push('Number: ' + $(el).val());
			}
	    }
		if ($(el).hasClass('buttonCheck') || $(el).hasClass('buttonRadio')) {
			if ($(el).hasClass('isChecked')) {
		    	output.push('[*] ' + $(el).find('.label').text());
		    }
		    else {
				output.push('[ ] ' + $(el).find('.label').text());
		    }
	    }
		if ($(el).is('textarea')) {
			output.push($(el).attr('placeholder') + ': ' + $(el).val().replace(/[\r\n]+/g, ' '));
	    }
		if ($(el).is('input:not(.numberDialField)')) {
			output.push($(el).attr('placeholder') + ': ' + $(el).val().replace(/[\r\n]+/g, ' '));
	    }
		if ($(el).hasClass('roomName')) {
			output.push('room: ' + $(el).text());
	    }
		if ($(el).hasClass('roomItem')) {
			output.push('- ' + $(el).find('.roomItemQuantity').text() + ' ' + $(el).find('.roomItemText').text() + ' (' + $(el).find('.roomItemSmallText').text() + ')');
	    }
		if ($(el).hasClass('dateInput')) {
			output.push($(el).attr('id') + ': ' + $(el).text());
	    }
	});

	return output.join("\r\n");

}

function itemPropertiesToString() {
	var output = [];
	$('#overlayProperties').find('.buttonRadio, .buttonCheck').each(function (i, el) {
		if ($(this).hasClass('isChecked')) {
	    	output.push($(el).find('.label').text());
	    }
	});
	if ($('#itemSpecialProperties').val() != '') {
		output.push($('#itemSpecialProperties').val());
	}
	return output.join(', ');
}


function itemPropertiesToArray() {
	var output = [];
	$('#overlayProperties').find('.buttonRadio, .buttonCheck').each(function (i, el) {
		output.push($(this).hasClass('isChecked'));
	});
	return output;
}

function arrayToItemProperties(array) {
	$('#overlayProperties').find('.buttonRadio, .buttonCheck').each(function (i, el) {
		if (array[i]) {
			$(this).addClass('isChecked');
		}
		else {
			$(this).removeClass('isChecked');
		}
	});
}



$(document).ready(function () {

	FastClick.attach(document.body);

	// parse URL parameters
	var url = new URLSearchParams(window.location.search);
	if (url.get('origin') == 'combined_landing_page') {
		$('.eServiceType').remove();
		$('.stepTd.eCurrentPlaceType .step').addClass('active');
		loadCombined();
	}
	
	else if (url.get('origin') == 'moving_landing_page') {
		$('.eServiceType').remove();
		$('.stepTd.eCurrentPlaceType .step').addClass('active');
		loadMoving();
	}
	
	else if (url.get('origin') == 'cleaning_landing_page') {
		$('.eServiceType').remove();
		$('.stepTd.eCurrentPlaceType .step').addClass('active');
		loadCleaning();
	}

	if (url.get('client_postal_code') != undefined) {
		$('#fieldCurrentZip').val(url.get('client_postal_code'));
	}
	if (url.get('client_city') != undefined) {
		$('#fieldCurrentCity').val(url.get('client_city'));
	}
	if (url.get('moving_postal_code') != undefined) {
		$('#fieldNewZip').val(url.get('moving_postal_code'));
	}
	if (url.get('moving_city') != undefined) {
		$('#fieldNewCity').val(url.get('moving_city'));
	}


	history.pushState({ cardPosition: cardPosition, backwardsTrail: backwardsTrail, cardName: $('.card').eq(cardPosition).data('card-name'), myId: myId }, null, null);

	$(document).on('keydown', function (e) {
	    if (e.which == 27) {
	        hideOverlay();
	    }
	});

	$('#overlaySearch').on('keypress', function (e) {
	    if (e.which == 13) {
	        $('#overlayGrid tr:first-child td:first-child').click();
	    }
	});

	$('#overlay, .overlayClose').click(function () {
		hideOverlay();
	})

	$('.overlayWindow').click(function () {
		return false;
	});

	$('.overlayWindow a').click(function () {
		window.open($(this).attr('href'), '_blank');
		return false;
	});

	$('#overlaySearch').on('change input paste', function () {
		loadOverlaySelect();
	});

	$('textarea, input').on('change input paste focus', function () {
		$(this).removeClass('validationError');
	});

	$('#overlayInsert').on('click', function () {

		userLog('add item: ' + $('#overlayActiveItem').text());

		var itemDom = $('<div class="roomItem"><div class="roomItemEdit"><i class="material-icons">edit</i></div><div class="roomItemQuantity"></div><div class="roomItemText"></div><div class="roomItemSmallText"></div></div>');
		itemDom.find('.roomItemQuantity').text($('#overlayQuantityNumber').val());
		itemDom.find('.roomItemText').text($('#overlayActiveItem').text());
		itemDom.find('.roomItemSmallText').text(itemPropertiesToString());
		itemDom.data('data', JSON.stringify({ name: $('#overlayActiveItem').text(), quantity: $('#overlayQuantityNumber').val(), choices: itemPropertiesToArray(), text: $('#itemSpecialProperties').val() }));
		inventoryPosition.append(itemDom);
		makeButtonsClickable();
		hideOverlay();
	});

	$('#overlayUpdate').on('click', function () {

		userLog('update item: ' + $('#overlayActiveItem').text());

		var itemDom = $('<div class="roomItem"><div class="roomItemEdit"><i class="material-icons">edit</i></div><div class="roomItemQuantity"></div><div class="roomItemText"></div><div class="roomItemSmallText"></div></div>');
		itemDom.find('.roomItemQuantity').text($('#overlayQuantityNumber').val());
		itemDom.find('.roomItemText').text($('#overlayActiveItem').text());
		itemDom.find('.roomItemSmallText').text(itemPropertiesToString());
		itemDom.data('data', JSON.stringify({ name: $('#overlayActiveItem').text(), quantity: $('#overlayQuantityNumber').val(), choices: itemPropertiesToArray(), text: $('#itemSpecialProperties').val() }));
		inventoryPosition.replaceWith(itemDom);
		makeButtonsClickable();
		hideOverlay();
	});

	$('#overlayDelete').on('click', function () {

		// lock to not do it twice
		if (inventoryPosition.hasClass('deleted')) return;
		inventoryPosition.addClass('deleted')

		userLog('delete item: ' + $('#overlayActiveItem').text());

		inventoryPosition.addClass('popOut');
		(function (that) { setTimeout(function () { that.remove(); }, 300); })(inventoryPosition);

		hideOverlay();
	});

	$('.card').eq(0).show();

	userLog('started card ' + $('.card').eq(cardPosition).data('card-name'));


	$(window).focus(function() {
		userLog('window focus');
	});

	$(window).blur(function() {
		userLog('window blur');
	});

	$('.continue').click(function () {

		$('.fakeButton').hide();

		if ($('.card').eq(cardPosition).find('.validate').length > 0) {

			var validationPassed = true;

			$('.card').eq(cardPosition).find('.validate').each(function (i, el) {
				if ($(this).attr('type') == 'email') {
					var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
					if ($(el).val().length == 0 || !testEmail.test($(el).val())) {
						$(el).addClass('validationError');
						validationPassed = false;
					}
				}
				else if ($(this).attr('type') == 'text' && $(this).hasClass('phone')) {
					var testPhone = /^(07[56789]|\+41 *7[56789])/i
					if ($(el).val().length == 0 || !testPhone.test($(el).val())) {
						$(el).addClass('validationError');
						validationPassed = false;
					}
				}
				else if ($(this).hasClass('dateInput')) {
					// only active elements
					if (!$(this).hasClass('disabled')) {
						if ($(el).text() == undefined || $(el).text() == 'Datum' || $(el).text().length == 0) {
							$(el).addClass('validationError');
							validationPassed = false;
						}
					}
				}
				else {
					if ($(el).val().length == 0) {
						$(el).addClass('validationError');
						validationPassed = false;
					}
				}
			});

			if (!validationPassed) {
				$(this).addClass('validationError');
				setTimeout(function () {
					$('.button.validationError').removeClass('validationError');
				}, 300);
				userLog('validation fail card ' + $('.card').eq(cardPosition).data('card-name'));
				return;
			}

		}

		userLog('submitted card ' + $('.card').eq(cardPosition).data('card-name'));

		userLog('time on card ' + $('.card').eq(cardPosition).data('card-name') + ' ' + Math.floor(moment().diff(timestamp) / 1000));

		timestamp = moment();

		$('.card').eq(cardPosition).find('.choiceSelected').removeClass('choiceSelected');
		if ($(this).hasClass('choice')) {
			$(this).addClass('choiceSelected');
		}

		userLog("data:\r\n" + getCardData(cardPosition));

		$('.card').eq(cardPosition).hide();

		// Service not set
		if ($('.card').eq(cardPosition).data('card-name') == 'serviceType') {
			if ($(this).text() == 'Nur Umzug') {
				loadMoving();
			}
			else if ($(this).text() == 'Umzug & Reinigung') {
				loadCombined();
			}
			else if ($(this).text() == 'Nur Reinigung') {
				loadCleaning();
			}
		}

		// Fragen anpassen an die Wohnsituation und ev. überspringen bei WG-Zimmer
		if ($('.card').eq(cardPosition).data('card-name') == 'currentPlaceType') {

			if (!sentSoftConversion && !isFake) {
				sentSoftConversion = true;
				userLog('sent GTM softConversion' + capitalizeFirstLetter(serviceType));
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					'event': 'softConversion' + capitalizeFirstLetter(serviceType)
				});
			}

			$('.back').removeClass('hidden');
			if ($(this).text() == 'Haus') {
				$('.currentPlaceTypeLabel').text('Ihr Haus');
				currentPlaceType = 'house';
				if (serviceType != 'cleaning') {
					incProgress();
				}
			}
			else if ($(this).text() == 'Wohnung') {
				$('.currentPlaceTypeLabel').text('Ihre Wohnung');
				currentPlaceType = 'appartment';
			}
			else if ($(this).text() == 'WG-Zimmer') {
				$('.currentPlaceTypeLabel').text('Ihr WG-Zimmer');
				currentPlaceType = 'wg';
				if (serviceType == 'cleaning') { // grösse überspringen
					incProgress();
				}
			}
			else if ($(this).text() == 'Büro/Lager') {
				$('.currentPlaceTypeLabel').text('Ihr Büro/Lager');
				currentPlaceType = 'bureau';
			}
		}

		// bei Haus die Frage nach Stockwerk überspringen
		if ($('.card').eq(cardPosition).data('card-name') == 'currentPlaceSize' && currentPlaceType == 'house') {
			if (serviceType != 'cleaning') {
				incProgress();
			}
		}

		// bei WG die Grösse überspringen
		if ($('.card').eq(cardPosition).data('card-name') == 'currentPlaceFloor' && currentPlaceType == 'wg') {
			if (serviceType != 'cleaning') {
				incProgress();
			}
		}

		// ohne Reinigung?
		if ($('.card').eq(cardPosition).data('card-name') == 'cleaningOptions') {
			if (!$('#cleaningBool').hasClass('isChecked')) {
				incProgress();
				incProgress();
				incProgress();
				incProgress();
			}
		}

		// Fragen anpassen an die Wohnsituation und ev. überspringen bei WG-Zimmer
		if ($('.card').eq(cardPosition).data('card-name') == 'newPlaceType') {
			if ($(this).text() == 'Haus') {
				$('.newPlaceTypeLabel').text('Ihr neues Haus');
				newPlaceType = 'house';
				incProgress();
				incProgress();
			}
			else if ($(this).text() == 'Wohnung') {
				$('.newPlaceTypeLabel').text('Ihre neue Wohnung');
				newPlaceType = 'appartment';
			}
			else if ($(this).text() == 'WG-Zimmer') {
				$('.newPlaceTypeLabel').text('Ihr neues WG-Zimmer');
				newPlaceType = 'wg';
			}
			else if ($(this).text() == 'Büro/Lager') {
				$('.newPlaceTypeLabel').text('Ihr neues Büro/Lager');
				newPlaceType = 'bureau';
			}
		}

		incProgress();
		$('.card').eq(cardPosition).show();

		userLog('started card ' + $('.card').eq(cardPosition).data('card-name'));

		backwardsTrail.push(cardPosition);

		history.pushState({ cardPosition: cardPosition, backwardsTrail: backwardsTrail, cardName: $('.card').eq(cardPosition).data('card-name'), myId: myId }, null, null);

		// done
		if ($('.card').eq(cardPosition).data('card-name') == 'complete') {
			invalid = true;
			$('.footer').hide();
			if (!isFake) {
				userLog('sent GTM inquiryConversion' + capitalizeFirstLetter(serviceType));
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					'event': 'inquiryConversion' + capitalizeFirstLetter(serviceType)
				});
			}
			userLog('completed');
			sendCompletedInquiry();
		}


		$(window).scrollTop(0);

	});

	$('#resendCompletedInquiry').click(function () {
		sendCompletedInquiry();
	})

	$('.fakeButton').click(function () {
		userLog('is fake');
		isFake = true;
		$(this).addClass('orange');
	});

	$('.moreInfo').click(function () {
		showOverlayInfo();
		userLog('clicked info button on ' + $('.card').eq(cardPosition).data('card-name'));
	});

	$('.numberDialMinus').click(function () {
		var steps = parseFloat($(this).next().data('steps'));
		var min = parseFloat($(this).next().attr('min'));
		if (parseFloat($(this).next().val()) - steps < min) return;
		$(this).next().val(parseFloat($(this).next().val()) - steps);
	});

	$('.numberDialPlus').click(function () {
		var steps = parseFloat($(this).prev().data('steps'));
		var max = parseFloat($(this).prev().attr('max'));
		if (parseFloat($(this).prev().val()) + steps > max) return;
		$(this).prev().val(parseFloat($(this).prev().val()) + steps);
	});

	$('#overlayGrid td').click('click', function () {

		if (!$(this).hasClass('active')) return;

		if (selectType == 'ROOM') {

			userLog('add room: ' + $(this).text());

			var roomDom = $('<div class="room"><div class="roomRemove"><i class="material-icons">clear</i></div><div class="roomName"></div><div class="roomContent"><div class="roomItems"></div><div class="roomAddItem button buttonWithIcon"><i class="material-icons">add_circle</i> Gegenstand</div></div></div>');
			roomDom.find('.roomName').text($(this).text());

			$('#rooms').append(roomDom);

			hideOverlay();

		}

		else if (selectType == 'ITEM') {

			$('#overlayActiveItem').text($(this).text());
			$('#overlayQuantityNumber').val('1');
			$('#itemSpecialProperties').val('');

			$('#overlayInsert').show();
			$('#overlayDelete').hide();
			$('#overlayUpdate').hide();

			loadOverlayProperties();

			showOverlayOptions();

			$('.completeInventory').show();

		}

		makeButtonsClickable();

	});

	window.onpopstate = function(e){
		

		var state = event.state || { cardPosition: 0, backwardsTrail: [] };

		if (invalid || state.myId != myId || state.cardName == 'serviceType') {
			userLog('backbutton out of session');

			$('body').html('Ungültige Sitzung. Bitte neu laden!');
			invalid = true;
			return;
		}

			userLog('went back.')

			userLog('time on card ' + $('.card').eq(cardPosition).data('card-name') + ' ' + Math.floor(moment().diff(timestamp) / 1000));

			timestamp = moment();


			$('.card').eq(cardPosition).hide();

			backwardsTrail = state.backwardsTrail;

			if (state.cardPosition < cardPosition) {
				while (state.cardPosition < cardPosition) {
					decProgress();
				}
			}
			else {

				while (state.cardPosition > cardPosition) {
					incProgress();
				}
			}

			if ($('.card').eq(cardPosition).data('card-name') == 'currentPlaceType') {
				$('.back').addClass('hidden');
			}

			$('.card').eq(cardPosition).show();

			userLog('started card ' + $('.card').eq(cardPosition).data('card-name'));

		

	};

	$('.back').click(function () {

		if ($(this).hasClass('hidden')) return;

		window.history.back();

	});

	var picker;

	var pikadayi18n = {
		previousMonth : 'Vormonat',
        nextMonth     : 'Nächster Monat',
        months        : ['Januar','Februar', 'März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
        weekdays      : ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
        weekdaysShort : ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
	};

	picker = new Pikaday({
		field: document.getElementById('dateMovingAt'),
		firstDay: 1,
		i18n: pikadayi18n,
    	format: 'DD.MM.YYYY',
    	onOpen: function() {
    		$('#dateMovingAt').removeClass('validationError');
    	}
	});

	picker = new Pikaday({
		field: document.getElementById('dateMovingFrom'),
		firstDay: 1,
		i18n: pikadayi18n,
    	format: 'DD.MM.YYYY',
    	onOpen: function() {
    		$('#dateMovingFrom').removeClass('validationError');
    	}
	});

	picker = new Pikaday({
		field: document.getElementById('dateMovingTo'),
		firstDay: 1,
		i18n: pikadayi18n,
    	format: 'DD.MM.YYYY',
    	onOpen: function() {
    		$('#dateMovingTo').removeClass('validationError');
    	}
	});

	picker = new Pikaday({
		field: document.getElementById('dateCleaningAt'),
		firstDay: 1,
		i18n: pikadayi18n,
    	format: 'DD.MM.YYYY',
    	onOpen: function() {
    		$('#dateCleaningAt').removeClass('validationError');
    	}
	});

	picker = new Pikaday({
		field: document.getElementById('dateCleaningFrom'),
		firstDay: 1,
		i18n: pikadayi18n,
    	format: 'DD.MM.YYYY',
    	onOpen: function() {
    		$('#dateCleaningFrom').removeClass('validationError');
    	}
	});

	picker = new Pikaday({
		field: document.getElementById('dateCleaningTo'),
		firstDay: 1,
		i18n: pikadayi18n,
    	format: 'DD.MM.YYYY',
    	onOpen: function() {
    		$('#dateCleaningTo').removeClass('validationError');
    	}
	});

	$(function() {
	  $('input[readonly]').on('touchstart', function(ev) {
	    return false;
	  });
	});

	$(function() {
	  $('input[readonly]').on('focus', function(ev) {
	    $(this).trigger('blur');
	  });
	});


	userLogStart();

	userLog('referrer: ' + document.referrer);
	referrer = document.referrer;

	makeButtonsClickable();

	// skipForTesting();

});

function skipForTesting() {

	loadCombined();

	$('.card').eq(cardPosition).hide();

	for (var i = 0; i < 12; i++) {
		incProgress();
	}
	
	$('.card').eq(cardPosition).show();

	userLog('started card ' + $('.card').eq(cardPosition).data('card-name'));

}

function loadOverlaySelect() {

	var values;

	if (selectType == 'ROOM') {
		values = inventoryDataRoom;
		//$('#overlaySearch').attr('placeholder', 'Zimmer suchen...');
	}
	else if (selectType == 'ITEM') {
		if (inventoryItemShowcase[inventoryRoom] == undefined) {
			values = inventoryDataItem;
		}
		else {
			values = uniq(inventoryItemShowcase[inventoryRoom].concat(inventoryDataItem));
		}
		//$('#overlaySearch').attr('placeholder', 'Gegenstand suchen...');
	}

	var exactMatch = false;

	// filter 
	
	if ($('#overlaySearch').val() != '') {
		values = values.filter(function (el) { 
			if (el.toLowerCase() == $('#overlaySearch').val().toLowerCase()) exactMatch = true;
			return el.toLowerCase().search($('#overlaySearch').val().toLowerCase()) >= 0
		});
	}
	

	var specialItemInserted = false;

	for (var i = 0; i < 9; i++) {

		var itemDom = $('#overlayGrid td').eq(i);
		if (i < values.length) {
			itemDom.find('.overlayGridLabel').text(values[i]);
			if (inventoryDataItemImages[values[i]] == undefined || inventoryDataItemImages[values[i]] == '')  {
				itemDom.find('.overlayGridIcon').attr('src', 'img/star.svg'); //default
				itemDom.find('.overlayGridIcon').show();
			}
			else {
				itemDom.find('.overlayGridIcon').attr('src', 'img/' + inventoryDataItemImages[values[i]] + '.svg');
				itemDom.find('.overlayGridIcon').show();
			}
			itemDom.addClass('active');
		}
		else if (!specialItemInserted && !exactMatch && values.length == 0) {
			itemDom.find('.overlayGridLabel').text($('#overlaySearch').val());
			itemDom.find('.overlayGridIcon').attr('src', 'img/star.svg'); //default
			itemDom.find('.overlayGridIcon').show();
			specialItemInserted = true;
			itemDom.addClass('active');
		}
		else {
			itemDom.find('.overlayGridLabel').text('');
			itemDom.find('.overlayGridIcon').hide();
			itemDom.removeClass('active');
		}

	}

}

function showOverlaySelect() {
	$('#overlaySearch').val('');
	$('#overlay .overlayInfo').hide();
	$('#overlay .overlaySelect').show();
	$('#overlay .overlayOptions').hide();
	loadOverlaySelect();

	if (!supportsTouch) {
		setTimeout(function () {
			$('#overlaySearch').focus();
		}, 100);
	}

	$('#overlay').fadeIn(100);
	$('.overlayWindow').slideDown(100);
}

function showOverlayOptions() {
	$('#overlay .overlayInfo').hide();
	$('#overlay .overlaySelect').hide();
	$('#overlay .overlayOptions').show();
	$('#overlay').fadeIn(100);
	$('.overlayWindow').slideDown(100);
}

function showOverlayInfo() {
	$('#overlay .overlayInfo').show();
	$('#overlay .overlaySelect').hide();
	$('#overlay .overlayOptions').hide();

	$('.overlayInfo .infoCard').hide();
	$('.overlayInfo .i-' + $('.card').eq(cardPosition).data('card-name')).show();

	$('#overlay').fadeIn(100);
	$('.overlayWindow').slideDown(100);
}

function hideOverlay() {
	$('#overlay').hide();
	$('.overlayWindow').hide();
}

function makeButtonsClickable() {

	$('.buttonCheck').off('click').on('click', function () {
		$(this).toggleClass('isChecked');

		if ($(this).hasClass('groupExpand')) {
			$(this).parent().find('.checkGroupExpander').slideToggle();
			$(this).parent().find('.checkGroupExpander .toggleValidate').toggleClass('validate');
		}
	});

	$('.buttonRadio').off('click').on('click', function () {
		$(this).parent().find('.buttonRadio').removeClass('isChecked');
		$(this).addClass('isChecked');

		$(this).parent().find('.dateInput').addClass('disabled');
		$(this).parent().find('input').removeClass('validationError');
		if ($(this).next().hasClass('followingRadio')) {
			$(this).next().find('.dateInput').removeClass('disabled');
		}

	});

	$('.addRoom').off('click').on('click', function () {
		
		userLog('add room start');

		selectType = 'ROOM';

		showOverlaySelect();

	});

	$('.roomAddItem').off('click').on('click', function () {

		userLog('add item start');

		selectType = 'ITEM';
		inventoryPosition = $(this).parent().find('.roomItems');
		inventoryRoom = $(this).parent().parent().find('.roomName').text();
		
		showOverlaySelect();

	});

	$('.roomRemove').off('click').on('click', function () {

		// lock to not do it twice
		if ($(this).hasClass('deleted')) return;
		$(this).addClass('deleted')

		$(this).parent().addClass('popOut');
		(function (that) { setTimeout(function () { that.remove(); }, 300); })($(this).parent());

	});

	$('.roomItemEdit').off('click').on('click', function () {

		inventoryPosition = $(this).parent();

		$('#overlayActiveItem').text(JSON.parse($(this).parent().data('data')).name);
		$('#overlayQuantityNumber').val(JSON.parse($(this).parent().data('data')).quantity);

		loadOverlayProperties();

		arrayToItemProperties(JSON.parse($(this).parent().data('data')).choices);
		$('#itemSpecialProperties').val(JSON.parse($(this).parent().data('data')).text);

		$('#overlayInsert').hide();
		$('#overlayDelete').show();
		$('#overlayUpdate').show();


		showOverlayOptions();

		makeButtonsClickable();

	});

}

function loadOverlayProperties() {
	var item = $('#overlayActiveItem').text();

	$('#overlayProperties').empty();

	if (inventoryItemProperties[item] == undefined) return;

	for (var i = 0; i < inventoryItemProperties[item].length; i++) {
		var group = inventoryItemProperties[item][i];

		var groupDom = $('<div class="overlayPropertyGroup"><h1></h1><p></p></div>');
		groupDom.find('h1').text(group.title);

		for (var j = 0; j < group.options.length; j++) {
			var optionDom;
			if (group.type == 'check') {
				optionDom = $('<div class="buttonCheck"><i class="material-icons unchecked">check_box_outline_blank</i><i class="material-icons checked">check_box</i><span class="label"></div><br/>');
			}
			else if (group.type == 'radio') {
				optionDom = $('<div class="buttonRadio"><i class="material-icons unchecked">radio_button_unchecked</i><i class="material-icons checked">radio_button_checked</i><span class="label"></div><br/>');
				if (j == 0) {
					optionDom.addClass('isChecked');
				}
			}
			optionDom.find('.label').text(group.options[j]);
			groupDom.append(optionDom);
		}

		$('#overlayProperties').append(groupDom);
	}

	overlayProperties
}

var selectType = undefined;
var inventoryPosition = undefined;
var inventoryRoom = undefined;

function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


















// data

var inventoryItemShowcase = {
	'Wohnzimmer': [
		'Sofa / Couch',
		'TV / Fernseher',
		'Tisch',
		'Sideboard',
		'Stuhl',
		'Couchtisch',
		'Regal',
		'Sessel',
		'Lampe'

	],
	'Schlafzimmer': [
		'Bett',
		'Kommode',
		'Schrank',
		'Regal',
		'Nachttisch',
		'Stuhl',
		'Sideboard',
		'Bürotisch / Schreibtisch',
		'Lampe'

	],
	'Esszimmer': [
		'Tisch',
		'Stuhl',
		'Sideboard',
		'Regal',
		'Kommode',
		'Pflanze',
		'Lampe',
		'Teppich',
		'Bürotisch / Schreibtisch'
	],
	'Küche': [
		'Tisch',
		'Stuhl',
		'Regal',
		'Mikrowelle',
		'Kommode',
		'Sideboard',
		'Schrank',
		'Staubsauger',
		'Kühlschrank'

	],
	'Bad & Gang': [
		'Regal',
		'Kommode',
		'Schuhschrank',
		'Spiegel',
		'Sideboard',
		'Schrank',
		'Teppich',
		'Bild',
		'Kleiderständer'

	],
	'Büro': [
		'Bürotisch / Schreibtisch',
		'Tisch',
		'Bürostuhl',
		'Stuhl',
		'Schrank',
		'Regal',
		'Kommode',
		'Sideboard',
		'Korpus'
	],
	'Dachboden': [
		'Regal',
		'Schrank',
		'Mottenschrank',
		'Koffer',
		'Zusätzliche Matratze',
		'Fahrrad',
		'Lampe',
		'Reifen',
		'Ski / Snowboard'
	],
	'Keller': [
		'Regal',
		'Mottenschrank',
		'Fahrrad',
		'Koffer',
		'Schrank',
		'Tisch',
		'Stuhl',
		'Reifen',
		'Ski / Snowboard'
	],
	'Garage': [
		'Reifen',
		'Regal',
		'Fahrrad',
		'Schrank',
		'Tisch',
		'Stuhl',
		'Kommode',
		'Ski / Snowboard',
		'Kinderwagen / Buggy'
	],
	'Garten / Balkon': [
		'Stuhl',
		'Tisch',
		'Grill',
		'Pflanze',
		'Liegestuhl',
		'Gartentisch',
		'Sofa / Couch',
		'Couchtisch',
		'Blumentröge'
	],
	'Kinderzimmer': [
		'Schrank',
		'Kommode',
		'Kinderbett',
		'Regal',
		'Wickelkommode',
		'Teppich',
		'Lampe',
		'Kinderwagen / Buggy',
		'Dreirad / Traktor',
	],
	'Reduit / Abstellkammer': [
		'Regal',
		'Bügelbrett',
		'Staubsauger',
		'Kommode',
		'Waschmaschine',
		'Tumbler',
		'Lampe',
		'Schrank',
		'Stuhl',
	],
}

var inventoryDataRoom = [
	/*
		'Wohnzimmer',
		'Schlafzimmer',
		'Esszimmer',
		'Küche',
		'Badzimmer / Gang',
		'Büro',
		'Estrich',
		'Keller',
		'Garage',
		'Garten',
		'Kinderzimmer',
		'Vorratskammer'
		*/

	'Wohnzimmer',
	'Schlafzimmer',
	'Esszimmer',
	'Küche',
	'Bad & Gang',
	'Büro',
	'Dachboden',
	'Keller',
	'Garage',
	'Garten / Balkon',
	'Kinderzimmer',
	'Reduit / Abstellkammer'
];

var inventoryDataItem = [
	'Stuhl',
	'Schrank',
	'Tisch',
	'Lampe',
	'Bett',
	'Regal',
	'Sofa / Couch',
	'TV / Fernseher',
	'Sideboard',
	'Teppich',
	'Kommode',
	'Pflanze',
	'Spiegel',
	'Bild',
	'Couchtisch',
	'Nachttisch',
	'Sessel',
	'Deckenlampe',
	'Stehlampe',
	'Lampensystem',
	'Wohnwand modern',
	'Doppelbett',
	'Sitzbank',
	'Fahrrad',
	'Katzenbaum',
	'Truhe',
	'Bürostuhl',
	'Bürotisch / Schreibtisch',
	'Nachttischlampe',
	'Einzelbett',
	'Couchbett',
	'Hochbett',
	'Boxspringbett',
	'Wasserbett',
	'Klappbett',
	'Himmelbett',
	'Liegestuhl',
	'Grill',
	'Piano / Klavier',
	'Schuhschrank',
	'Reifen',
	'Babystuhl',
	'Ecksofa',
	'Wickelkommode',
	'Schemmel',
	'Sekretär',
	'Vitrine',
	'Beistelltisch',
	'Rolladenschrank',
	'Gartentisch',
	'Mottenschrank',
	'Bauernschrank',
	'Klapptisch',
	'Buffet',
	'Korpus',
	'Eckschreibtisch',
	'Tischlampe',
	'Kronleuchter',
	'Stereoanlage',
	'PC / Zubehör',
	'Lautsprecher',
	'Plattenspieler',
	'Verstärker für Instrumente',
	'Mikrowelle',
	'Drucker / Kopierer',
	'Geschirrspüler',
	'Kühlschrank',
	'Tiefkühler',
	'Skibox',
	'Tumbler',
	'Ski / Snowboard',
	'Tiefkühltruhe',
	'Camping-set',
	'Dreirad / Traktor',
	'Weinkühler',
	'Staubsauger',
	'Wäschekorb',
	'Hometrainer',
	'Waschmaschine',
	'Stepper',
	'Laufband',
	'Surfboard',
	'Rudergerät',
	'Hantelbank + Gewichte',
	'Kinderbett',
	'Tresor',
	'Blumentröge',
	'Standuhr',
	'Wanduhr',
	'Skulptur',
	'Etagenbett',
	'Hausbar / Tresen',
	'Bügelbrett',
	'Bettkasten',
	'Servierboy',
	'Kleiderständer',
	'Koffer',
	'Kinderwagen / Buggy',
	'Zusätzliche Matratze ',
	'Korb',
	'E-Piano',
	'Schlagzeug',
	'Keyboard',
	'Flügel',
	'Schminktisch',
	'Kaffeemaschine',
	'Werkzeug',
];


var inventoryDataItemImages = {
	'Stuhl'						: 'chair',
	'Schrank' 					: 'closet',
	'Tisch' 					: 'dining-table',
	'Lampe' 					: 'floor-lamp',
	'Bett'						: 'single-bed',
	'Regal' 					: 'shelf',
	'Sofa / Couch' 				: 'couch',
	'TV / Fernseher' 			: 'tv',
	'Sideboard' 				: 'sideboard',
	'Teppich' 					: 'carpet',
	'Kommode' 					: 'chest-of-drawers',
	'Pflanze'					: 'plant',
	'Spiegel' 					: 'miror',
	'Bild' 						: 'picture',
	'Couchtisch'				: 'couch-table',
	'Nachttisch'				: 'bedside-table',
	'Sessel' 					: 'armchair',
	'Deckenlampe'				: 'ceiling-light',
	'Stehlampe'					: 'floor-lamp',
	'Lampensystem'				: 'lamp-system',
	'Wohnwand modern' 			: 'wall-unit-modern',
	'Doppelbett' 				: 'double-bed',
	'Sitzbank' 					: 'straight-bench',
	'Fahrrad'					: 'bicycle',
	'Katzenbaum' 				: 'cat-tree',
	'Truhe' 					: 'chest',
	'Bürostuhl'					: 'office-chair',
	'Bürotisch / Schreibtisch'	: 'office-desk',
	'Nachttischlampe'			: 'bedside-lamp',
	'Einzelbett'				: 'single-bed',
	'Couchbett' 				: 'corner-bed',
	'Hochbett'					: 'canopy-bed',
	'Boxspringbett'				: 'boxspring-bed',
	'Wasserbett' 				: 'water-bed',
	'Klappbett' 				: 'folding-bed',
	'Himmelbett' 				: 'canopy-bed',
	'Liegestuhl' 				: 'garden-chair',
	'Grill'						: 'grill',
	'Piano / Klavier' 			: 'upright-piano',
	'Schuhschrank' 				: 'shoe-cabinet',
	'Reifen'					: 'tires',
	'Babystuhl' 				: 'baby-chair',
	'Ecksofa' 					: 'corner-couch',
	'Wickelkommode' 			: 'baby-changing-table',
	'Schemmel' 					: 'small-stool',
	'Sekretär' 					: 'secretary-desk',
	'Vitrine' 					: 'showcase',
	'Beistelltisch'				: 'side-table',
	'Rolladenschrank' 			: 'roller-shutter-cupboard',
	'Gartentisch'				: 'garden-table',
	'Mottenschrank' 			: 'portable-wardrobe-organiser',
	'Bauernschrank' 			: 'country-wardrobe',
	'Klapptisch'				: 'folding-table',
	'Buffet' 					: 'buffet',
	'Korpus' 					: 'korpus',
	'Eckschreibtisch'			: 'corner-office-desk',
	'Tischlampe'				: 'table-lamp',
	'Kronleuchter'				: 'chandelier',
	'Stereoanlage' 				: 'stereo-system',
	'PC / Zubehör' 				: 'computer-and-accessories',
	'Lautsprecher' 				: 'loudspeakers',
	'Plattenspieler' 			: 'record-player',
	'Verstärker für Instrumente': 'amplifier',
	'Mikrowelle'				: 'microwave',
	'Drucker / Kopierer' 		: 'printer-copier',
	'Geschirrspüler' 			: 'dishwasher',
	'Kühlschrank'				: 'refrigerator',
	'Tiefkühler'				: 'freezer',
	'Skibox'					: 'ski-case',
	'Tumbler'					: 'tumble-dryer',
	'Ski / Snowboard'			: 'skis-or-snowboard',
	'Tiefkühltruhe'				: 'chest-freezer',
	'Camping-set'				: 'camping-set',
	'Dreirad / Traktor'			: 'tricycle',
	'Weinkühler'				: 'wine-cooler',
	'Staubsauger' 				: 'vacuum-cleaner',
	'Wäschekorb'				: 'laundry-basket',
	'Hometrainer' 				: 'exercise-bike',
	'Waschmaschine'				: 'washing-machine',
	'Stepper'					: 'stepper',
	'Laufband'					: 'treadmill',
	'Surfboard'					: 'surfboard',
	'Rudergerät' 				: 'rowing-machine',
	'Hantelbank + Gewichte'		: 'weight-bench-n-weights',
	'Kinderbett'				: 'baby-crib-cot',
	'Tresor'					: 'safe',
	'Blumentröge' 				: 'flower-planters',
	'Standuhr' 					: 'grandfather-clock',
	'Wanduhr' 					: 'wall-clock',
	'Skulptur'					: 'sculpture',
	'Etagenbett'				: 'bunk-bed',
	'Hausbar / Tresen' 			: 'house-bar-counter',
	'Bügelbrett' 				: 'ironing-board',
	'Bettkasten' 				: 'bedding-box',
	'Servierboy' 				: 'food-cart',
	'Kleiderständer' 			: 'stands-pillars',
	'Koffer'					: 'suitcase',
	'Kinderwagen / Buggy' 		: 'stroller-buggy',
	'Zusätzliche Matratze'		: 'additional-mattress-single',
	'Korb'						: 'basket',
	'E-Piano'					: 'digital-piano',
	'Schlagzeug'				: 'drums',
	'Keyboard'					: 'keyboard',
	'Flügel'					: 'upright-piano'
};


var inventoryItemProperties = {
	'Bett': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Doppelbett',
				'Einzelbett',
				'Couchbett',
				'Hochbett',
				'Boxspringbett',
				'Wasserbett',
				'Klappbett',
				'Himmelbett',
				'Etagenbett'
			]
		},
	],
	'Tresor': [
		{
			type:
				'radio',
			title:
				'Gewicht',
			options: [
				'Über 80kg',
				'Über 150kg',
				'Über 200kg'
			]
		},
	],
	'Skulptur': [
		{
			type:
				'radio',
			title:
				'Gewicht',
			options: [
				'Bis 1m x 1m',
				'Bis 2m x 2m',
				'Über 2mx 2m'
			]
		},
	],
	'TV / Fernseher': [
		{
			type:
				'radio',
			title:
				'Gewicht',
			options: [
				'Bis 40 Zoll (ca. 1m)',
				'Bis 80 Zoll (ca. 2m)',
				'Mehr als 80 Zoll'
			]
		},
	],
	'Standuhr': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Klein',
				'Grösse'
			]
		},
	],
	'Fügel': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Klein',
				'Grösse'
			]
		},
	],
	'Wanduhr': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Klein',
				'Grösse'
			]
		},
	],
	'Blumentröge': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Leer',
				'Voll'
			]
		},
	],
	'Bild': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Bis zu 1m x 1m',
				'Bis zu 1.5m x 1.5m',
				'Mehr als 1.5m x 1.5m'
			]
		},
	],
	'Hantelbank + Gewichte': [
		{
			type:
				'radio',
			title:
				'Gewicht',
			options: [
				'100kg',
				'200kg',
			]
		},
	],
	'Stereoanlage': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Klein',
				'Gross',
			]
		},
	],
	'Kühlschrank': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Klein',
				'Gross',
			]
		},
	],
	'Ecksofa': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'2-teiliges',
				'3-teiliges'
			]
		},
	],
	'Gartentisch': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Holz',
				'Metall',
				'Glas'
			]
		},
	],
	'Vitrine': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'1-türig',
				'2-türig'
			]
		},
	],
	'Buffet': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Buffet mit Aufsatz',
				'Buffet ohne Aufsatz'
			]
		},
	],
	'Bauernschrank': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'1-türig',
				'2-türig',
				'3-türig'
			]
		},
	],
	'Sitzbank': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Gerade Bank',
				'Eckband'
			]
		},
	],
	'Grill': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Bis zu 1m x 1m',
				'Bis zu 1.5m x 1.5m',
				'Mehr als 1.5m x 1.5m'

			]
		},
	],
	'Fahrrad': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Erwachsenen Fahrrad',
				'Kinderfahrrad',
				'Fahrradanhänger'
			]
		},
	],
	'Couchtisch': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Bis zu 0.6m x 0.6m',
				'Bis zu 0.6m x 1.2m',
				'Grösser als 0.6m x 1.2m'
			]
		},
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Holz & ähnliches',
				'Stein oder Metall',
				'Glas'
			]
		},
	],
	'Bürotisch / Schreibtisch': [
	{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Bis zu 1.2m',
				'Grösser als 1.2m'
			]
		},
	],
	'Kommode': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'0.6m x 0.6m',
				'Bis zu 1.2m x 0.6m',
				'Bis zu 1.2m x 1.2m',
				'Bis zu 1.2m x 1.8m'
			]
		},
	],
	'Pflanze': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Bis zu 1m',
				'Bis zu 1.5m',
				'Bis zu 2m',
				'Mehr als 2m'
			]
		},
		{
			type:
				'radio',
			title:
				'Gewicht',
			options: [
				'schwerer als 60kg',
				'leichter als 60kg'
			]	
		}
	],
	'Regal': [
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Abbaubar',
				'Nicht abbaubar'
			]
		},
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'0.6m x 0.6m',
				'0.6m x 1.2m',
				'0.6m x 1.8m',
				'Über 0.6m x 1.8m',
				'1.2m x 1.2m',
				'1.2m x 1.8m',
				'Über 1.2m x 1.8m',
				'1.8 x 1.8m',
				'Über 1.8m x 1.8m'

			]
		}
	],
	'Schrank': [
		{
			type:
				'radio',
			title:
				'Türen',
			options: [
				'1-türig',
				'2-türig',
				'3-türig',
				'4-türig',
				'5-türig und mehr'
			]
		},
		{
			type:
				'check',
			title:
				'Optionen',
			options: [
				'Rückwand genagelt',
				'Schiebetür',
				'Bauernschrank'
			]
		}
	],
	'Sideboard': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'Bis zu 1.2m lang',
				'Bis zu 1.8m lang',
				'Bis zu 2.4m lang',
				'Mehr als 1.5m x 3m'
			]
		},
	],
	'Wohnwand modern': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'2-teilig',
				'3-teilig',
				'4-teilig',
				'5-teilig'
			]
		},
	],
	'Sofa / Couch': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'2 Personen',
				'3-4 Personen',
				'5+ Personen',
			]
		},
	],
	'Spiegel': [
		{
			type:
				'check',
			title:
				'Grösse',
			options: [
				'Bis 1m x 1m',
				'Bis 2m x 1m',
				'Mehr als 2m x 1m',
			]
		},
	],
	'Tisch': [
		{
			type:
				'radio',
			title:
				'Grösse',
			options: [
				'2-4 Personen',
				'6-8 Personen',
				'9+ Personen',
			]
		},
		{
			type:
				'radio',
			title:
				'Art',
			options: [
				'Holz',
				'Stein/Metall',
				'Glas'
			]
		}
	]
};
