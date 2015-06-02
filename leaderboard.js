
players = new Mongo.Collection("players");

//console.log("Hello World");
if (Meteor.isServer)  {
    //console.log(players.find().fetch());
    Meteor.publish('thePlayers', function() {
        var currentUid = this.userId;
        return players.find({createdBy: currentUid}, {sort: {score: -1, name: 1}});
    });
}

if (Meteor.isClient ) {
    Meteor.subscribe("thePlayers");
    //console.log("Hello Client");
    Template.leaderboard.helpers( {
        player: function() {
            return players.find({},{sort: {score: -1, name: 1}} );
        },
        count: function() {
            return players.find().count();

        },
        findPlayer: function(which) {
            if (typeof which === 'number') {
                var pl = players.find().fetch()[which];
                //alert(pl);
                if (pl) {
                    return pl.name;
                }
            }
            return "error";
        },
        findSelected: function() {
            var id = Session.get("selectedPlayer");
            player = players.findOne({_id: id});
            if(player) {
                    return player;
            }
        },
        playerlist: function() {
            return (function() {
                var arr=[];
                var playerlist = players.find().fetch();
                var len = playerlist.length;
                for (var i=0; i<len;i++) {
                    arr.push(playerlist[i].name);
                }
                return arr;
            })();
        },
        otherFunction: function() {
            return "Other Text";
        },
        selectedClass: function() {
            var thisPlayer = this._id;
            if (thisPlayer == Session.get('selectedPlayer')) {
                return 'selected';
            }
        }
    });

    Template.leaderboard.events({
        'click .playerz': function() {
            console.log("You clicked on an li element");
            Session.set('selectedPlayer',this._id);
            //console.log(Session.get('selectedPlayer'));
        },
        'click .increment': function() {
            var p = Session.get('selectedPlayer');
            console.log("increment "+p);
            if (p) {
                players.update({_id: p},{$inc: {score: 5}});
            }
        },
        'click .decrement': function() {
            var p = Session.get('selectedPlayer');
            if (p) {
                var player = players.findOne({$and: [{_id: p}, {score: {$gt: 0}}] });
                //alert(id);
                if (player) {
                    players.update({_id: player._id},{$inc: {score: -5}} );
                }
            }
        },
        'click .remove': function() {
            var selectedId = Session.get("selectedPlayer");
            players.remove({_id: selectedId});
        },
        'mouseover .playerz': function()  {
            console.log("You mouseover on an li element");
        },
        'change .textip': function()  {
            console.log("You changed an element");
        },
        'focus .textip': function()  {
            console.log("You focussed on an element");
        },
        'blur .textip':function()  {
            console.log("You blurred an element");
        },
    });

    Template.addPlayerForm.events({
        'submit form': function(event) {
            event.preventDefault();
            //console.log('form submitted event '+event.type);
            var playerName = event.target.playerName.value;
            //console.log(playerName);
            if (playerName) {
                var currentUserId = Meteor.userId();
                var searchedPlayer = players.findOne({name: playerName});
                if (!searchedPlayer) {
                    players.insert({
                        name: playerName, 
                        score:0,
                        createdBy: currentUserId
                    });
                }
            }
            event.target.playerName.value="";
        }

    });
}
