// -------function for menu toggle button----------
var MenuItems = document.getElementById("MenuItems")
MenuItems.style.maxHeight = "0px"
function menutoggle(){
    if(MenuItems.style.maxHeight == "0px"){
    MenuItems.style.maxHeight = "200px"
    }
    else{
        MenuItems.style.maxHeight = "0px"
    }
}
//  ------- script for changing products in product details page
var ProductImage = document.getElementById('ProductImage')
        var smallImg = document.getElementsByClassName('small---img')
        smallImg[0].onclick = function()
        {
            ProductImage.src = smallImg[0].src
        }
        smallImg[1].onclick = function()
        {
            ProductImage.src = smallImg[1].src
        }
        smallImg[2].onclick = function()
        {
            ProductImage.src = smallImg[2].src
        }
        smallImg[3].onclick = function()
        {
            ProductImage.src = smallImg[3].src
        }

// script for image zooming
var options = {
    width:480,
    height:500,
    zoomWidth:300,
    offset:{vertical:0 , horizontal:10},
    scale:1,
}
//creating new object for image zoom
new ImageZoom(document.getElementById("image-container") , options)
