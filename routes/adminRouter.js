const express= require("express");
const router=express();
const {loginAdmin, adminDashboard,adminVerifyLogin, userField, blockUser, unblockUser,logout}=require('../controllers/admincntrl');
const { allCategory,addCategory,editCategory, deleteCategory,updateCategory,unlistCategory, listCategory } = require("../controllers/categoryctrl");
const {allProducts,addProduct,createProduct,editProduct,productEdited,unlistProduct,listProduct,deleteProduct,searchProduct}=require("../controllers/productCtrl");
const {adminOrderDetails,changeStatusCanceled,changeStatusConfirmed,changeStatusDelivered,changeStatusReturned,changeStatusShipped,changeStausPending,adminOrderList,allOrderDetails, loadsalesReport, salesReport}=require('../controllers/orderCtrl')
const {loadCoupon,addCoupon,coupon,editCoupon,deleteCoupon,updateCoupon}=require('../controllers/couponCtrl')
const{productOfferpage,updateOffer,categoryOffer,updateCategoryOffer}=require('../controllers/offerCtrl')
router.set('view engine','ejs'); 
router.set('views','./views/admin');
const {upload}=require('../multer/multer');

const { isAdminAuth,isLoggedout } = require("../middleware/adminauth");






//ADMIN ROUTE

router.get('/dashboard',isAdminAuth,adminDashboard);
router.get('/login',isLoggedout,loginAdmin);
router.post('/login',adminVerifyLogin);
router.get('/logout',logout);
router.get('/users',userField);
router.get('/block',blockUser);
router.get('/unblock',unblockUser);



//PRODUCT ROUTE

router.get('/product',isAdminAuth,allProducts);
router.get('/product/:page',isAdminAuth, allProducts);
router.get('/addProduct',isAdminAuth,addProduct);
router.post('/createProduct',isAdminAuth,upload.array('images', 12),createProduct);
router.get('/editProduct',isAdminAuth,editProduct);
router.post('/productEdited',isAdminAuth,upload.array('images', 12),productEdited);
router.get('/unlistProduct',isAdminAuth,unlistProduct);
router.get('/listProduct',isAdminAuth,listProduct);
router.get('/deleteProduct',isAdminAuth,deleteProduct);
router.post('/searchProduct',isAdminAuth,searchProduct);




//CATEGORY ROUTE

router.get('/category',isAdminAuth,allCategory)
router.post('/addCategory',isAdminAuth,upload.single('image'),addCategory);
router.get('/editCategory',isAdminAuth,editCategory);
router.post('/updateCategory',isAdminAuth,upload.single('image'),updateCategory);
router.get('/deleteCategory',isAdminAuth,deleteCategory);
router.get('/unlistCategory',isAdminAuth,unlistCategory);
router.get('/listCategory',isAdminAuth,listCategory);

//ORDER ROUTE

router.get('/adminOrderList',isAdminAuth,adminOrderList)
router.get('/adminOrderDetails',isAdminAuth,adminOrderDetails)
router.get('/changeStatusPending',isAdminAuth,changeStausPending)
router.get('/changeStatusConfirmed',isAdminAuth,changeStatusConfirmed)
router.get('/changeStatusShipped',isAdminAuth,changeStatusShipped)
router.get('/changeStatusCanceled',isAdminAuth,changeStatusCanceled)
router.get('/changeStatusDelivered',isAdminAuth,changeStatusDelivered)
router.get('/changeStatusReturned',isAdminAuth,changeStatusReturned)

//COUPON ROUTE


router.get('/addCoupon',isAdminAuth,loadCoupon);
router.post('/addCoupon',isAdminAuth,addCoupon);
router.get('/coupon',isAdminAuth,coupon);
router.get('/editCoupon',isAdminAuth,editCoupon);
router.post('/updateCoupon',isAdminAuth,updateCoupon);
router.get('/deleteCoupon',isAdminAuth,deleteCoupon);

//SALES REPORT

router.get('/loadsalesReport',isAdminAuth,loadsalesReport)
router.get('/salesReport',salesReport)


//OFFER 

router.get('/productOfferpage',isAdminAuth,productOfferpage)
router.post('/updateOffer',isAdminAuth,updateOffer)
router.get('/categoryOffer',isAdminAuth,categoryOffer)
router.post('/updateCategoryOffer',isAdminAuth,updateCategoryOffer)


module.exports=router;