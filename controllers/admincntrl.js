const asyncHandler = require('express-async-handler')
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Order = require('../model/orderModel')
const Category = require('../model/categoryModel')


//admin login

const loginAdmin = asyncHandler(async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log("login admin error", error);
        res.status(404).render("adminError");

    }
})

//Load dashboard

const adminDashboard = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find()
        // const orders=await Order.find({status:'delivered'})
        const category = await Category.find()
        const users = await User.find()


        const { filter } = req.query;


        console.log(filter,'this is filter query--------------');

        let startDate, endDate;
        let startDateFilter, endDateFilter;
        const currentDate = new Date();

        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

        // Set default values if filter is not present
        startDate = startOfYear;
        endDate = endOfYear;
        startDateFilter = startOfYear;
        endDateFilter = endOfYear;

        switch (filter) {
            case 'month':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
                console.log(startDate,endDate+"thisssssssssssssssssssss is si")
                break;
            case 'year':
                // No need to change startDate and endDate as they are already set
                break;
            case 'custom':
                const rawStartDate = req.query.startDate;
                const rawEndDate = req.query.endDate;

                if (rawStartDate && rawEndDate) {
                    // Parse the start and end dates
                    startDate = new Date(rawStartDate);
                    endDate = new Date(rawEndDate);

                    // Adjust the end date to the end of the selected day
                    endDate.setHours(23, 59, 59, 999);

                 
                    // Check if the custom date range is valid
                    if (startDate > endDate) {
                        throw new Error('Invalid custom date range');
                    }
                } else {
                    // Handle the case when startDate or endDate is not provided
                    // You might want to add error handling or default values here
                    startDate = startOfYear;
                    endDate = endOfYear;
                }
                break;
        }
       

   
        
    
    const orders = await Order.find({
           
        createdOn: {
            $gte: startDate,
            $lt: endDate,
        },
    });
    

        // Set default values for totalRevenue and orderCount
        const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0);
        const orderCount = orders.length;

        const latestOrders = await Order.find().sort({ createdOn: -1 }).limit(5)



        const productCount = products.length
        // const orderCount = orders.length
        const categoryCount = category.length

        // const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0)
        console.log("This is total Revenue", totalRevenue);

        //THIS IS FOR THE SALES GRAPH

        const monthlySales = await Order.aggregate([
            // {
            //     // $match: {
            //     //     status: 'delivered',//Filter by status
            //     // },
            // },
            {
                $group: {
                    _id: {
                        $month: '$createdOn',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ])

        // Calculate yearly sales
        const yearlySales = await Order.aggregate([
            {
                $match: {
                    // status: 'delivered',
                    createdOn: {
                        $gte: startOfYear,
                        $lt: endOfYear,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $month: '$createdOn',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);

        // Calculate custom date range sales
       // Calculate custom date range sales
       const customDateSales = await Order.aggregate([
        {
            $match: {
                // status: 'delivered',
                createdOn: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
            $group: {
                _id: {
                    $month: '$createdOn',
                },
                count: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' },
            },
        },
        {
            $sort: {
                '_id': 1,
            },
        },
    ]);
    
        const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySales.find((item) => item._id === index + 1)
            return monthData ? monthData.count : 0
        })
        console.log(monthlySalesArray,'this is the monthly salary ----------');

        const yearlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = yearlySales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });

        console.log('thsi is the yearly sales',yearlySalesArray);

// Calculate total revenue and order count for the custom date range
const customDateTotalRevenue = customDateSales.reduce((total, monthData) => total + monthData.totalRevenue, 0);


console.log('thsi is constum total date revenue',customDateTotalRevenue);

const customDateOrderCount = customDateSales.reduce((total, monthData) => total + monthData.count, 0);
console.log('this is the custem total order',customDateOrderCount);
const customDateSalesArray = Array.from({ length: 12 }, (_, index) => {
    const monthData = customDateSales.find((item) => item._id === index + 1);
    return monthData ? monthData.count : 0;
});


console.log('thsi is customDateSalesArray',customDateSalesArray);
        //THIS IS FOR THE SALES GRAPH -END-

        //THIS IS FOR THE PRODUCT DATA
        const productsPerMonth = Array(12).fill(0)
        // ITERATE THROUGH EACH PRODUCT
        products.forEach(product => {
            //EXTRACT MONTH FROM THE CREATED TIMESTAMP
            const creationMonth = product.createdAt.getMonth()
            //INCREMENT THE COUNT FOR THE CORRESPONDING MONTH
            productsPerMonth[creationMonth]++
        })

        console.log('this is the productsPerMonth ,',productsPerMonth);
        console.log("latest", latestOrders);
        //THIS IS FOR THEP PRODUCT DATA END

       
        res.render('dashboard', { totalRevenue,customDateOrderCount ,customDateTotalRevenue,startDateFilter,endDateFilter, orderCount, productCount, categoryCount, monthlySalesArray, yearlySalesArray, customDateSalesArray, productsPerMonth, latestOrders, deliveredOrders: orders,  })

    } catch (error) {
        console.log('Error happens in the admin Ctrl admindashboard function', error);

        res.status(404).render("adminError");

    }
})

//admin verificaion

const adminVerifyLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body

        //console.log(email)
        const findAdmin = await User.findOne({ email, isAdmin: '1' });
        // console.log('admin data:',findAdmin);
        if (findAdmin && await findAdmin.isPasswordMatched(password)) {
            req.session.Admin = true;
            res.redirect('/admin/dashboard')
        }
        else {
            res.status(404).render("adminError");
        }
    } catch (error) {
        console.log("this is adminVerify error", error)
        res.status(404).render("adminError");
    }
});

// user page rendering and show details of all users

const userField = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        // Calculate the skip value to detemine
        const skip = (page - 1) * limit;

        const user = await User.find({ isAdmin: { $ne: 1 } })
            .skip(skip)
            .limit(limit);
        //Get the total number of products in the database

        const totalProductsCount = await User.countDocuments();

        //Calculate the total number of pages based on the total products and limit
        const totalPages = Math.ceil(totalProductsCount / limit);
        res.render('users', { users: user, page, totalPages, limit });
        if (blockUser) {
            res.redirect('/admin/user');
            return
        }
    } catch (error) {
        console.log("user field error in dashboard", error);
        res.status(404).render("adminError");


    }
}
)


//block user

const blockUser = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        const blockedUser = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        if (blockedUser) {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("block user error");
        res.status(404).render("adminError");
    }
})

//unblock user

const unblockUser = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        const unblockedUser = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
        if (unblockedUser) {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log("unblock user error", error);
        res.status(404).render("adminError");
    }
})

//logout admin
const logout = asyncHandler(async (req, res) => {
    try {
        req.session.Admin = null;
        res.redirect('/admin/login')
    } catch (error) {
        console.log('Error hapens in admin controller at logout function', error);

    }
})


module.exports = {
    adminDashboard,
    loginAdmin,
    adminVerifyLogin,
    userField,
    blockUser,
    unblockUser,
    logout
}