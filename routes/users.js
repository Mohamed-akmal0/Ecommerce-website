const express = require('express');
const { response, off } = require('../app');
const userEncrypt = require('../bcrypt')
const getProduct = require('../queries/product')
const getUser = require('../queries/user')
const getCart = require('../queries/cart')
const getOrders = require('../queries/order')
const getCoupon = require('../queries/coupon')
const {check , validationResult } = require('express-validator');
const { route } = require('.');
const { ResultWithContext } = require('express-validator/src/chain');
const { resolveInclude } = require('ejs');
const { json } = require('express');
const  router = express.Router();


router.use((req,res,next) => {
    res.set('Cache-control' , 'no-store')
    next()
})

//user verifiyer middleware
const userVerify = (req,res,next) => {
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
}

//user home route
router.get('/',(req,res) => { 
    if(req.session.loggedIn){
        res.redirect('/user_dashboard')
    }else{
        res.render('user/home')
    }    
})

//route for user login
router.get('/login',(req,res)=>{
    if(req.session.loggedIn){
        res.redirect('/user_dashboard')
    }else{
        res.render('user/index', {loginErr:req.session.loginErr, blocked:req.session.blocked})
    }
    req.session.blocked = null
    req.session.loginErr=null
    req.session.save()
});

router.post('/login',(req,res)=>{
   userEncrypt.userLogin(req.body).then((response)=>{
    if(response == 'blocked' ){
        console.log('blocked')
        req.session.blocked = true
        req.session.save()
        res.redirect('/login')
    }else if(response == false){
        req.session.loginErr  = "Invalid Username or Password"
        res.redirect('/login')
    }
    else{
        req.session.loggedIn=true
        req.session.user = response.user
        res.redirect('/user_dashboard')
    }
   })
})

//route for user sign up
router.get('/signup', (req,res)=>{
    if(req.session.loggedIn){
        res.redirect('/user_dashboard')
    }else{
        res.render('user/signup')
    }  
})

router.post('/signup', [
    check('user' , 'username must be more than 3 characters long')
        .exists()
        .isLength({min:3,max:10}),
    check('email' , 'Enter a proper email address')
        .isEmail()
        .normalizeEmail(),
    check('password' ,'password must be minimum 3 length character')
        .exists()
        .isLength({min:3})
] , (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const alert  = errors.array()
        res.render('user/signup',{alert})
    }else{
        userEncrypt.userSignup(req.body).then((response) => {
            console.log(response);
        })
        res.redirect('/login')
    }  
})

//route for user dashboard
router.get('/user_dashboard',userVerify, async (req,res) => {
        let user = req.session.user
        let cartCount = await getCart.getCartCount(req.session.user._id)
        let category = await getProduct.getCategories()
        getProduct.getAllProducts().then((product) => {
        res.render('user/user_dashboard',{user , product , cartCount , category})
        })  
})

//route for user to view product details
router.get('/product_detail/:id' ,userVerify, async (req ,res) => {
    let product = req.params.id;
    let cartCount = await getCart.getCartCount(req.session.user._id)
    await getProduct.productdetails(product).then((product) => {
        res.render('user/product_detail' ,  {product , cartCount} )
     })
})

//route for rendering cart page in user side
router.get('/cart' ,  userVerify,async (req,res) => {
        let products = await getCart.getCart(req.session.user._id)
        let totalAmount = await getCart.getTotal(req.session.user._id)
        res.render('user/cart' ,{products,user:req.session.user,totalAmount})
})

//route for adding product to user cart
router.get('/addto-cart/:id' ,userVerify, (req,res) => {
    getUser.addtocart(req.params.id , req.session.user._id).then( () => {
        res.redirect('/user_dashboard')
    })
})

//routing for changing product quantity
router.post('/change-product-quantity' ,(req,res,next) => {
    console.log(req.body)
    getCart.changeQuantity(req.body).then( async (response) => {
        response.total = await getCart.getTotal(req.body.user)
        res.json(response)
    })
})

//route for deleting product from the cart
router.delete('/delete-cart/:id' ,userVerify, (req,res) => {
    let pid = req.params.id
    let uid = req.session.user._id
    console.log(pid,uid);
        getCart.deleteCart(pid,uid).then( (response) => {
            res.json(response)
            // res.redirect('/cart')
        })
})

//route for rendering checkout page
router.get('/proceed-to-checkout',userVerify, async (req,res) => {
    let userId = req.session.user._id
    let address = await getUser.getAddress(userId)
    let total = await getCart.getTotal(userId)
    res.render('user/proceed-to-checkout',{user:req.session.user , total , address})
})

router.post('/proceed-to-checkout' , userVerify, async  (req,res) => {
        let uid = req.body.userid
        console.log(uid)
        let products = await getCart.getCartProductList(uid)
        let totalAmount = await getCart.getTotal(uid)
        // console.log(req.body);
        let {couponPrice} = req.body
        let {couponid} = req.body
        let CouponName = ''
        let CouponOffer = 0
        console.log(CouponName)
        if(couponPrice){
            OfferPrice = couponPrice
            let couponUsed = await getCoupon.findCoupon(couponid)
            CouponName = couponUsed.couponName
            CouponOffer = couponUsed.couponOffer
            await getCoupon.usedCoupon(couponUsed._id,uid).then((response)=>{
            })
        }
        getCart.placeOrder(req.body,products,totalAmount,CouponName,CouponOffer).then(async (id) => { //now we have oder id 
            if(req.body['payment'] == 'COD'){
                res.json({COD_success:true})
            }else if(req.body['payment'] == 'razorpay'){
               getOrders.razorPay(id,totalAmount).then((response) => {
                res.json(response)
               })
            }else if(req.body['payment'] == 'paypal'){
                console.log("orderid" + id)
                console.log(req.body)
                    await getOrders.ChangingPaymentStatus(id)
                    res.json({paypal:true})
                
            }
            // res.json({status:true})
        })
})
//route for checking coupon 
router.post('/check_coupon' ,userVerify, async (req,res) => { 
    const {Coupon} = req.body
    const uid = req.session.user._id
    await getCoupon.checkCoupon(Coupon,uid).then((response) => {
        if(response){
            res.json(response)    
        }else{
            res.json({status:false})
        }
    })
    
})

//route for rendering order placed page
router.get('/placed-order' , userVerify,(req,res) => {
        res.render('user/placed-order' ,{user:req.session.user})
})

//router for getting orders list
router.get('/orders' , userVerify,async (req,res) => {
        let orders = await getOrders.getOrders(req.session.user._id)
        var products = await getOrders.getOrdersproduct(req.session.user._id)
        res.render('user/orders' ,{user:req.session.user , orders , products})
})

//route for edit orders
router.patch('/edit-orders/:id' ,userVerify,(req,res) => {
        let id = req.params.id
        getOrders.cancelOrder(id).then((response) => {
            res.json(response)
        })  
})

//route for return orders
router.patch('/return-orders/:id' , userVerify,  (req,res) => {
    let orderid = req.params.id
    getOrders.returnOrder(orderid).then((response) => {
        res.json(response)
    })
})

//route for viewing ordered product
router.get('/view-product/:id' , async (req,res) => {
     var products = await getOrders.getOrdersproduct(req.params.id)
        res.render('user/view-product' , {user:req.session.user,products})
    
})

//route for payment verify
router.post('/payment-verify',(req,res) => {
    getOrders.paymentVerify(req.body).then(() => {
        console.log(req.body['order[receipt]']);
        getOrders.ChangingPaymentStatus(req.body['order[receipt]']).then(() => {
            res.json({status:true})
        })
    }).catch((err) => {
        console.log(err);
        res.json({status:false,errMessage:''})
    })
})

//route for rendering user profile
router.get('/user-profile' ,userVerify, async (req,res) => {
        let cartCount = await getCart.getCartCount(req.session.user._id)
        let userid = req.session.user._id
        var user = await getUser.viewUser(userid)
        res.render('user/profile',{cartCount , user , USER:req.session.user})
})

//route for rendering edit uesr profile 
router.get('/edit-user-profile/:id' ,userVerify, async (req,res) => {
        let uid = req.session.user._id
        await getUser.getProfile(uid).then((data) => {
            res.render('user/edit-user-profile' , {userid:req.session.user , data})
        })
}) 

router.put('/edit-user-profile/:id' , userVerify,(req,res) => {
        let uid = req.session.user._id
        let editBody = req.body
        getUser.editProfile(uid,editBody).then((response) => {
            res.json(response)
        })
})

//route for add to whishlist
router.get('/add-to-whishlist/:id' ,userVerify, (req,res) => {
        let pid = req.params.id
        let uid = req.session.user._id
        getUser.addtoWhishlist(pid,uid).then(() => {
            res.redirect('/user-profile')
        })
})

//route for rendering address page
router.get('/user-address' ,userVerify, async (req,res) => {
        let uid = req.session.user._id
        var address = await getUser.getAddress(uid)
        res.render('user/user-address' , { address, userid:req.session.user})
})

//route for rendering add address
router.get('/add-address' , userVerify,(req,res) => {
        res.render('user/add-address' , {user:req.session.user})
})

router.post('/add-address' ,(req,res) => {
    let body = req.body
    getUser.addAddress(body).then(() => {
        res.redirect('/user-address')
    })   
})

//route for rendering edit adddress for user
router.get('/edit-address/:id' , userVerify,async  (req,res) => {
        let aid = req.params.id
        console.log("getil id"+aid)
        let edit = await getUser.getEditAddress(aid)
        res.render('user/editAddress' , { edit,  user:req.session.user})
})

router.put('/edit-address/:id' , userVerify,(req,res) => {
        let addressId = req.params.id
        let addressDetails = req.body
        getUser.editAddress(addressId , addressDetails).then((response) => {
            res.json(response)
        })
})

//route for rendering delete address page for user
router.delete('/delete-address/:id' , userVerify, async  (req,res) => {
        console.log('delete address routeil ethi')
        let deleteId = req.params.id
        getUser.deleteAddress(deleteId).then((response) => {
            res.json(response)
        })
})

//route for rendering whishlist page
router.get('/whishlist' , userVerify , async (req,res) => {
        let uid = req.session.user._id
        let list = await getUser.getWhishlist(uid)
        res.render('user/whishlist' , {user:req.session.user,list})    
})

//route for  deleting  whishlist
router.patch('/delete-whishlist' , userVerify , (req,res) => {
        getUser.deleteWhishlist(req.body).then((response) => {
            res.json(response)
        })
})



//route for rendering change password route for user
router.get('/change-password' , userVerify,(req,res) => {
        res.render('user/change-password' , {user : req.session.user})
})  

//route for getting password to be change for user
router.post('/change-password/:id' , (req,res) => {
    let uid = req.session.user._id
    let passbody = req.body
    console.log(passbody)
    getUser.changePassword(uid,passbody).then((response) => {
        console.log(response)
        if(response){
            res.json(response)
        }else{
            res.json({status:false})
        }
        // res.redirect('/user-profile')
    })  
})

//route for user logout
router.get('/logout',(req,res)=>{
    // req.session.user = null
    // req.session.loggedIn = null
    req.session.destroy()
    res.redirect('/')
})

module.exports = router;
