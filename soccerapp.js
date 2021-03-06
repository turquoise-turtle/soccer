if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/soccer/service-worker.js')
		.then(function (reg){
			console.log('sw registered:', reg);
		}, /*catch*/ function(error) {
			console.log('Service worker registration failed:', error);
		});
	});
}
var installPromptEvent;
window.addEventListener('beforeinstallprompt', function(event){
	installPromptEvent = event;
	vm.a2hsshow = true;
	setTimeout(function(){
		document.querySelector('#a2hsbtn').addEventListener('click', a2hsclick);
	}, 500);
	
});

function a2hsclick(e) {
	vm.a2hsshow = false;
	installPromptEvent.prompt();
	installPromptEvent.userChoice.then(function(choice) {
		if (choice.outcome === 'accepted') {
			console.log('User accepted the A2HS prompt');
		} else {
			console.log('User dismissed the A2HS prompt');
		}
		// Clear the saved prompt since it can't be used again
		installPromptEvent = null;
	}).catch(function(error){
		console.log('a2hs error');
		console.log(error);
	});
}

//console.log('new', location.search);
var vm = new Vue({
  el: '#app',
  data: {
    //round: '',
    resulttype: 'tables',
    type: 'sstables',
    age: '21',
    grade: 'E',
    club: '',
    e: 0,
    loading: true,
    offline: false,
    a2hsshow: false
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
      //this refers to the app5 Vue instance
    },
    getQuery: function(variable){
      var query = location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
      }
      return('');
    },
    update: function () {
      var that = this;
      switch (this.resulttype) {
        case 'result':
          var type = 'ssresult';
          that.type = type;
          break;
        case 'tables':
          var type = 'sstables';
          that.type = type;
          break;
        default:
          var type = 'ssfixtures';
          that.type = type;
      }
      
      var thisurl = '';
      thisurl = thisurl + '?type=' + that.type + '&Age=' + that.age + '&Grade=' + that.grade + '&Club=' + that.club;
      //console.log('query',thisurl);
      window.history.pushState(this.resulttype, this.resulttype, thisurl);
      //console.log('search',location.search);
      this.loadtable();
    },
    loadtable: function () {
      //console.log('loadtable', location.search);
      if (location.search == '') {
        //console.log('update');
        this.update();
      } else {
        //console.log('loadit');
        this.loadit();
      }
      
    },
    loadit: function () {
      //console.log(location.search);
      var that = this;
      var xhr = new XMLHttpRequest();
      var e = this.e;
      that.loading = true;
      var ltype = this.getQuery('type');
      that.resulttype = ltype.substring(2);
      that.type = ltype;
      var lage = this.getQuery('Age');
      that.age = lage;
      var lgrade = this.getQuery('Grade');
      that.grade = lgrade;
      var lclub = this.getQuery('Club');
      that.club = decodeURIComponent(lclub);
      var thisurl = 'http://www.shirefootball.com/' + ltype + '.asp?Age=' + lage + '&Grade=' + lgrade + '&Club=' + lclub;

      switch (e) {
        case 1:
          thisurl = 'https://cors.now.sh/' + thisurl;
          break;
        case 2:
          thisurl = 'https://cors.io/?' + thisurl;
          break;
        case 3:
          thisurl = 'https://cors-anywhere.herokuapp.com/' + thisurl;
          break;
        case 4:
          thisurl = 'https://www.corsify.me/' + thisurl;
          break;
        case 5:
          window.location.reload(true);
          break;
        default:
          thisurl = 'https://soccerapp-cors.herokuapp.com/' + thisurl;
      }

      //console.log('cors', thisurl);
      //xhr.open('GET', 'https://cors.now.sh/' + thisurl);
      xhr.open('GET', thisurl);


      xhr.responseType = 'document';

      xhr.onload = function(e) {
        if (this.status == 200) {
          //console.log(this.response);

          var mytable = document.querySelector('#table');
          while (mytable.childNodes[0]) {
            //document.querySelector('#table').removeChild(document.querySelector('#table').childNodes[0]);
            mytable.removeChild(mytable.childNodes[0]);
          }

          var doc = this.responseXML.documentElement;
          //console.log(doc);

          var childnodes = doc.childNodes[2].childNodes[1].childNodes[1].childNodes[8].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0];

          //console.log(childnodes);

          //6 for result&table, 7 for fixture, 5 for the container
          switch (ltype) {
            case 'ssfixtures':
              var table = doc.getElementsByTagName('table')[6];
              table.style.width = '100%';
              var table2 = doc.getElementsByTagName('table')[7];
              table2.style.width = '100%';
              document.querySelector('#table').appendChild(table);
              document.querySelector('#table').appendChild(table2);
              break;
	     case 'sstables':
		var table = doc.getElementsByTagName('table')[6];
              table.style.width = '100%';
			  //move the team grade to the second cell
			  var headerrow = table.getElementsByTagName('tr')[0];
			  headerrow.getElementsByTagName('td')[1].innerHTML = headerrow.getElementsByTagName('td')[0].innerHTML;
			  headerrow.removeChild(headerrow.getElementsByTagName('td')[0]);
			  //get rid of the blank first cells in the rest of the rows
			  for (var i=1; i<table.rows.length; i++) {
				  var myrow = table.getElementsByTagName('tr')[i];
				  myrow.removeChild(myrow.firstChild);
			  }
              document.querySelector('#table').appendChild(table);
			  break;
            default:
              var table = doc.getElementsByTagName('table')[6];
              table.style.width = '100%';
              document.querySelector('#table').appendChild(table);
          }

        } else {
          console.log(this.status, thisurl, location.href);
          if (e < 6){
            that.e = e + 1;
            that.loadtable();
            console.log(that.e);
          }
        }
        that.loading = false;
      }

      xhr.onerror = function (event) {
        if (e < 6){
          that.e = e + 1;
          that.loadtable();
          console.log(that.e);
        }
      };
      xhr.send();
    },
   
    updateonline: function() {
    	if (!navigator.onLine) {
    		this.offline = true;
    	} else {
    		this.offline = false;
    	}
    }
  },
  mounted: function () {
    var that = this;
    this.loadtable();
    window.addEventListener('online', this.updateonline);
    window.addEventListener('offline', this.updateonline);
    this.updateonline();
  },
  watch: {
    club: function (newClub, oldClub) {
      this.update();
    }
  },
});


/*var text = document.querySelector('#text');

var xhr = new XMLHttpRequest();
//xhr.open('GET', 'http://www.shirefootball.com/ssresult.asp?Age=18&Grade=E');
xhr.open('GET', 'https://cors.now.sh/http://www.shirefootball.com/ssresult.asp?Age=18&Grade=E');
//xhr.open('GET', 'http://www.shirefootball.com/sstables.asp?Age=18&Grade=E');
//xhr.open('GET', 'http://www.shirefootball.com/ssfixtures.asp?Age=18&Grade=E');


xhr.responseType = 'document';

xhr.onload = function(e) {
  if (this.status == 200) {
    console.log(this.response);

    var doc = this.responseXML.documentElement;
    console.log(doc);

    var childnodes = doc.childNodes[2].childNodes[1].childNodes[1].childNodes[8].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0];
    console.log(childnodes);

    //6 for result&table, 7 for fixture, 5 for the container
    var table = doc.getElementsByTagName('table')[6];

    console.log(table);

    text.innerText = '';
    document.querySelector('#table').appendChild(table);

  } else {
    console.log(this.status);
  }
}
xhr.send();
*/
