//address selection
function addFields(fullName,house,phone,country,state,district,pincode){
  let fullnames = document.getElementById('fullname').value = fullName
  let houses = document.getElementById('house').value = house
  let phones = document.getElementById('phone').value = phone
  let countrys = document.getElementById('country').value = country
  let states = document.getElementById('state').value = state
  let districts = document.getElementById('district').value = district
  let pincodes = document.getElementById('pincode').value = pincode
}

//function for checking coupon
function Apply() {
  const coupon = document.getElementById("promo").value
  let total = document.getElementById('sum').value
  let Coupon = document.getElementById('couponValue')
  let x = document.getElementById('couponId')
  console.log(x);
  
  $.ajax({
    url:'/check_coupon',
    data:{
      Coupon:coupon
    },
    method:'post',
    success : (response) => {
      console.log(response)
      if(response.status == false){
        let error = document.getElementById('coupErr')
        error.innerHTML = 'Enter a valid coupon code'
      }else{
        alert('You got a coupon')
        let a = document.getElementById('total').innerHTML = total - response.couponOffer
        Coupon.value = a
        x.value = response._id 
        console.log(x)
      }
    }
  })
}
//function for payment buttons
function displayCheckout() {
  let list1 = document.getElementById("checkout-button").classList
  let list2 = document.getElementById("paypal-button-container").classList;
  list1.add('disbtn')
  list2.remove('disbtn')
}

function displayPaypal() {
  let list1 = document.getElementById("checkout-button").classList
  let list2 = document.getElementById("paypal-button-container").classList;
  list1.remove('disbtn')
  list2.add('disbtn')
}
//function for rendering paypal button
paypal.Buttons({
  // Sets up the transaction when a payment button is clicked
  createOrder: (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '77.44' // Can also reference a variable or function
        }
      }]
    });
  },
  // Finalize the transaction after payer approval
  onApprove: (data, actions) => {
    return actions.order.capture().then(function(orderData) {
      // Successful capture! For dev/demo purposes:
      console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
      const transaction = orderData.purchase_units[0].payments.captures[0];
      alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);
      $(document).ready(function () {
        console.log('entered trigger function')
        $( '#btn-place-order' ).trigger( 'click' );
        console.log('enter after trigger')
      })
      
      // When ready to go live, remove the alert and show a success message within this page. For example:
      // const element = document.getElementById('paypal-button-container');
      // element.innerHTML = '<h3>Thank you for your payment!</h3>';
      // Or go to another URL:  actions.redirect('thank_you.html');
    });
  }
}).render('#paypal-button-container');