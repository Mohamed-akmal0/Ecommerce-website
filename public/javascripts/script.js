function addtocart(pid){
  console.log('ajsx fn ethi');
  $.ajax({
      url:'/addto-cart/'+pid,
      method:'get',
      success:(response) => {
          alert(response)
      }
  })
}