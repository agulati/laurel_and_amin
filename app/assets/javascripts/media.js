$(function() {
  var $fileInput = $("#file-input")
  var $attachedFile = $(".attached-file")
  var $deleteFile = $(".delete-file")
  var $form = $("form")

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

  $form.on("submit", function () {
    $("body").css("cursor", "progress");
  })

  $("body").css("cursor", "default");
});
