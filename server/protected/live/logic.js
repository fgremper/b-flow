$(document).ready(function () {
	updateClients(true);
	setInterval(function () { updateClients(false); }, 2000);
});

function updateClients(firstPoll) {
	if (!document.hasFocus()) {
		//$('h1').text("INACTIVE");
		return;
	}
	//$('h1').text("Fabian's B-Flow Megahacktool");
	$.get('../get_progress_files.php?_=' + new Date().getTime())
	.done(function (data) {
		var files = data.split("\r\n");
		files.pop();
		files = files.slice(files.length - 20);
		for (var i = 0; i < files.length; i++) {
			var fileWithoutTxt = files[i].substr(0, files[i].length - 4);
			if (!$('.c-' + fileWithoutTxt).length) {
				var fileDom = $('<div class="client"><div class="clientName"></div><div class="clientContentWrapper"><div class="clientContent"></div></div></div>');
				fileDom.addClass('c-' + fileWithoutTxt);
				fileDom.find('.clientName').text(fileWithoutTxt);
				$('.clients').append(fileDom);
				setTimeout(function () {
					$(document).scrollTop($(document).height());
				}, 10);
			}
			updateIndividualClient(fileWithoutTxt, firstPoll);
		}
	});
}

function updateIndividualClient(name, firstPoll) {
	$.get('../data/progress/' + name + '.txt?_=' + new Date().getTime())
	.done(function (data) {
		if (parseInt($('.c-' + name).data('length')) != data.length) {
			var oldLength = parseInt($('.c-' + name).data('length'));
			if ($('.c-' + name).data('length') == undefined) oldLength = 0;
			var newDom = $('<div></div>');
			if ($('.c-' + name).data('length') != undefined || !firstPoll) newDom.addClass('orange');
			var newContent = escapeHtml(data.substr(oldLength)).split("\r\n").join('<br/>');
			newDom.html(newContent);
			$('.c-' + name).find('.clientContent').append(newDom);
			$('.c-' + name).find('.clientContent').scrollTop($('.c-' + name).find('.clientContent').prop("scrollHeight"));
			$('.c-' + name).data('length', data.length);
		}
	});
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }