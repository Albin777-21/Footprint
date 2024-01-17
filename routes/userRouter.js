const express = require('express');
const router = express.Router()
const { upload } = require('../multer/multer')
const auth = require('../middleware/userAuth');


const { loginUser,
    registerUser,
    createUser,
    emailVerified,
    verifyUser,
    loadIndex,
    resendOTP,
    logout,
    // searchProduct,
    userProfile,
    addProfilePic,
    addUserAddress,
    editProfile,
    updateAddress,
    updateProfile,
    editAddress,
    deleteAddress,
    forgotPsdOTP,
    forgotEmailValid,
    forgotPsdPage,
    updatePassword,
    emailForgot,
    processNewAddress,
    checkoutAddress,
    changePassword,
    Changepass,
    aboutpage,
    contactpage
    


    
} = require('../controllers/userCntrl');






const {isLogged,isLoggedOut,isBlocked}=require('../middleware/userAuth');

const { aProductPage, shopProduct } = require('../controllers/productCtrl');

const { getCart, addToCart, deleteCart, modifyCartQuantity, deleteCartItem, } = require('../controllers/cartCtrl')

const {checkOut,OrderPlaced,orderDetails,orderPage,allOrderDetails,cancelOrder,returnOrder,useWallet, verifyPayment, buyNow, buynowPlaceOrder,}=require('../controllers/orderCtrl')

const { Wishlist, addToList, deleteWishlistItem }=require('../controllers/wishlistCtrl');

const { blockUser } = require('../controllers/admincntrl');

const {productSearch,CategoryFilter,filterSearch,colorFilter,priceFilter,brandFilter,clearFilter,sortByPrice,sizeFilter}=require('../controllers/filterCtrl')

const {addMoneyWallet,updateMongoWallet,sumWalletBuynow,sumWallet,walletPayment}=require('../controllers/walletCtrl')

const {validateCoupon}=require('../controllers/couponCtrl');

const { invoice, invoices } = require('../controllers/invoiceCtrl');




//user

router.get('/login', auth.isLoggedOut, loginUser)
router.post('/login', auth.isLoggedOut, verifyUser)
router.get('/register', registerUser)
router.post('/register', createUser)
router.post('/emailVerified', emailVerified)
router.get('/', loadIndex)
router.post('/resendOtp', resendOTP)
router.get('/logout', auth.isLogged, logout)
// router.post('/searchProduct', searchProduct)
router.get('/forgotPassword',forgotPsdPage);
router.post('/forgotEmailValid',forgotEmailValid);
router.post('/forgotPsdOTP', forgotPsdOTP);
router.post('/updatePassword',isBlocked, updatePassword);
router.get('/emailForgot',emailForgot)
router.post('/changeUserPassword',isBlocked,changePassword)







//User Profile

router.get('/profile',isLogged,isBlocked,userProfile)
router.post('/addProfilePic',isLogged,isBlocked,upload.single('image'),addProfilePic)
router.get('/editProfile',isLogged,isBlocked,editProfile)
router.post('/updateProfile',isLogged,isBlocked,updateProfile)

//User Address
router.get('/addAddressPage', auth.isLogged,isBlocked, processNewAddress); // Add this line for processing new addresses
router.post('/addUserAddress',isLogged,isBlocked,addUserAddress)
router.get('/editAddress',isLogged,isBlocked,editAddress)
router.post('updateAddress',isLogged,isBlocked,updateAddress)
router.get('/deleteAddress',isLogged,isBlocked,deleteAddress)
router.post('/processNewAddress',auth.isLogged,isBlocked,checkoutAddress)

//Products
router.get('/aProduct',auth.isBlocked, upload.single('images'), aProductPage)
 router.get('/shop',isBlocked,shopProduct)

 //Cart
 router.get('/cart',isLogged,auth.isBlocked,getCart)
 router.get('/addToCart',auth.isLogged,auth.isBlocked,addToCart)
 router.get('/deleteCartItem',isBlocked,deleteCartItem)
 router.post('/modifyCartQuantity',auth.isLogged,isBlocked,modifyCartQuantity)
 router.get('/deleteCart',auth.isLogged,isBlocked,deleteCart)

 //Order
 router.get('/checkout',auth.isLogged,isBlocked,checkOut)
 router.post('/orderPlaced',auth.isLogged,isBlocked,OrderPlaced)
 router.get('/orderDetails',auth.isLogged,isBlocked,orderDetails)
 router.get('/orderPage',auth.isLogged,isBlocked,orderPage)
 router.get('/allOrderDetails',auth.isLogged,isBlocked,allOrderDetails)
 router.get('/cancelOrder',auth.isLogged,isBlocked,cancelOrder)
 
 router.get('/return',auth.isLogged,isBlocked,returnOrder)
 router.post('/verifyPayment',auth.isLogged,isBlocked,verifyPayment)
 router.get('/buyNOw',isLogged,auth.isBlocked,buyNow);
router.post('/buynowPlaceOrder',isLogged,auth.isBlocked,buynowPlaceOrder);

 

//Wishlist
router.get('/Wishlist',auth.isLogged,isBlocked,Wishlist)
router.get('/addToList',auth.isLogged,isBlocked,addToList)
router.get('/deleteWishlistItem',auth.isLogged,isBlocked,deleteWishlistItem)

//Filter 

router.post('/productSearch',isBlocked,productSearch);
router.get('/CategoryFilter',isBlocked,CategoryFilter);
router.post('/filterSearch',isBlocked,filterSearch);
router.get('/priceFilter',isBlocked,priceFilter);
router.get('/brandFilter',isBlocked,brandFilter);
router.get('/sizeFilter',isBlocked,sizeFilter);
router.get('/clearFilter',isBlocked,clearFilter);//clear all the filter 
router.get('/sortByPrice',isBlocked,sortByPrice);
router.get('/colorFilter',isBlocked,colorFilter);


//Wallet 

router.post('/addMoneyWallet',auth.isLogged,isBlocked,addMoneyWallet)
router.post('/updateMongoWallet',auth.isLogged,isBlocked,updateMongoWallet)
router.post('/useWallet',auth.isLogged,isBlocked,useWallet)
router.get('/sumWalletBuynow',auth.isLogged,isBlocked,sumWalletBuynow)
router.post('/walletPayment',auth.isLogged,isBlocked,walletPayment)
router.post('/sumWallet',auth.isBlocked,sumWallet);



router.post('/validateCoupon',isBlocked,validateCoupon);

//INVOICES

router.get('/invoice',auth.isLogged,isBlocked,invoice)
router.get('/invoices',auth.isLogged,isBlocked,invoices)

router.get('/about',aboutpage)
router.get('/contact',contactpage)





module.exports = router

