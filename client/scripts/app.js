// YOUR CODE HERE:

var app = {};

app.server = 'https://api.parse.com/1/classes/chatterbox';

app.init = function () {
  $('.username').click(function () {
    app.addFriend($(this).text());
  });
  $('.submit').click(app.handleSubmit);
  return false;
};

app.send = function (message) {
  $.ajax({
    // always use this url
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.fetch = function () {
  $.ajax({
    // always use this url
    url: this.server,
    type: 'GET',
    success: function (data) {
      console.log('chatterbox: Message sent');
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
  $('#chats').prepend('<li><span class="username" data-username="' + message.username + '">' + message.username + '</span>: ' + message.text + '</li>');
};

app.addRoom = function (room) {
  $('#roomSelect').append('<option value="' + room + '">' + room + '</option>');
};

app.friends = {};

app.addFriend = function (username) {
  this.friends[username] = username;
};

app.handleSubmit = function () {
  app.send({
    username: window.location.search.split('username=')[1],
    text: $('#message').val(),
    roomname: '_I am Bad At Naming Things'
  });
};



