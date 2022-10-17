function validateName(){
  let name_err = document.getElementById('fullname-error')
  let name = document.getElementById('fullname').value

  if (name.length == 0 || name == '') {
          name_err.innerHTML = "Name cannot be empty";
          return false;
      }
      if (!name.match(/^[A-Za-z]*\s{0,1}?[A-Za-z]*\s{0,1}?[A-Za-z]*$/)) {
          name_err.innerHTML = "Write Proper name";
          return false;
      }
      if (name.length <= 3 || name.length >= 25) {
          name_err.innerHTML = "Name must be between 3 and 25 characters";
          return false;
      }
      name_err.innerHTML = ""
      return true;   
}
function validateHouse(){
  let house = document.getElementById('house').value
  let house_err = document.getElementById('house-error')
  if (house.length <= 3 || house == '') {
          house_err.innerHTML = "Enter valid details"
          return false;
      }
      house_err.innerHTML = ''
      return true;
}
function validatePhone(){
  let phone = document.getElementById('phone').value
  let phone_err = document.getElementById('phone-error')
  if(phone.length <= 10 || phone == ''){
      phone_err.innerHTML = 'Enter a valid Phone number'
      return false;
  }
  phone_err.innerHTML = ''
  return true;
}
function validateLand(){
  let land = document.getElementById('country').value
  let land_err = document.getElementById('land-error')
  if(land.length <= 5 || land == ''){
      land_err.innerHTML = 'Enter a valid Land Mark'
      return false;
  }
  land_err.innerHTML = ''
  return true
}
function validateState(){
  let state = document.getElementById('state').value
  let state_err = document.getElementById('state-error')
  if(state.length <= 3 || state == ''){
      state.err.innerHTML = 'Enter a valid state'
      return false;
  }
  state.err.innerHTML = ''
  return true;
}
function validateDistrict(){
  let dis = document.getElementById('district').value
  let dis_err = document.getElementById('district-error')
  if(dis.length <= 4 || dis == ''){
      dis_err.innerHTML = 'Enter valid district'
      return false;
  }
  dis_err.innerHTML = ''
  return true;
}
function validatePincode(){
  let pin = document.getElementById('pincode').value
  let pin_err = document.getElementById('pincode-error')
  if(pin.length <= 5 || pin == ''){
      pin_err.innerHTML = 'Enter a valid pincode'
      return false;
  }
  pin_err.innerHTML = ''
  return true;
}
function saveAdd(){
  if(!validateName||!validateHouse||!validatePhone||!validateLand||!validateState||!validateDistrict||!validatePincode){
      dcoument.getElementById('formErr').innerHTML = 'Please fill all fields carefully..!'
      return true;
  }
}