$(document).ready(function(){
    $('form').on('submit', function(){
  
        var options = $('#options').val();
        var option = {options: options};
        console.log(option);
        $.ajax({
          type: 'POST',
          url: '/option',
          data: option,
          complete: function(){
            window.location.href = '/show';
          },
          error: function(){
              alert('error');
          }
        });
        return false;
    });
  });