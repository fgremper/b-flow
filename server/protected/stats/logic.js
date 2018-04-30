var stats = {
	all: 0,
	ipMovu: 0,
	ipOther: 0,
	fake: 0,
	nonFake: 0,
	referrerHomegate: 0,
	referrerNewhome: 0,
	referrerGoogle: 0,
	referrerAny: 0,
	referrerOther: 0,
	serviceTypeCombined: 0,
	serviceTypeMoving: 0,
	serviceTypeCleaning: 0,
	startedServiceType: 0,
	startedCurrentPlaceType: 0,
	startedCurrentPlaceFloor: 0,
	startedCurrentPlaceSize: 0,
	startedCurrentPlaceElevator: 0,
	startedCurrentPlaceAccessibility: 0,
	startedCleaningOptions: 0,
	startedCleaningBath: 0,
	startedCleaningWindows: 0,
	startedCleaningBlinds: 0,
	startedCleaningAdditional: 0,
	startedNumPeople: 0,
	startedInventory: 0,
	startedBoxes: 0,
	startedNewPlaceType: 0,
	startedNewPlaceFloor: 0,
	startedNewPlaceElevator: 0,
	startedNewPlaceAccessibility: 0,
	startedAdditionalServices: 0,
	startedDates: 0,
	startedAddress: 0,
	startedContact: 0,
	submittedServiceType: 0,
	submittedCurrentPlaceType: 0,
	submittedCurrentPlaceFloor: 0,
	submittedCurrentPlaceSize: 0,
	submittedCurrentPlaceElevator: 0,
	submittedCurrentPlaceAccessibility: 0,
	submittedCleaningOptions: 0,
	submittedCleaningBath: 0,
	submittedCleaningWindows: 0,
	submittedCleaningBlinds: 0,
	submittedCleaningAdditional: 0,
	submittedNumPeople: 0,
	submittedInventory: 0,
	submittedBoxes: 0,
	submittedNewPlaceType: 0,
	submittedNewPlaceFloor: 0,
	submittedNewPlaceElevator: 0,
	submittedNewPlaceAccessibility: 0,
	submittedAdditionalServices: 0,
	submittedDates: 0,
	submittedAddress: 0,
	submittedContact: 0,
	today: 0,
	lead: 0,
	leadSecond: 0,
	completed: 0,
}

var clientsPerFlag = {
	all: [],
	ipMovu: [],
	ipOther: [],
	fake: [],
	nonFake: [],
	referrerHomegate: [],
	referrerNewhome: [],
	referrerGoogle: [],
	referrerAny: [],
	referrerOther: [],
	serviceTypeCombined: [],
	serviceTypeMoving: [],
	serviceTypeCleaning: [],
	startedServiceType: [],
	startedCurrentPlaceType: [],
	startedCurrentPlaceFloor: [],
	startedCurrentPlaceSize: [],
	startedCurrentPlaceElevator: [],
	startedCurrentPlaceAccessibility: [],
	startedCleaningOptions: [],
	startedCleaningBath: [],
	startedCleaningWindows: [],
	startedCleaningBlinds: [],
	startedCleaningAdditional: [],
	startedNumPeople: [],
	startedInventory: [],
	startedBoxes: [],
	startedNewPlaceType: [],
	startedNewPlaceFloor: [],
	startedNewPlaceElevator: [],
	startedNewPlaceAccessibility: [],
	startedAdditionalServices: [],
	startedDates: [],
	startedAddress: [],
	startedContact: [],
	submittedServiceType: [],
	submittedCurrentPlaceType: [],
	submittedCurrentPlaceFloor: [],
	submittedCurrentPlaceSize: [],
	submittedCurrentPlaceElevator: [],
	submittedCurrentPlaceAccessibility: [],
	submittedCleaningOptions: [],
	submittedCleaningBath: [],
	submittedCleaningWindows: [],
	submittedCleaningBlinds: [],
	submittedCleaningAdditional: [],
	submittedNumPeople: [],
	submittedInventory: [],
	submittedBoxes: [],
	submittedNewPlaceType: [],
	submittedNewPlaceFloor: [],
	submittedNewPlaceElevator: [],
	submittedNewPlaceAccessibility: [],
	submittedAdditionalServices: [],
	submittedDates: [],
	submittedAddress: [],
	submittedContact: [],
	today: [],
	lead: [],
	leadSecond: [],
	completed: [],
};

var allClients = [];

var total = 0;
var count = 0;

$(document).ready(function () {

	Object.keys(clientsPerFlag).forEach(function(key) {
		$('#filters').append('<span class="filter">' + key + '</span>');
	});

	$('.filter').click(function () {
		$(this).toggleClass('active');
		updateFilter();
	});

	updateClients();
});

function updateClients() {
	$.get('../get_progress_files.php?_=' + new Date().getTime())
	.done(function (data) {
		var files = data.split("\r\n");
		files.pop();
		total = files.length;
		for (var i = 0; i < files.length; i++) {
			var fileWithoutTxt = files[i].substr(0, files[i].length - 4);
			updateIndividualClient(fileWithoutTxt);
		}
	});
}

function updateIndividualClient(name) {
	$.get('../data/progress/' + name + '.txt?_=' + new Date().getTime())
	.done(function (data) {
		var lines = data.split("\r\n");

		var flags = [];

		flags.push('all');
		if (searchRegexInArray(/^ip: 212\.51\.146\.240$/, lines)) flags.push('ipMovu');
		if (searchRegexInArray(/^ip: .*/, lines) && !searchRegexInArray(/^ip: 212\.51\.146\.240/, lines)) flags.push('ipOther');
		if (searchRegexInArray(/^is fake$/, lines) || searchRegexInArray(/^submitted card serviceType$/, lines)) flags.push('fake');
		if (!searchRegexInArray(/^is fake$/, lines) && !searchRegexInArray(/^submitted card serviceType$/, lines)) flags.push('nonFake');
		if (searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?utm_source=homegate\.ch.*/, lines)) flags.push('referrerHomegate');
		if (searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?utm_source=newhome\.ch.*/, lines)) flags.push('referrerNewhome');
		if (searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?gclid=.*/, lines)) flags.push('referrerGoogle');
		if (searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?utm_source=homegate\.ch.*/, lines) || searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?utm_source=newhome\.ch.*/, lines) || searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?gclid=.*/, lines)) flags.push('referrerAny');
		if (!searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?utm_source=homegate\.ch.*/, lines) && !searchRegexInArray(/^referrer: https:\/\/www.movu.ch\/de\/alpha\/\?gclid=.*/, lines)) flags.push('referrerOther');
		if (searchRegexInArray(/^serviceType combined$/, lines)) flags.push('serviceTypeCombined');
		if (searchRegexInArray(/^serviceType cleaning$/, lines)) flags.push('serviceTypeCleaning');
		if (searchRegexInArray(/^serviceType moving$/, lines)) flags.push('serviceTypeMoving');
		if (searchRegexInArray(/^submitted card serviceType$/, lines)) flags.push('submittedServiceType');
		if (searchRegexInArray(/^submitted card currentPlaceType$/, lines)) flags.push('submittedCurrentPlaceType');
		if (searchRegexInArray(/^submitted card currentPlaceFloor$/, lines)) flags.push('submittedCurrentPlaceFloor');
		if (searchRegexInArray(/^submitted card currentPlaceSize$/, lines)) flags.push('submittedCurrentPlaceSize');
		if (searchRegexInArray(/^submitted card currentPlaceElevator$/, lines)) flags.push('submittedCurrentPlaceElevator');
		if (searchRegexInArray(/^submitted card currentPlaceAccessibility$/, lines)) flags.push('submittedCurrentPlaceAccessibility');
		if (searchRegexInArray(/^submitted card cleaningOptions$/, lines)) flags.push('submittedCleaningOptions');
		if (searchRegexInArray(/^submitted card cleaningBath$/, lines)) flags.push('submittedCleaningBath');
		if (searchRegexInArray(/^submitted card cleaningWindows$/, lines)) flags.push('submittedCleaningWindows');
		if (searchRegexInArray(/^submitted card cleaningBlinds$/, lines)) flags.push('submittedCleaningBlinds');
		if (searchRegexInArray(/^submitted card cleaningAdditional$/, lines)) flags.push('submittedCleaningAdditional');
		if (searchRegexInArray(/^submitted card numPeople$/, lines)) flags.push('submittedNumPeople');
		if (searchRegexInArray(/^submitted card inventory$/, lines)) flags.push('submittedInventory');
		if (searchRegexInArray(/^submitted card boxes$/, lines)) flags.push('submittedBoxes');
		if (searchRegexInArray(/^submitted card newPlaceType$/, lines)) flags.push('submittedNewPlaceType');
		if (searchRegexInArray(/^submitted card newPlaceFloor$/, lines)) flags.push('submittedNewPlaceFloor');
		if (searchRegexInArray(/^submitted card newPlaceElevator$/, lines)) flags.push('submittedNewPlaceElevator');
		if (searchRegexInArray(/^submitted card newPlaceAccessibility$/, lines)) flags.push('submittedNewPlaceAccessibility');
		if (searchRegexInArray(/^submitted card additionalServices$/, lines)) flags.push('submittedAdditionalServices');
		if (searchRegexInArray(/^submitted card dates$/, lines)) flags.push('submittedDates');
		if (searchRegexInArray(/^submitted card address$/, lines)) flags.push('submittedAddress');
		if (searchRegexInArray(/^submitted card contact$/, lines)) flags.push('submittedContact');
		if (searchRegexInArray(/^started card serviceType$/, lines)) flags.push('startedServiceType');
		if (searchRegexInArray(/^started card currentPlaceType$/, lines)) flags.push('startedCurrentPlaceType');
		if (searchRegexInArray(/^started card currentPlaceFloor$/, lines)) flags.push('startedCurrentPlaceFloor');
		if (searchRegexInArray(/^started card currentPlaceSize$/, lines)) flags.push('startedCurrentPlaceSize');
		if (searchRegexInArray(/^started card currentPlaceElevator$/, lines)) flags.push('startedCurrentPlaceElevator');
		if (searchRegexInArray(/^started card currentPlaceAccessibility$/, lines)) flags.push('startedCurrentPlaceAccessibility');
		if (searchRegexInArray(/^started card cleaningOptions$/, lines)) flags.push('startedCleaningOptions');
		if (searchRegexInArray(/^started card cleaningBath$/, lines)) flags.push('startedCleaningBath');
		if (searchRegexInArray(/^started card cleaningWindows$/, lines)) flags.push('startedCleaningWindows');
		if (searchRegexInArray(/^started card cleaningBlinds$/, lines)) flags.push('startedCleaningBlinds');
		if (searchRegexInArray(/^started card cleaningAdditional$/, lines)) flags.push('startedCleaningAdditional');
		if (searchRegexInArray(/^started card numPeople$/, lines)) flags.push('startedNumPeople');
		if (searchRegexInArray(/^started card inventory$/, lines)) flags.push('startedInventory');
		if (searchRegexInArray(/^started card boxes$/, lines)) flags.push('startedBoxes');
		if (searchRegexInArray(/^started card newPlaceType$/, lines)) flags.push('startedNewPlaceType');
		if (searchRegexInArray(/^started card newPlaceFloor$/, lines)) flags.push('startedNewPlaceFloor');
		if (searchRegexInArray(/^started card newPlaceElevator$/, lines)) flags.push('startedNewPlaceElevator');
		if (searchRegexInArray(/^started card newPlaceAccessibility$/, lines)) flags.push('startedNewPlaceAccessibility');
		if (searchRegexInArray(/^started card additionalServices$/, lines)) flags.push('startedAdditionalServices');
		if (searchRegexInArray(/^started card dates$/, lines)) flags.push('startedDates');
		if (searchRegexInArray(/^started card address$/, lines)) flags.push('startedAddress');
		if (searchRegexInArray(/^started card contact$/, lines)) flags.push('startedContact');

		if (searchRegexInArray(/^date: 2018-04-2[6789] .*/, lines)) flags.push('today');

		if (searchRegexInArray(/^submitted card currentPlaceType$/, lines)) flags.push('lead');
		if (searchRegexInArray(/^submitted card currentPlaceFloor$/, lines) || searchRegexInArray(/^submitted card currentPlaceSize$/, lines)) flags.push('leadSecond');

		if (searchRegexInArray(/^completed$/, lines)) flags.push('completed');

		for (var i = 0; i < flags.length; i++) {
			stats[flags[i]] = stats[flags[i]]+1;
			clientsPerFlag[flags[i]].push(name);
		}

		allClients.push(name);

		count++;
		$('#stats').text(count + ' / ' + total);
		if (count == total) {
			showTable();
			updateFilter();
		}

	});
}

function showTable() {

	var precondition;

	precondition = ['ipOther', 'nonFake'];

	addTableTitle('conversion - all');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerAny'];

	addTableTitle('conversion - homegate + newhome + google adwords');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerHomegate'];

	addTableTitle('conversion - homegate');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerNewhome'];

	addTableTitle('conversion - newhome');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerGoogle'];

	addTableTitle('conversion - google adwords');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerOther'];

	addTableTitle('conversion - other referrers');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerAny', 'serviceTypeCombined'];

	addTableTitle('conversion - combined');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerAny', 'serviceTypeMoving'];

	addTableTitle('conversion - moving');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

	precondition = ['ipOther', 'nonFake', 'referrerAny', 'serviceTypeCleaning'];

	addTableTitle('conversion - cleaning');
	addTableItem('inquiry', precondition.concat(['completed']));
	addTableItem('leads', precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion', precondition.concat(['completed']), precondition.concat(['submittedCurrentPlaceType']));
	addTableItemRatio('conversion (step 2)', precondition.concat(['completed']), precondition.concat(['leadSecond']));

/*
	precondition = ['ipOther', 'nonFake', 'today'];

	addTableTitle('completion - all');
	
	addTableItem('# datapoints', precondition);

	addTableItemRatio('completion serviceType', precondition.concat(['submittedServiceType']), precondition.concat(['startedServiceType']));
	addTableItemRatio('completion currentPlaceType', precondition.concat(['submittedCurrentPlaceType']), precondition.concat(['startedCurrentPlaceType']));
	addTableItemRatio('completion currentPlaceFloor', precondition.concat(['submittedCurrentPlaceFloor']), precondition.concat(['startedCurrentPlaceFloor']));
	addTableItemRatio('completion currentPlaceSize', precondition.concat(['submittedCurrentPlaceSize']), precondition.concat(['startedCurrentPlaceSize']));
	addTableItemRatio('completion currentPlaceElevator', precondition.concat(['submittedCurrentPlaceElevator']), precondition.concat(['startedCurrentPlaceElevator']));
	addTableItemRatio('completion currentPlaceAccessibility', precondition.concat(['submittedCurrentPlaceAccessibility']), precondition.concat(['startedCurrentPlaceAccessibility']));
	addTableItemRatio('completion cleaningOptions', precondition.concat(['submittedCleaningOptions']), precondition.concat(['startedCleaningOptions']));
	addTableItemRatio('completion cleaningBath', precondition.concat(['submittedCleaningBath']), precondition.concat(['startedCleaningBath']));
	addTableItemRatio('completion cleaningWindows', precondition.concat(['submittedCleaningWindows']), precondition.concat(['startedCleaningWindows']));
	addTableItemRatio('completion cleaningBlinds', precondition.concat(['submittedCleaningBlinds']), precondition.concat(['startedCleaningBlinds']));
	addTableItemRatio('completion cleaningAdditional', precondition.concat(['submittedCleaningAdditional']), precondition.concat(['startedCleaningAdditional']));
	addTableItemRatio('completion numPeople', precondition.concat(['submittedNumPeople']), precondition.concat(['startedNumPeople']));
	addTableItemRatio('completion boxes', precondition.concat(['submittedBoxes']), precondition.concat(['startedBoxes']));
	addTableItemRatio('completion newPlaceType', precondition.concat(['submittedNewPlaceType']), precondition.concat(['startedNewPlaceType']));
	addTableItemRatio('completion newPlaceFloor', precondition.concat(['submittedNewPlaceFloor']), precondition.concat(['startedNewPlaceFloor']));
	addTableItemRatio('completion newPlaceElevator', precondition.concat(['submittedNewPlaceElevator']), precondition.concat(['startedNewPlaceElevator']));
	addTableItemRatio('completion newPlaceAccessibility', precondition.concat(['submittedNewPlaceAccessibility']), precondition.concat(['startedNewPlaceAccessibility']));
	addTableItemRatio('completion additionalServices', precondition.concat(['submittedAdditionalServices']), precondition.concat(['startedAdditionalServices']));
	addTableItemRatio('completion dates', precondition.concat(['submittedDates']), precondition.concat(['startedDates']));
	addTableItemRatio('completion address', precondition.concat(['submittedAddress']), precondition.concat(['startedAddress']));
	addTableItemRatio('completion contact', precondition.concat(['submittedContact']), precondition.concat(['startedContact']));
*/

	precondition = ['ipOther', 'nonFake', 'serviceTypeCombined', 'today'];

	addTableTitle('completion - combined');
	
	addTableItem('# datapoints', precondition);

	addTableItemRatio('completion currentPlaceType', precondition.concat(['submittedCurrentPlaceType']), precondition.concat(['startedCurrentPlaceType']));
	addTableItemRatio('completion currentPlaceFloor', precondition.concat(['submittedCurrentPlaceFloor']), precondition.concat(['startedCurrentPlaceFloor']));
	addTableItemRatio('completion currentPlaceSize', precondition.concat(['submittedCurrentPlaceSize']), precondition.concat(['startedCurrentPlaceSize']));
	addTableItemRatio('completion currentPlaceElevator', precondition.concat(['submittedCurrentPlaceElevator']), precondition.concat(['startedCurrentPlaceElevator']));
	addTableItemRatio('completion currentPlaceAccessibility', precondition.concat(['submittedCurrentPlaceAccessibility']), precondition.concat(['startedCurrentPlaceAccessibility']));
	addTableItemRatio('completion cleaningOptions', precondition.concat(['submittedCleaningOptions']), precondition.concat(['startedCleaningOptions']));
	addTableItemRatio('completion cleaningBath', precondition.concat(['submittedCleaningBath']), precondition.concat(['startedCleaningBath']));
	addTableItemRatio('completion cleaningWindows', precondition.concat(['submittedCleaningWindows']), precondition.concat(['startedCleaningWindows']));
	addTableItemRatio('completion cleaningBlinds', precondition.concat(['submittedCleaningBlinds']), precondition.concat(['startedCleaningBlinds']));
	addTableItemRatio('completion cleaningAdditional', precondition.concat(['submittedCleaningAdditional']), precondition.concat(['startedCleaningAdditional']));
	addTableItemRatio('completion numPeople', precondition.concat(['submittedNumPeople']), precondition.concat(['startedNumPeople']));
	addTableItemRatio('completion inventory', precondition.concat(['submittedInventory']), precondition.concat(['startedInventory']));
	addTableItemRatio('completion boxes', precondition.concat(['submittedBoxes']), precondition.concat(['startedBoxes']));
	addTableItemRatio('completion newPlaceType', precondition.concat(['submittedNewPlaceType']), precondition.concat(['startedNewPlaceType']));
	addTableItemRatio('completion newPlaceFloor', precondition.concat(['submittedNewPlaceFloor']), precondition.concat(['startedNewPlaceFloor']));
	addTableItemRatio('completion newPlaceElevator', precondition.concat(['submittedNewPlaceElevator']), precondition.concat(['startedNewPlaceElevator']));
	addTableItemRatio('completion newPlaceAccessibility', precondition.concat(['submittedNewPlaceAccessibility']), precondition.concat(['startedNewPlaceAccessibility']));
	addTableItemRatio('completion additionalServices', precondition.concat(['submittedAdditionalServices']), precondition.concat(['startedAdditionalServices']));
	addTableItemRatio('completion dates', precondition.concat(['submittedDates']), precondition.concat(['startedDates']));
	addTableItemRatio('completion address', precondition.concat(['submittedAddress']), precondition.concat(['startedAddress']));
	addTableItemRatio('completion contact', precondition.concat(['submittedContact']), precondition.concat(['startedContact']));

	precondition = ['ipOther', 'nonFake', 'serviceTypeMoving', 'today'];

	addTableTitle('completion - moving');
	
	addTableItem('# datapoints', precondition);

	addTableItemRatio('completion currentPlaceType', precondition.concat(['submittedCurrentPlaceType']), precondition.concat(['startedCurrentPlaceType']));
	addTableItemRatio('completion currentPlaceFloor', precondition.concat(['submittedCurrentPlaceFloor']), precondition.concat(['startedCurrentPlaceFloor']));
	addTableItemRatio('completion currentPlaceSize', precondition.concat(['submittedCurrentPlaceSize']), precondition.concat(['startedCurrentPlaceSize']));
	addTableItemRatio('completion currentPlaceElevator', precondition.concat(['submittedCurrentPlaceElevator']), precondition.concat(['startedCurrentPlaceElevator']));
	addTableItemRatio('completion currentPlaceAccessibility', precondition.concat(['submittedCurrentPlaceAccessibility']), precondition.concat(['startedCurrentPlaceAccessibility']));
	addTableItemRatio('completion numPeople', precondition.concat(['submittedNumPeople']), precondition.concat(['startedNumPeople']));
	addTableItemRatio('completion inventory', precondition.concat(['submittedInventory']), precondition.concat(['startedInventory']));
	addTableItemRatio('completion boxes', precondition.concat(['submittedBoxes']), precondition.concat(['startedBoxes']));
	addTableItemRatio('completion newPlaceType', precondition.concat(['submittedNewPlaceType']), precondition.concat(['startedNewPlaceType']));
	addTableItemRatio('completion newPlaceFloor', precondition.concat(['submittedNewPlaceFloor']), precondition.concat(['startedNewPlaceFloor']));
	addTableItemRatio('completion newPlaceElevator', precondition.concat(['submittedNewPlaceElevator']), precondition.concat(['startedNewPlaceElevator']));
	addTableItemRatio('completion newPlaceAccessibility', precondition.concat(['submittedNewPlaceAccessibility']), precondition.concat(['startedNewPlaceAccessibility']));
	addTableItemRatio('completion additionalServices', precondition.concat(['submittedAdditionalServices']), precondition.concat(['startedAdditionalServices']));
	addTableItemRatio('completion dates', precondition.concat(['submittedDates']), precondition.concat(['startedDates']));
	addTableItemRatio('completion address', precondition.concat(['submittedAddress']), precondition.concat(['startedAddress']));
	addTableItemRatio('completion contact', precondition.concat(['submittedContact']), precondition.concat(['startedContact']));

	precondition = ['ipOther', 'nonFake', 'serviceTypeCleaning', 'today'];

	addTableTitle('completion - cleaning');
	
	addTableItem('# datapoints', precondition);

	addTableItemRatio('completion currentPlaceType', precondition.concat(['submittedCurrentPlaceType']), precondition.concat(['startedCurrentPlaceType']));
	addTableItemRatio('completion currentPlaceSize', precondition.concat(['submittedCurrentPlaceSize']), precondition.concat(['startedCurrentPlaceSize']));
	addTableItemRatio('completion cleaningOptions', precondition.concat(['submittedCleaningOptions']), precondition.concat(['startedCleaningOptions']));
	addTableItemRatio('completion cleaningBath', precondition.concat(['submittedCleaningBath']), precondition.concat(['startedCleaningBath']));
	addTableItemRatio('completion cleaningWindows', precondition.concat(['submittedCleaningWindows']), precondition.concat(['startedCleaningWindows']));
	addTableItemRatio('completion cleaningBlinds', precondition.concat(['submittedCleaningBlinds']), precondition.concat(['startedCleaningBlinds']));
	addTableItemRatio('completion cleaningAdditional', precondition.concat(['submittedCleaningAdditional']), precondition.concat(['startedCleaningAdditional']));
	addTableItemRatio('completion dates', precondition.concat(['submittedDates']), precondition.concat(['startedDates']));
	addTableItemRatio('completion address', precondition.concat(['submittedAddress']), precondition.concat(['startedAddress']));
	addTableItemRatio('completion contact', precondition.concat(['submittedContact']), precondition.concat(['startedContact']));

}

function updateFilter() {
	$('#clients').html('');

	var myClients = allClients;

	$('.filter.active').each(function (i, el) {
		myClients = myClients.filter(function(n) {
		    return clientsPerFlag[$(el).text()].indexOf(n) !== -1;
		});
	});


	$('#clients').append(myClients.length + ' results.<br/><br/>');

	for (var i = 0; i < myClients.length; i++) {
		$('#clients').append('<a href="../data/progress/' + myClients[i] + '.txt">' + myClients[i] + '</a><br/>');
	}

}


function numByCondition(conditions) {

	var myClients = allClients;

	for (var i = 0; i < conditions.length; i++) {
		myClients = myClients.filter(function(n) {
			if (clientsPerFlag[conditions[i]] == undefined) console.log('whoops: ' + conditions[i]);
		    return clientsPerFlag[conditions[i]].indexOf(n) !== -1;
		});
	}

	return myClients.length;

}

function addTableTitle(title) {
	$('#tbl').append('<tr><td colspan="2"><strong>' + title + '</strong></td></tr>');
}

function addTableItem(name, conditions) {
	$('#tbl').append('<tr><td>' + name + '</td><td>' + numByCondition(conditions) + '</td></tr>');
}

function addTableItemRatio(name, conditions1, conditions2) {
	if (numByCondition(conditions2) == 0) {
		$('#tbl').append('<tr><td>' + name + '</td><td>-</td></tr>');
	}
	else {
		$('#tbl').append('<tr><td>' + name + '</td><td>' + Math.round((numByCondition(conditions1) / numByCondition(conditions2)) * 100) + '%</td></tr>');
	}
}

function searchRegexInArray (str, strArray) {
    for (var j = 0; j < strArray.length; j++) {
        if (strArray[j].match(str)) return true;
    }
    return false;
}


function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }