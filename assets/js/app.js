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

      TT.adjustPlacement();

    },

    adjustPlacement: function(){

      function adjust(parent, target){

        outerHeight = parent.outerHeight();
        innerHeight = parent.find(target).outerHeight();

        parent.find(target).css({
          marginTop: (outerHeight/2) - (innerHeight / 2)
        });


      }

      $(window).on('resize', function(){
        adjust( $('.Post-Intro'), 'h1' );
        adjust( $('.Post-Explain'), 'span' );
        
      });

      adjust( $('.Post-Intro'), 'h1' );
      adjust( $('.Post-Explain'), 'span' );



    }

  };


  TT.init();

});
