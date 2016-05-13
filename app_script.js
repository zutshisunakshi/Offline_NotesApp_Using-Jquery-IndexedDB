(function($){
console.log('Inside the note list script..!');


   var db;
/* This snippet does the Effect for the menu bar, to create a new note*/
	$('#addnote').hide();
	$('#menubar').toggle(function(){ 
    $('#addnote').slideDown();
	}, function(){ 
	$('#addnote').slideUp();
	});
/* This snippet calculates the message character count */
	var maxLength = 250;
	var length;
	var actualLen;
    $('textarea').keyup(function() {
    actualLen = $(this).val().length;
    length = maxLength-actualLen;
    return $('#textarea_feedback').text(length);

});

    var openRequest = indexedDB.open("MyNoteDatabase",2);
	openRequest.onupgradeneeded = function(e) {
	console.log("Upgrading indexedDB...!");
	var thisDB = e.target.result;
	if(!thisDB.objectStoreNames.contains("mynotecollection")) {
	thisDB.createObjectStore("mynotecollection", { autoIncrement : true });
    }
}
	openRequest.onsuccess = function(e) {
	console.log("Open Success!");
	db = e.target.result;
	document.getElementById('btn_add').addEventListener('click', function(){

			var name = document.getElementById('t1').value;
			var subject = document.getElementById('t2').value;
			var date = document.getElementById('theDate').value;
			var time = document.getElementById('thetime').value;
			var message = document.getElementById('txt_note').value;
			var count_msg =actualLen;

/* validate inputs from user*/
           if (!(name.trim() && subject.trim() && message.trim()) ) 
			{
        		alert("Name, Subject and Message are mandatory to create your note!");
        	}

        	else if (!name.match('^[a-zA-Z]{3,40}$'))
        	{
            alert("Name must 3-16 characters long and contain only letters");
        	}

        	 else {
        		addWord1(name,date,time,subject,message,count_msg);
        	}
        });
        renderList();
	}
	openRequest.onerror = function(e) {
		console.log("Open Error!");
		console.dir(e);
	}
/* This function adds the object in the DB*/
	function addWord1(name,date,time,subject,message,count_msg) {
		var transaction = db.transaction(["mynotecollection"],"readwrite");
		var store = transaction.objectStore("mynotecollection");
		var request = store.add({name: name,date:date,time:time,subject:subject,message:message,count_msg:count_msg}); 
		request.onerror = function(e) {
			console.log("Error",e.target.error.name +e.target.error.subject
				+e.target.error.message);
	        //some type of error handler
	    }
	    request.onsuccess = function(e) {
	    	console.log("added " +name);
	    	renderList();
	    	document.getElementById('t1').value = '';
	    	document.getElementById('t2').value = '';
	    	document.getElementById('txt_note').value = '';
            $('#addnote').hide();
	
	        $('#menubar').toggle(function(){ 
		    $('#addnote').slideDown();
	}, function(){ 
		$('#addnote').slideUp();
		    document.getElementById('t1').value = '';
	    	document.getElementById('t2').value = '';
	    	document.getElementById('txt_note').value = '';
	});
	    }
	}
/* This function helps display object data from the DB*/
	function renderList(){
		$('#list-wrapper').empty();
		$('#list-wrapper').html('<table id ="tbl1" class="stickyHeader" cellspacing="2" cellpadding="2"><tr><th>S.No.</th><th>Name</th><th>Time</th><th>Date</th><th>Count</th></tr></table>');
         var notediv = $('#list-wrapper');
         var notes = [];
		//Count Objects
		var transaction = db.transaction(['mynotecollection'], 'readonly');
		var store = transaction.objectStore('mynotecollection');
		var countRequest = store.count();
		countRequest.onsuccess = function(){ console.log(countRequest.result) };

		// Get all Objects
		var objectStore = db.transaction("mynotecollection").objectStore("mynotecollection");
		objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
               		var $link = $('<a href="#" data-key="' + cursor.key + '">' +cursor.value.name +'</a>');
				$link.click(function(){
					loadTextByKey(parseInt($(this).attr('data-key')));
				});

				var $row = $('<tr>');
				var $keyCell = $('<td>' + cursor.key + '</td>');
				var $textCell = $('<td></td>').append($link);
				var $text1Cell = $('<td>' + cursor.value.time + '</td>');
				var $text2Cell = $('<td>' + cursor.value.date + '</td>');
				var $count = $('<span class="w3-badge w3-green">' + cursor.value.count_msg+'</span>');
				$row.append($keyCell);
				$row.append($textCell);
              
				$row.append($text1Cell);
				
				$row.append($text2Cell);
				$row.append($count);

				$('#list-wrapper table').append($row);

				cursor.continue();
			}
			else {
			    //no more entries
			}
		};
	}
/* This function helps display detailed view of the note record from the DB*/
	function loadTextByKey(key){
		var transaction = db.transaction(['mynotecollection'], 'readonly');
		var store = transaction.objectStore('mynotecollection');
		var request = store.get(key);
		request.onerror = function(event) {
		  // Handle errors!
		};
		request.onsuccess = function(event) {
		  // Do something with the request.result
		$('#detail').html('<table class="stickyHeader" id ="tbl1" cellspacing="2" cellpadding="2"><tr><th>S.No.</th><th>Name</th><th>Time</th><th>Date</th><th>Subject</th><th>Message</th><th>Count</th></tr></table>');
		
		var $row_1 = $('<tr>');
		var $keyCell1 = $('<td>' + key + '</td>');
		var $text1Cell = $('<td>' + request.result.name + '</td>');
	    var $text2Cell = $('<td>' + request.result.time + '</td>');
	    var $text3Cell = $('<td>' + request.result.date + '</td>');
	    var $text4Cell = $('<td>' + request.result.subject + '</td>');
	    var $text5Cell = $('<td>' + request.result.message + '</td>');
	    var $text6Cell = $('<span class="w3-badge w3-green">' +  request.result.count_msg +'</span>');
        $row_1.append($keyCell1);
	    $row_1.append($text1Cell);
	    $row_1.append($text2Cell);
	    $row_1.append($text3Cell);
	    $row_1.append($text4Cell);
	    $row_1.append($text5Cell);
	    $row_1.append($text6Cell);
	    $('#detail table').append($row_1);

		var $delBtn = $('<button><i class="material-icons">delete</i></button>');
		$delBtn.click(function(){
		console.log('Delete ' + key);
		deleteWord(key);
		  });
		$row_1.append($delBtn);
		};
	}
/* This function Deletes the note record from the Db store 'mynotecollection' */
	function deleteWord(key) {
		var transaction = db.transaction(['mynotecollection'], 'readwrite');
		var store = transaction.objectStore('mynotecollection');
		var request = store.delete(key);
		request.onsuccess = function(evt){
			renderList();
			$('#detail').empty();

		};
	}

/* This snippet Provides system date on note creation */
         var date = new Date();
         var timee = new Date().toString("hh:mm tt");
         var day = date.getDate();
         var month = date.getMonth() + 1;
         var year = date.getFullYear();
         var time =  jQuery.now();

         if (month < 10) month = "0" + month;
         if (day < 10) day = "0" + day;

         var today = year + "-" + month + "-" + day;
         document.getElementById('theDate').value = today;
         document.getElementById('thetime').value = timee;

/* This snippet protects from javascript injection */
    function escapeHtmlEntities (str) {
         if (typeof jQuery !== 'undefined') {
    return jQuery('<div/>').text(str).html();
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}


})(jQuery);