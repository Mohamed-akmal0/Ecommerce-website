const  express = require('express');
const chart = require('chart.js')
const getUsers = require('../queries/user')
const getProduct = require('../queries/product')
const fileUpload = require('express-fileupload');
const getOrders = require('../queries/order')
const { response } = require('express');
const session = require('express-session');
const { Db } = require('mongodb');
const { off } = require('../app');
const { createPrivateKey } = require('crypto');
const getCoupon = require('../queries/coupon')
var router = express.Router();

//file upload
router.use(fileUpload())

//creating database value
const details = {
  username: "admin@123",
  password:"admin"
}

//login verifying middleware
const adminVerify = (req,res,next) => {
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

//home route
router.get('/',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin/admin_page')
  }else{
    res.redirect('/admin/login')
  }
})

//login route
router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin/admin_page')
  }else{
    res.render('admin/admin_index',{'loginErr':req.session.loginErr})
  }
})

router.post('/login',(req,res)=>{
  if(details.username == req.body.username && details.password == req.body.password){
    req.session.admin = req.body
    res.redirect('/admin/admin_page')
  }else{
    req.session.loginErr= 'Please check your password or username'
    res.redirect('/admin/login')
  }
})

//route for admin to view customers
router.get('/admin_page', adminVerify, (req,res)=>{
    getUsers.getUsers().then((user)=>{
    res.render('admin/admin_page',{user})}) 
})

//route for editing user
router.get('/edit-user/:id',async(req,res)=>{
  let user = await getUsers.userDetails(req.params.id)
  res.render('admin/admin_edituser',{user})
})

router.put('/edit-user/:id',(req,res)=>{
  console.log(req.params.id)
  console.log(req.body)
  getUsers.updateUser(req.params.id,req.body).then(()=>{
      res.redirect('/admin/admin_page')
  })
})

//route to view products
router.get('/admin_product', adminVerify, (req,res) => {
    getProduct.getAllProducts().then((product) => {
      res.render('admin/admin_product' , {product})
      })
})

//route for adding product
router.get('/admin_addproduct' ,adminVerify , (req,res) => {
    getProduct.getCategories().then((getcategory) => {
      res.render('admin/admin_addproduct' , {getcategory})
    })
  
})

router.post('/add_product',  (req,res) => {
  getProduct.addproduct(req.body).then(async (data) => {
    let Image = req.files?.image
    let Image1 = req.files?.image1
    let Image2 = req.files?.image2
    let Image3 = req.files?.image3
    Image.mv(`public/images/${data}.jpg`,(err , done) => {
    })
    Image1.mv(`public/images/${data}1.jpg`,(err,done) => {
    })
    Image2.mv(`public/images/${data}2.jpg`,(err,done) => {
    })
    Image3.mv(`public/images/${data}3.jpg`,(err,done) => {
    })
    let category = await getProduct.findCategories()
    console.log( category)
    await category.forEach(async (element) => {
    let value = parseInt(element.price - (element.price * element.Offer/ 100))
    console.log(value)
    await getProduct.addDiscountProduct(element._id,value)
  })
  res.redirect('/admin/admin_product')
})
})

//route for edit product ==> 
router.get('/edit-product/:id' ,adminVerify, async (req,res) => {
  let cat = await getProduct.getCategories()
  let product = await getProduct.productdetails(req.params.id,req.body)
  res.render('admin/admin_editproduct' , {product , cat})
})

router.post('/edit-product/:id' , (req,res) => {
  let id = req.params.id
  getProduct.editProduct(req.params.id , req.body).then(() => {
    res.redirect('/admin/admin_product')
    if(req.files?.image){
      let Image = req.files.image
      Image.mv(`public/images/${id}.jpg`)
    }
  })
})

//route for deleting products ==> 
router.delete('/delete-product/:id', adminVerify, (req,res) => {
  let pid = req.params.id
  getProduct.deleteProduct(pid).then((response) => {
    res.json(response)
  // res.redirect('/admin/admin_product')
  })
})

//route for viewing user orders ==> 
router.get('/view-orders' ,adminVerify, async  (req,res) => {
    let userOrders = await getOrders.getUserOrders()
    res.render('admin/view-orders' , {userOrders})
})

//route for editing status of user orders ===>
router.post('/edit-status/:data' , adminVerify,(req,res,next) => {
  console.log('edit status eti');
  getOrders.editStatus(req.body.status,req.params.data).then(() => {
    res.redirect('/admin/view-orders')
  })
})

// route for rendering category page ===>
router.get('/categories' , adminVerify, (req,res) => {
    getProduct.getCategories().then((getcategory) => {
      res.render('admin/categories' , {getcategory})
    })
})

//route for rendering add category page ===>
router.get('/add_categories' , adminVerify, (req,res) => {
    res.render('admin/add_categories')
})

router.post('/add_categories' , adminVerify , (req,res) => {
  getProduct.addCategory(req.body).then((data) => {
  
    res.redirect('/admin/categories')
  })
})

//route for editing category===>
router.get('/edit-category/:id' , adminVerify,async (req,res) => {
  let catId = req.params.id
  console.log(catId);
  await getProduct.categoryDetails(catId).then((category) => {
    // console.log(details);
    res.render('admin/editcategory' , {category})
  })
})

router.patch('/edit-category' ,async  (req,res) => {
  // try{
    let catDetails = req.body

    console.log(catDetails)

    await getProduct.editcategory(catDetails).then(async (response) => {

      let category = await getProduct.findCategories()

      console.log( category)

      await category.forEach(async (element) => {

        let value = parseInt(element.price - (element.price * element.Offer/ 100))

        console.log(value)

        await getProduct.addDiscountProduct(element._id,value)

      })

      res.json(response)
    })
  // }catch(err){
  //   console.log("error that occurred in the offer adding in th edit category route"+err)
  // }
})

//route for deleting categories ==>
router.delete('/delete-category/:id', adminVerify, (req,res) => {
  let catId = req.params.id
  getProduct.deletecategory(catId).then((response) => {
    res.json(response)
  })
})

//rote for admin dashboard ==>
router.get('/dashboard' , (req,res) => {
  res.render('admin/admin_dashboard')
})

//route for getting graph of monthwise
router.get('/dashboardMonth' , (req,res) => {
  getProduct.getMonth().then((response) => {
    res.json(response)
  })
  // res.render('admin/admin_dashboard')
})

//route for getting graph of daywise
router.get('/dashboardDay' , (req,res) => {
  getProduct.getDay().then((data) =>{
    console.log(data)
    res.json(data)
  })
})

//router for getting graph of week wise
router.get('/dashboardWeek' , (req,res) => {
  console.log('we have reached week wise graph')
  getProduct.getWeek().then((data) => {
    console.log(data)
    res.json(data)
  })
})

//route for adding and listing admin coupen
router.get('/coupen' , adminVerify , async (req,res) => {
  let coupon = await getCoupon.getCoupon()
  res.render('admin/coupen' , {coupon})
})

router.post('/coupen' , (req,res) => {
  let coupon = req.body
  getCoupon.addCoupen(coupon).then((response) => {
    res.redirect('/admin/coupen')
  })
})

//route for removing coupon 
router.delete('/delete_coupon/:id' ,adminVerify , (req,res) => {
  let coupid = req.params.id
  getCoupon.removeCoupon(coupid).then((response) => {
    res.json(response)
  })
  
})

//route for logout ==> 
router.get('/logout',(req,res)=>{

  req.session.destroy()
  res.render('admin/admin_index')
})
module.exports = router;
