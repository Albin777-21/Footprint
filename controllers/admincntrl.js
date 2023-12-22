const asyncHandler = require('express-async-handler')
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Order=require('../model/orderModel')
const Category=require('../model/categoryModel')


//admin login

const loginAdmin = asyncHandler(async(req,res)=>{
    try{
    res.render('login')
} catch(error) {
    console.log("login admin error",error);

}
}) 

//Load dashboard

const adminDashboard = asyncHandler(async (req,res) => {
   try {
    const products=await Product.find()
    // const orders=await Order.find({status:'delivered'})
    const category=await Category.find()
    const users=await User.find()

    
    const { filter } = req.query;

    let startDate, endDate;
    const currentDate = new Date();

    switch (filter) {
        case 'today':
            startDate = new Date(currentDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(currentDate);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'week':
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - currentDate.getDay()); // set to the first day of the week (Sunday)
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // set to the last day of the week (Saturday)
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'year':
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            endDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
            case 'custom':
                startDate = req.query.startDate ? new Date(req.query.startDate) : null;
                endDate = req.query.endDate ? new Date(req.query.endDate) : null;

                // Adjust the end date to the end of the selected day
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
            default:
                // Default to all data
                startDate = null;
                endDate = null;
                break;
    }

    const orders = await Order.find({
        status: 'delivered',
        createdOn: {
            $gte: startDate,
            $lt: endDate,
        },
    });
    
    
    const latestOrders=await Order.find().sort({createdOn:-1}).limit(5)
    


    const productCount=products.length
    const orderCount=orders.length
    const categoryCount=category.length

    const totalRevenue=orders.reduce((total,order)=>total+order.totalPrice,0)
    console.log("This is total Revenue",totalRevenue);

    //THIS IS FOR THE SALES GRAPH

    const monthlySales=await Order.aggregate([
        {
            $match:{
                status:'delivered',//Filter by status
            },
        },
        {
            $group:{
                _id:{
                    $month:'$createdOn',
                },
                count:{$sum:1},
            },
        },
        {
            $sort:{
                '_id':1,
            },
        },
    ])
    const monthlySalesArray=Array.from({length:12},(_,index)=>{
        const monthData=monthlySales.find((item)=>item._id===index+1)
        return monthData?monthData.count:0
    })

    //THIS IS FOR THE SALES GRAPH -END-

    //THIS IS FOR THE PRODUCT DATA
    const productsPerMonth=Array(12).fill(0)
    // ITERATE THROUGH EACH PRODUCT
    products.forEach(product=>{
        //EXTRACT MONTH FROM THE CREATED TIMESTAMP
        const creationMonth=product.createdAt.getMonth()
        //INCREMENT THE COUNT FOR THE CORRESPONDING MONTH
        productsPerMonth[creationMonth]++
    })
    //THIS IS FOR THEP PRODUCT DATA END
    res.render('dashboard',{totalRevenue,orderCount,productCount,categoryCount,monthlySalesArray,productsPerMonth,latestOrders,deliveredOrders:orders})
    
   } catch (error) {
    console.log('Error happens in the admin Ctrl admindashboard function',error);

    res.status(500).send('Internal server error')
    
   }
})

//admin verificaion

const adminVerifyLogin = asyncHandler(async(req,res)=>{
    try{
        const {email,password} = req.body
   
        //console.log(email)
    const findAdmin = await User.findOne({email,isAdmin:'1'}); 
    // console.log('admin data:',findAdmin);
    if(findAdmin && await findAdmin.isPasswordMatched(password)){
        req.session.Admin = true;
        res.redirect('/admin/dashboard')
    }   
    else{
        res.redirect('/admin/login')
    }
    } catch (error) {
        console.log("this is adminVerify error",error)
    }
});

// user page rendering and show details of all users

const userField = asyncHandler(async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) ||4;
        // Calculate the skip value to detemine
        const skip = (page - 1) *limit;
       
        const user = await User.find({isAdmin:{$ne:1}})
        .skip(skip)
        .limit(limit);
        //Get the total number of products in the database

        const totalProductsCount = await User.countDocuments();

        //Calculate the total number of pages based on the total products and limit
        const totalPages = Math.ceil(totalProductsCount / limit);
        res.render('users',{users:user,page,totalPages,limit});
        if(blockUser){
            res.redirect('/admin/user');
            return
        }
        } catch (error){
            console.log("user field error in dashboard",error);

        
         } }
)


//block user

const blockUser = asyncHandler(async(req,res)=>{
    try{
        const id = req.query.id;
        const blockedUser = await User.findByIdAndUpdate(id,{isBlocked:true},{new:true});
        if(blockedUser)
        {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("block user error");
    }
})

//unblock user

const unblockUser = asyncHandler(async (req,res)=>{
    try{
        const id = req.query.id;
        const unblockedUser = await User.findByIdAndUpdate(id,{isBlocked:false},{new:true});
        if(unblockedUser)
        {
            res.redirect('/admin/users');
        }
        } catch (error) {
            console.log("unblock user error",error);
    }
})

//logout admin
const logout = asyncHandler(async(req,res)=>{
    try{
        req.session.Admin = null;
        res.redirect('/admin/login')
    } catch (error) {
        console.log('Error hapens in admin controller at logout function',error);

    }
})


module.exports={
    adminDashboard,
    loginAdmin,
    adminVerifyLogin,
    userField,
    blockUser,
    unblockUser,
    logout
}