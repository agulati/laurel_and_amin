$(function() {
  // Upload page
  var $fileInput = $("#file-input")
  var $attachedFile = $(".attached-file")
  var $deleteFile = $(".delete-file")

  $fileInput.on("change", function () {
    var attachedFileName = $fileInput.val()

    if( attachedFileName === "" ) {
      $attachedFile.html("None")
      $deleteFile.addClass("hide")
    } else {
      $attachedFile.html(attachedFileName.split("\\").pop())
      $deleteFile.removeClass("hide")
    }
  })

  $deleteFile.on("click", function () {
    $fileInput.val("")
    $attachedFile.html("Nothing selected")
    $deleteFile.addClass("hide")
  })

  // Gallery page
  function loadApp() {

    var flipbook = $('.photo-album');

    if (flipbook.width()==0 || flipbook.height()==0) {
      setTimeout(loadApp, 10);
      return;
    }

    $('#book-zoom').mousewheel(function(event, delta, deltaX, deltaY) {

      var data = $(this).data(),
        step = 30,
        flipbook = $('.photo-album'),
        actualPos = $('#slider').slider('value')*step;

      if (typeof(data.scrollX)==='undefined') {
        data.scrollX = actualPos;
        data.scrollPage = flipbook.turn('page');
      }

      data.scrollX = Math.min($( "#slider" ).slider('option', 'max')*step,
        Math.max(0, data.scrollX + deltaX));

      var actualView = Math.round(data.scrollX/step),
        page = Math.min(flipbook.turn('pages'), Math.max(1, actualView*2 - 2));

      if ($.inArray(data.scrollPage, flipbook.turn('view', page))==-1) {
        data.scrollPage = page;
        flipbook.turn('page', page);
      }

      if (data.scrollTimer)
        clearInterval(data.scrollTimer);

      data.scrollTimer = setTimeout(function(){
        data.scrollX = undefined;
        data.scrollPage = undefined;
        data.scrollTimer = undefined;
      }, 1000);

    });

    $( "#slider" ).slider({
      min: 1,
      max: 100,

      start: function(event, ui) {

        if (!window._thumbPreview) {
          _thumbPreview = $('<div />', {'class': 'thumbnail'}).html('<div></div>');
          setPreview(ui.value);
          _thumbPreview.appendTo($(ui.handle));
        } else
          setPreview(ui.value);

        moveBar(false);

      },

      slide: function(event, ui) {
        setPreview(ui.value);
      },

      stop: function() {
        if (window._thumbPreview)
          _thumbPreview.removeClass('show');

        $('.photo-album').turn('page', Math.max(1, $(this).slider('value')*2 - 2));
      }
    });

    // URIs
    Hash.on('^page\/([0-9]*)$', {
      yep: function(path, parts) {

        var page = parts[1];

        if (page!==undefined) {
          if ($('.photo-album').turn('is'))
            $('.photo-album').turn('page', page);
        }

      },
      nop: function(path) {

        if ($('.photo-album').turn('is'))
          $('.photo-album').turn('page', 1);
      }
    });

    // Arrows
    $(document).keydown(function(e){
      var previous = 37, next = 39;

      switch (e.keyCode) {
        case previous:
          $('.photo-album').turn('previous');

        break;
        case next:
          $('.photo-album').turn('next');
        break;
      }
    });


    // Flipbook
    flipbook.bind(($.isTouch) ? 'touchend' : 'click', zoomHandle);

    flipbook.turn({
      elevation: 50,
      display: "single",
      acceleration: !isChrome(),
      autoCenter: true,
      gradients: true,
      duration: 1000,
      pages: 112,
      when: {
        turning: function(e, page, view) {

          var book = $(this),
            currentPage = book.turn('page'),
            pages = book.turn('pages');

          if (currentPage>3 && currentPage<pages-3) {

            if (page==1) {
              book.turn('page', 2).turn('stop').turn('page', page);
              e.preventDefault();
              return;
            } else if (page==pages) {
              book.turn('page', pages-1).turn('stop').turn('page', page);
              e.preventDefault();
              return;
            }
          } else if (page>3 && page<pages-3) {
            if (currentPage==1) {
              book.turn('page', 2).turn('stop').turn('page', page);
              e.preventDefault();
              return;
            } else if (currentPage==pages) {
              book.turn('page', pages-1).turn('stop').turn('page', page);
              e.preventDefault();
              return;
            }
          }

          updateDepth(book, page);

          if (page>=2)
            $('.photo-album .p2').addClass('fixed');
          else
            $('.photo-album .p2').removeClass('fixed');

          if (page<book.turn('pages'))
            $('.photo-album .back-side').addClass('fixed');
          else
            $('.photo-album .back-side').removeClass('fixed');

          Hash.go('page/'+page).update();

        },

        turned: function(e, page, view) {

          var book = $(this);

          if (page==2 || page==3) {
            book.turn('peel', 'br');
          }

          updateDepth(book);

          $('#slider').slider('value', getViewNumber(book, page));

          book.turn('center');

        },

        start: function(e, pageObj) {

          moveBar(true);

        },

        end: function(e, pageObj) {

          var book = $(this);

          updateDepth(book);

          setTimeout(function() {

            $('#slider').slider('value', getViewNumber(book));

          }, 1);

          moveBar(false);

        },

        missing: function (e, pages) {

          for (var i = 0; i < pages.length; i++) {
            addPage(pages[i], $(this));
          }

        }
      }
    });


    $('#slider').slider('option', 'max', numberOfViews(flipbook));

    flipbook.addClass('animated');

    // Show canvas

    $('#canvas').css({visibility: ''});
  }

  // Hide canvas

  $('#canvas').css({visibility: 'hidden'});

  if($(".photo-album").length > 0)
    loadApp()
})

/* Steve jobs' book */

function updateDepth(book, newPage) {

  var page = book.turn('page'),
    pages = book.turn('pages'),
    depthWidth = 16*Math.min(1, page*2/pages);

    newPage = newPage || page;

  if (newPage>3)
    $('.photo-album .p2 .depth').css({
      width: depthWidth,
      left: 20 - depthWidth
    });
  else
    $('.photo-album .p2 .depth').css({width: 0});

    depthWidth = 16*Math.min(1, (pages-page)*2/pages);

  if (newPage<pages-3)
    $('.photo-album .back-side .depth').css({
      width: depthWidth,
      right: 20 - depthWidth
    });
  else
    $('.photo-album .back-side .depth').css({width: 0});

}

function loadPage(page) {
  $.ajax({ url: '/photos/' + gon.next_approved_id })
    .done(function(pageHtml) {
      $('.photo-album .p' + page).html(pageHtml);
    });
}

function addPage(page, book) {

  var id, pages = book.turn('pages');

  if (!book.turn('hasPage', page)) {

    var element = $('<div />',
      {'class': 'own-size',
        css: {width: 460, height: 582}
      }).
      html('<div class="loader"></div>');

    if (book.turn('addPage', element, page)) {
      loadPage(page);
    }

  }
}

function numberOfViews(book) {

  return book.turn('pages') / 2 + 1;

}

function getViewNumber(book, page) {

  return parseInt((page || book.turn('page'))/2 + 1, 10);

}

function zoomHandle(e) {

  if ($('.photo-album').data().zoomIn)
    zoomOut();
  else if (e.target && $(e.target).hasClass('zoom-this')) {
    zoomThis($(e.target));
  }

}

function zoomThis(pic) {

  var position, translate,
    tmpContainer = $('<div />', {'class': 'zoom-pic'}),
    transitionEnd = $.cssTransitionEnd(),
    tmpPic = $('<img />'),
    zCenterX = $('#book-zoom').width()/2,
    zCenterY = $('#book-zoom').height()/2,
    bookPos = $('#book-zoom').offset(),
    picPos = {
      left: pic.offset().left - bookPos.left,
      top: pic.offset().top - bookPos.top
    },
    completeTransition = function() {
      $('#book-zoom').unbind(transitionEnd);

      if ($('.photo-album').data().zoomIn) {
        tmpContainer.appendTo($('body'));

        $('body').css({'overflow': 'hidden'});

        tmpPic.css({
          margin: position.top + 'px ' + position.left+'px'
        }).
        appendTo(tmpContainer).
        fadeOut(0).
        fadeIn(500);
      }
    };

    $('.photo-album').data().zoomIn = true;

    $('.photo-album').turn('disable', true);

    $(window).resize(zoomOut);

    tmpContainer.click(zoomOut);

    tmpPic.load(function() {
      var realWidth = $(this)[0].width,
        realHeight = $(this)[0].height,
        zoomFactor = realWidth/pic.width(),
        picPosition = {
          top:  (picPos.top - zCenterY)*zoomFactor + zCenterY + bookPos.top,
          left: (picPos.left - zCenterX)*zoomFactor + zCenterX + bookPos.left
        };


      position = {
        top: ($(window).height()-realHeight)/2,
        left: ($(window).width()-realWidth)/2
      };

      translate = {
        top: position.top-picPosition.top,
        left: position.left-picPosition.left
      };

      $('.samples .bar').css({visibility: 'hidden'});
      $('#slider-bar').hide();


      $('#book-zoom').transform(
        'translate('+translate.left+'px, '+translate.top+'px)' +
        'scale('+zoomFactor+', '+zoomFactor+')');

      if (transitionEnd)
        $('#book-zoom').bind(transitionEnd, completeTransition);
      else
        setTimeout(completeTransition, 1000);

    });

    tmpPic.attr('src', pic.attr('src'));

}

function zoomOut() {

  var transitionEnd = $.cssTransitionEnd(),
    completeTransition = function(e) {
      $('#book-zoom').unbind(transitionEnd);
      $('.photo-album').turn('disable', false);
      $('body').css({'overflow': 'auto'});
      moveBar(false);
    };

  $('.photo-album').data().zoomIn = false;

  $(window).unbind('resize', zoomOut);

  moveBar(true);

  $('.zoom-pic').remove();
  $('#book-zoom').transform('scale(1, 1)');
  $('.samples .bar').css({visibility: 'visible'});
  $('#slider-bar').show();

  if (transitionEnd)
    $('#book-zoom').bind(transitionEnd, completeTransition);
  else
    setTimeout(completeTransition, 1000);
}


function moveBar(yes) {
  if (Modernizr && Modernizr.csstransforms) {
    $('#slider .ui-slider-handle').css({zIndex: yes ? -1 : 10000});
  }
}

function setPreview(view) {

  var previewWidth = 115,
    previewHeight = 73,
    previewSrc = 'pages/preview.jpg',
    preview = $(_thumbPreview.children(':first')),
    numPages = (view==1 || view==$('#slider').slider('option', 'max')) ? 1 : 2,
    width = (numPages==1) ? previewWidth/2 : previewWidth;

  _thumbPreview.
    addClass('no-transition').
    css({width: width + 15,
      height: previewHeight + 15,
      top: -previewHeight - 30,
      left: ($($('#slider').children(':first')).width() - width - 15)/2
    });

  preview.css({
    width: width,
    height: previewHeight
  });

  if (preview.css('background-image')==='' ||
    preview.css('background-image')=='none') {

    preview.css({backgroundImage: 'url(' + previewSrc + ')'});

    setTimeout(function(){
      _thumbPreview.removeClass('no-transition');
    }, 0);

  }

  preview.css({backgroundPosition:
    '0px -'+((view-1)*previewHeight)+'px'
  });
}

function isChrome() {

  // Chrome's unsolved bug
  // http://code.google.com/p/chromium/issues/detail?id=128488

  return navigator.userAgent.indexOf('Chrome')!=-1;

}
