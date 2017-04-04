$(document).ready(function()
{

  var TT = {

    posts : {},

    init: function(){

      $.getJSON('tt_data.json', function(data) {

        TT.posts = data;
        TT.renderTemplate();

      });

    },

    renderTemplate: function( ){

      console.log(TT.posts);

      _.templateSettings.variable = "posts";

      var template = _.template( $( "#template-post" ).html() );

      $('body').html( template( TT.posts ) );

    }

  };


  TT.init();

});
