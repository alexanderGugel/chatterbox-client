// YOUR CODE HERE:

var app = {};

app.server = 'https://api.parse.com/1/classes/chatterbox';

app.init = function () {
  $('.username').click(function () {
    app.addFriend($(this).text());
  });
  $('#send').submit(app.handleSubmit);
  $('#roomSelect').change(function(room){
    app.currentRoom = $(this).val();
    app.clearMessages();
  });
  app.addRoom('l33t');
  app.addRoom('w00t');
  app.addRoom('LOLCATZ');
  app.addRoom('lobby');
  app.addRoom('4chan');

  setInterval(app.fetch.bind(this), 1000);
};

app.send = function (message) {
  console.log(message);
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      app.fetch();
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.messages = {};

app.fetch = function () {
  $.ajax({
    // always use this url
    url: app.server + '?order=-createdAt&where={"roomname":"' + app.currentRoom + '"}',
    type: 'GET',
    success: function (data) {
      _.each(data.results.reverse(), function(message){
        console.log(data.results)
        if(!app.messages[message.objectId]){
          app.messages[message.objectId] = true;
          app.addMessage(message);
        }
      });
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.clearMessages = function () {
  $('#chats').empty();
};

app.addMessage = function (message) {
  console.log(message.text);
  var $li = $('<li><span class="username"></span>: <span class="text"></span></li>');
  $li.find('.username').text(message.username);
  $li.find('.text').text(message.text);
  if($('#chats').children().length > 20){
    $('#chats').children().first().remove();
  }
  $('#chats').append($li);
};

app.rooms = {};

app.currentRoom = 'lobby';

app.addRoom = function (room) {
  app.currentRoom = room;
  app.rooms[room] = false;

  $('#roomSelect option').removeAttr('selected');

  $('#roomSelect').append('<option selected="selected" value="' + room + '">' + room + '</option>');
};

app.friends = {};

app.addFriend = function (username) {
  this.friends[username] = username;
};

app.handleSubmit = function (e) {
  e.preventDefault();
  console.log('Submit')
  app.send({
    username: window.location.search.split('username=')[1],
    text: $('#message').val(),
    roomname: app.currentRoom
  });
  $('#message').val('').focus();
};

$(function () {
  app.init();
});


