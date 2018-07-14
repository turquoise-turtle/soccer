//console.log('new', location.search);
var vm = new Vue({
  el: '#app',
  data: {
    //round: '',
    resulttype: 'result',
    type: 'ssresult',
    age: '18',
    grade: 'E',
    club: '',
    e: 0,
    loading: true
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
          thisurl = 'http://www.whateverorigin.org/get?url=' + encodeURIComponent(thisurl);
          break;
        case 5:
          thisurl = 'http://www.corsify.me/' + thisurl;
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
    }
  },
  mounted: function () {
    this.loadtable();
    document.querySelector('#text').innerHTML = '';
  },
  watch: {
    // whenever question changes, this function will run
    club: function (newClub, oldClub) {
      //this.answer = 'Waiting for you to stop typing...'
      //this.debouncedGetAnswer()
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

function open() {
  console.log('open');
}
