const express= require("express");
const router=express();
const {loginAdmin, adminDashboard,adminVerifyLogin, userField, blockUser, unblockUser,logout}=require('../controllers/admincntrl');
const { allCategory,addCategory,editCategory, deleteCategory,updateCategory,unlistCategory, listCategory } = require("../controllers/categoryctrl");
const {allProducts,addProduct,createProduct,editProduct,productEdited,unlistProduct,listProduct,deleteProduct,searchProduct}=require("../controllers/productCtrl");
const {adminOrderDetails,changeStatusCanceled,changeStatusConfirmed,changeStatusDelivered,changeStatusReturned,changeStatusShipped,changeStausPending,adminOrderList,allOrderDetails}=require('../controllers/orderCtrl')
const {loadCoupon,addCoupon,coupon,editCoupon,deleteCoupon,updateCoupon}=require('../controllers/couponCtrl')
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

router.get('/product',allProducts);
router.get('/product/:page', allProducts);
router.get('/addProduct',addProduct);
router.post('/createProduct',upload.array('images', 12),createProduct);
router.get('/editProduct',editProduct);
router.post('/productEdited',upload.array('images', 12),productEdited);
router.get('/unlistProduct',unlistProduct);
router.get('/listProduct',listProduct);
router.get('/deleteProduct',deleteProduct);
router.post('/searchProduct',searchProduct);




//CATEGORY ROUTE

router.get('/category',allCategory)
router.post('/addCategory',upload.single('image'),addCategory);
router.get('/editCategory',editCategory);
router.post('/updateCategory',upload.single('image'),updateCategory);
router.get('/deleteCategory',deleteCategory);
router.get('/unlistCategory',unlistCategory);
router.get('/listCategory',listCategory);

//ORDER ROUTE

router.get('/adminOrderList',adminOrderList)
router.get('/adminOrderDetails',adminOrderDetails)
router.get('/changeStatusPending',changeStausPending)
router.get('/changeStatusConfirmed',changeStatusConfirmed)
router.get('/changeStatusShipped',changeStatusShipped)
router.get('/changeStatusCanceled',changeStatusCanceled)
router.get('/changeStatusDelivered',changeStatusDelivered)
router.get('/changeStatusReturned',changeStatusReturned)

//COUPON ROUTE


router.get('/addCoupon',isAdminAuth,loadCoupon);
router.post('/addCoupon',isAdminAuth,addCoupon);
router.get('/coupon',isAdminAuth,coupon);
router.get('/editCoupon',isAdminAuth,editCoupon);
router.post('/updateCoupon',isAdminAuth,updateCoupon);
router.get('/deleteCoupon',isAdminAuth,deleteCoupon);



module.exports=router;