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
    Changepass
    


    
} = require('../controllers/userCntrl');






const {isLogged,isLoggedOut}=require('../middleware/userAuth');

const { aProductPage, shopProduct } = require('../controllers/productCtrl');

const { getCart, addToCart, deleteCart, modifyCartQuantity, deleteCartItem, } = require('../controllers/cartCtrl')

const {checkOut,OrderPlaced,orderDetails,orderPage,allOrderDetails,cancelOrder,returnOrder,useWallet}=require('../controllers/orderCtrl')

const { Wishlist, addToList, deleteWishlistItem }=require('../controllers/wishlistCtrl');

const { blockUser } = require('../controllers/admincntrl');

const {productSearch,CategoryFilter,filterSearch,colorFilter,priceFilter,brandFilter,clearFilter,sortByPrice,sizeFilter}=require('../controllers/filterCtrl')

const {addMoneyWallet,updateMongoWallet,sumWalletBuynow,sumWallet,walletPayment}=require('../controllers/walletCtrl')
const {validateCoupon}=require('../controllers/couponCtrl');




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
router.post('/updatePassword', updatePassword);
router.get('/emailForgot',emailForgot)
router.post('/changeUserPassword',changePassword)

// Blocked route
router.get('/blocked', (req, res) => {
    res.render('blocked');
  });





//User Profile

router.get('/profile',isLogged,userProfile)
router.post('/addProfilePic',isLogged,upload.single('image'),addProfilePic)
router.get('/editProfile',isLogged,editProfile)
router.post('/updateProfile',isLogged,updateProfile)

//User Address
router.get('/addAddressPage', auth.isLogged, processNewAddress); // Add this line for processing new addresses
router.post('/addUserAddress',isLogged,addUserAddress)
router.get('/editAddress',isLogged,editAddress)
router.post('updateAddress',isLogged,updateAddress)
router.get('/deleteAddress',isLogged,deleteAddress)
router.post('/processNewAddress',auth.isLogged,checkoutAddress)

//Products
router.get('/aProduct', upload.single('images'), aProductPage)
 router.get('/shop',shopProduct)

 //Cart
 router.get('/cart',isLogged,getCart)
 router.get('/addToCart',auth.isLogged,addToCart)
 router.get('/deleteCartItem',deleteCartItem)
 router.post('/modifyCartQuantity',auth.isLogged,modifyCartQuantity)
 router.get('/deleteCart',auth.isLogged,deleteCart)

 //Order
 router.get('/checkout',auth.isLogged,checkOut)
 router.post('/orderPlaced',auth.isLogged,OrderPlaced)
 router.get('/orderDetails',auth.isLogged,orderDetails)
 router.get('/orderPage',orderPage)
 router.get('/allOrderDetails',auth.isLogged,allOrderDetails)
 router.get('/cancelOrder',auth.isLogged,cancelOrder)
 router.get('/return',auth.isLogged,returnOrder)
 

//Wishlist
router.get('/Wishlist',auth.isLogged,Wishlist)
router.get('/addToList',auth.isLogged,addToList)
router.get('/deleteWishlistItem',auth.isLogged,deleteWishlistItem)

//Filter 

router.post('/productSearch',productSearch);
router.get('/CategoryFilter',CategoryFilter);
router.post('/filterSearch',filterSearch);
router.get('/priceFilter',priceFilter);
router.get('/brandFilter',brandFilter);
router.get('/sizeFilter',sizeFilter);
router.get('/clearFilter',clearFilter);//clear all the filter 
router.get('/sortByPrice',sortByPrice);
router.get('/colorFilter',colorFilter);


//Wallet 

router.post('/addMoneyWallet',isLogged,addMoneyWallet)
router.post('/updateMongoWallet',isLogged,updateMongoWallet)
router.post('/useWallet',isLogged,useWallet)
router.get('/sumWalletBuynow',isLogged,sumWalletBuynow)
router.post('/walletPayment',isLogged,walletPayment)
router.post('/sumWallet',sumWallet);



router.post('/validateCoupon',validateCoupon);





module.exports = router

