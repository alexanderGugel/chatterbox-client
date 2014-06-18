// var app = {};

// app.server = 'https://api.parse.com/1/classes/chatterbox';

// app.init = function () {
//   $('#chats').on('click', '.username', function () {
//     app.addFriend($(this).text());
//   });
//   $('#send').submit(app.handleSubmit);
//   $('#roomSelect').change(function(room){
//     app.currentRoom = $(this).val();
//     app.clearMessages();
//   });
//   app.addRoom('l33t');
//   app.addRoom('w00t');
//   app.addRoom('LOLCATZ');
//   app.addRoom('lobby');
//   app.addRoom('4chan');

//   $.ajax({
//     // always use this url
//     url: app.server + '?order=-createdAt',
//     type: 'GET',
//     success: function (data) {
//       _.each(data.results.reverse(), function(message){
//         app.addRoom(message.roomname)
//       });
//     },
//     error: function (data) {
//       // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//       console.error('chatterbox: Failed to send message');
//     }
//   });
//   setInterval(app.fetch.bind(this), 1000);
// };

// app.send = function (message) {
//   $.ajax({
//     url: app.server,
//     type: 'POST',
//     data: JSON.stringify(message),
//     contentType: 'application/json',
//     success: function (data) {
//       console.log('chatterbox: Message sent');
//       app.fetch();
//     },
//     error: function (data) {
//       // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//       console.error('chatterbox: Failed to send message');
//     }
//   });
// };

// app.messages = {};

// app.fetch = function () {
//   $.ajax({
//     // always use this url
//     url: app.server + '?' + 'order=-createdAt&where=' + JSON.stringify({roomname: app.currentRoom}),
//     type: 'GET',
//     success: function (data) {
//       _.each(data.results.reverse(), function(message){
//         if(!app.messages[message.objectId]){
//           app.messages[message.objectId] = true;
//           app.addMessage(message);
//         }
//       });
//     },
//     error: function (data) {
//       // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//       console.error('chatterbox: Failed to send message');
//     }
//   });
// };

// app.clearMessages = function () {
//   $('#chats').empty();
// };

// app.addMessage = function (message) {
//   var $li = $('<li><span class="username"></span> <span data-username="' + encodeURI(message.username) + '" class="text"></span><span class="time" data-livestamp="' + message.createdAt + '"></span></li>');
//   $li.find('.username').text(message.username);
//   if (app.friends[message.username] !== undefined) {
//     $li.find('.text').addClass('friend');
//   }
//   $li.find('.text').text(message.text);
//   if($('#chats').children().length > 20){
//     $('#chats').children().first().remove();
//   }
//   $('#chats').append($li);
// };

// app.rooms = {};

// app.currentRoom = 'lobby';

// app.addRoom = function (room) {

//   app.currentRoom = room;
//   if (!app.rooms[room]) {
//     console.log(room);
//     app.rooms[room] = true;
//     $('#roomSelect option').removeAttr('selected');
//     $('#roomSelect').append('<option selected="selected" value="' + room + '">' + room + '</option>');
//   }
// };

// app.friends = {};

// app.addFriend = function (username) {
//   this.friends[username] = username;
//   $('#chats').find('span[data-username="' + encodeURI(username) + '"]').toggleClass('friend');
// };

// app.handleSubmit = function (e) {
//   e.preventDefault();
//   app.send({
//     username: window.location.search.split('username=')[1],
//     text: $('#message').val(),
//     roomname: app.currentRoom
//   });
//   $('#message').val('').focus();
// };

// $(function () {
//   app.init();
// });


var Message = Backbone.Model.extend({
  idAttribute: 'objectId'
});

var MessageView = Backbone.View.extend({
  tagName: 'li',
  template: _.template('<span class="username"><%= _.escape(username) %></span> ' +
    '<%= _.escape(text) %><span class="time" data-livestamp="<%= createdAt %>"></span>'),
  render: function () {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

var MessageForm = Backbone.View.extend({
  events: {
    'submit': 'submit'
  },
  submit: function (e) {
    e.preventDefault();
    this.collection.create({
      username: window.location.search.split('username=')[1],
      roomname: this.collection.currentRoomname,
      text: this.$el.find('input').val()
    }, {
      wait: true
    });
    this.$el.find('input').val('').focus();
  }
});

var SelectRoom = Backbone.View.extend({
  events: {
    'change': 'changeRoom'
  },
  changeRoom: function () {
    this.collection.reset();
    this.collection.currentRoomname = this.$el.val();
  },
  addRoom: function (roomname) {
    this.$el.find('option').removeAttr('selected');
    var $option = $('<option>');
    $option.attr('selected', 'selected');
    $option.attr('value', roomname);
    $option.text(roomname);
    this.$el.append($option);
  },
  initialize: function () {
    this.addRoom('default');
    this.addRoom('lobby');
    this.addRoom('4chan');
  }
});

var Room = Backbone.Collection.extend({
  model: Message,
  currentRoomname: 'lobby',
  url: 'https://api.parse.com/1/classes/chatterbox',
  parse: function (resp) {
    return resp.results.reverse();
  },
  initialize: function () {
    setInterval(function () {
      this.fetch({
        data: {
          order: '-createdAt',
          where: {
            roomname: this.currentRoomname
          }
        }
      });
    }.bind(this), 1000);
  }
});

var RoomView = Backbone.View.extend({
  initialize: function () {
    this.collection.on('add', function (model) {
      var view = new MessageView({
        model: model
      });
      this.$el.prepend(view.render().el);
    }.bind(this));
    this.collection.on('reset', function () {
      this.$el.empty();
    }.bind(this));
  }
});

$(function () {
  var room = new Room();
  var roomView = new RoomView({
    collection: room,
    el: $('ul')
  });
  var messageForm = new MessageForm({
    collection: room,
    el: $('form')
  });
  var selectRoom = new SelectRoom({
    collection: room,
    el: $('select')
  })
});
