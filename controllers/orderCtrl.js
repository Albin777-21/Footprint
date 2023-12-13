const asyncHandler = require('express-async-handler')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Order = require('../model/orderModel')
const session = require('express-session')
const Razorpay=require('razorpay')
const Coupon=require('../model/couponModel')
const { log } = require('console')

var instance = new Razorpay({ key_id:process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_SECRETKEY })


//Checkout

const checkOut=asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user;
         req.session.lastUrl='checkout';
        const user=await User.findById(userId);
        const coupon = await Coupon.find({
            'user.userId': { $ne: user._id }
        });
        console.log('this is coupon ',coupon);
       const productId=user.cart.map(item=>item.ProductId);
        const product=await Product.find({_id:{$in:productId}});
       
        console.log('this is address ',user.address.length);
        console.log('this is address ',user.address);
  
        let sum = 0;
        for (let i = 0; i < user.cart.length; i++) {
            sum += user.cart[i].subTotal
        }
        sum = Math.round(sum * 100) / 100;
        console.log('product',product);
        res.render('checkout',{user,product,sum,coupon});
  
  
    } catch (error) {
        console.log("error in checkout function");
    }
  })
//Order Page

const orderPage = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        res.render('orderPage', { user })
    } catch (error) {
        console.log('Error form order Controll  in the form function OrderPage', error);

    }
})

//Order Placed

const OrderPlaced = asyncHandler(async (req, res) => {
    try {
        const { totalPrice, createdOn, date, payment, addressId } = req.body
        console.log(addressId, ">>>>>???");
        console.log('Recived Amount', totalPrice);
        const userId = req.session.user
        const user = await User.findById(userId)
        const productIds = user.cart.map(cartItem => cartItem.ProductId)


        const address = user.address.find(item => item._id.toString() === addressId)
        const productDetails = await Product.find({ _id: { $in: productIds } })

        const cartItemDetails = user.cart.map(cartItem => ({
            ProductId: cartItem.ProductId,
            quantity: cartItem.quantity,
            price: cartItem.price//Add the price of each product
        }))


        const orederedProducts = productDetails.map(product => ({
            ProductId: product._id,
            price: product.price,
            title: product.title,
            image: product.images[0],
            quantity: cartItemDetails.find(item => item.ProductId.toString() === product._id.toString()).quantity,




        }))

        const order = new Order({
            totalPrice: totalPrice,
            createdOn: createdOn,
            date: date,
            product: orederedProducts,
            userId: userId,
            payment: payment,
            address: address,
            status: 'pending'
        })
        const orderDb = await order.save()
        console.log('this is a order', orderDb);
        for (const orderedProduct of orederedProducts) {
            const product = await Product.findById(orderedProduct.ProductId)
            if (product) {
                console.log('this is product', product);
                const newQuantity = product.quantity - orderedProduct.quantity
                product.quantity = Math.max(newQuantity, 0)
                await product.save()
            }

        }
        if(order.payment=='cod'){
            orderDb.status='confirmed'
            await orderDb.save()
              console.log('yes iam the cod methord');
               res.json({ payment: true, method:"cod", order: orderDb ,qty:cartItemDetails,orderId:user});
        
            }
        
            else if(order.payment=='online'){
              console.log('yes iam the razorpay methord');
        
               const generatedOrder = await generateOrderRazorpay(orderDb._id, orderDb.totalPrice);
               console.log('this is the error in the razorpay ',generatedOrder);
               res.json({ payment: false, method: "online", razorpayOrder: generatedOrder, order: orderDb ,orderId:user,qty:cartItemDetails});
                           
            }
            else if(order.payment=='wallet'){
              const a=   user.wallet -= totalPrice;
                 const transaction = {
                     amount: a,
                     status: "debit",
                     timestamp: new Date(), // You can add a timestamp to the transaction
                 };
             
                 // Push the transaction into the user's history array
                 user.history.push(transaction);
        
               
        
                
                  await user.save();
         
                 
                 res.json({ payment: true, method: "wallet", });
                 
              }
    } catch (error) {
        console.log("Error From Form Order Control in the function OrderPlaced", error);

    }
});

//Order Details

const orderDetails = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId

        const userId = req.session.user
        const user = await User.findById(userId)
        const order = await Order.findById(orderId)

        res.render('orderDtls', { order, user })
    } catch (error) {
        console.log("Error Happens in OrderDetails Function");

    }
})

//All Order Details

const allOrderDetails = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const orders = await Order.find({ userId: userId }).sort({ createdOn: -1 });


        const itemsperpage = 10
        const currentPage = parseInt(req.query.page) || 1
        const startindex = (currentPage - 1) * itemsperpage
        const endindex = startindex + itemsperpage
        const totalpages = Math.ceil(orders.length / itemsperpage)
        const currentproduct = orders.slice(startindex, endindex)


        res.render('orderlist', { orders: currentproduct, totalpages, currentPage, user })
    } catch (error) {
        console.log('Error from orderCtrl in the function allOrderDetails', error);
        res.status(500).json({ status: false, error: 'Server error' });

    }
})

//Cancel Order

const cancelOrder = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findOne({ _id: userId })//Use FindOne  to Retrive a  single  user document

        if (!user) {
            return res.status(404).json({ message: 'Users not Found' })
        }

        const orderId = req.query.orderId
        const order = await Order.findByIdAndUpdate(orderId, {
            status: 'canceled'

        }, { new: true })

        if (!order) {
            return res.status(404).json({ message: 'Order Not Found' })
        }

        for (const productData of order.product) {
            const ProductId = productData.ProductId
            const quantity = productData.quantity

            const product = await Product.findById(ProductId)

            if (product) {
                product.quantity += quantity
                await product.save()
            }
        }
        res.redirect('/allOrderdetails')
    } catch (error) {
        console.log('Error occurred in cart ctrl in function cancelOrder', error);

        res.status(500).json({ message: 'Internal Server Error' });

    }
})

//Return Order

const returnOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const userId = req.session.user;


        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = await Order.findByIdAndUpdate(orderId, {
            status: 'returned'
        }, { new: true });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        user.wallet += order.totalPrice;


        const transaction = {
            amount: user.wallet,
            status: "credit",
            timestamp: new Date(), // You can add a timestamp to the transaction
        };

        user.history.push(transaction);
        await user.save();



        for (const productData of order.product) {
            const productId = productData.ProductId;
            const quantity = productData.quantity;

            // Find the corresponding product in the database
            const product = await Product.findById(productId);

            if (product) {
                product.quantity += quantity;
                await product.save();
            }
        }

        res.redirect('/allOrderDetails');
    } catch (error) {
        console.log('Error occurred in returnOrder function:', error);

        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//===============================================Admin Side==================================================================

//Admin orderList

const adminOrderList = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdOn: -1 });
        const itemsperpage = 5
        const currentpage = parseInt(req.query.page) || 1
        const startindex = (currentpage - 1) * itemsperpage
        const endindex = startindex + itemsperpage
        const totalpages = Math.ceil(orders.length /itemsperpage );
        const currentproduct = orders.slice(startindex, endindex)
        res.render('orderList', { orders: currentproduct, totalpages, currentpage })
    } catch (error) {
        console.log('error in orderList function', error);

    }
});

//Order details admin

const adminOrderDetails = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Order.findById(orderId)
        const userId = order.userId
        const user = await User.findById(userId)
        res.render('orderDetails', { user, order })
    } catch (error) {
        console.log('Error in adminOrder Details function', error);

    }
})
//stats pending

const changeStausPending = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.id
        const order = await Order.findByIdAndUpdate(orderId, { status: 'pending' }, { new: true })
        if (order) {
            res.json({ status: true })
        }

    } catch (error) {
        console.log('error in changeStatusPending function', error);

    }
})

//status confirmed

const changeStatusConfirmed = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Order.findByIdAndUpdate(orderId, { status: 'confirmed' }, { new: true })
        if (order) {
            res.json({ status: true })
        }
    } catch (error) {
        console.log('Error in change Status confirmed', error);

    }
})


//status shipped

const changeStatusShipped = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Order.findByIdAndUpdate(orderId, { status: 'shipped' }, { new: true })
        if (order) {
            res.json({ status: true })
        }

    } catch (error) {

        console.log('error status shipped function', error);
    }
})

//status canceled

const changeStatusCanceled=asyncHandler(async(req,res)=>{
    try {
      const orderId=req.query.orderId;
      const order=await Order.findByIdAndUpdate(orderId,{status:'canceled'},{new:true});
      if(order)
      {
        res.json({status:true});
      }
  
    } catch (error) {
      console.log("error in changestatusPending function",error);
    }
  });

//status delivered

const changeStatusDelivered=asyncHandler(async(req,res)=>{
    try {
      const orderId=req.query.orderId;
      const order=await Order.findByIdAndUpdate(orderId,{status: 'delivered'},{new:true});
      if(order)
      {
        res.json({status:true});
      }
  
    } catch (error) {
      console.log("error in changestatusPending function",error);
    }
  });
//status returned

const changeStatusReturned = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await Order.findByIdAndUpdate(orderId, { status: 'returned' }, { new: true })
        if (order) {
            res.json({ status: true })
        }
    } catch (error) {
        console.log('Error in the change Status Returned function', error);

    }
})

//When user click wallet use checking the current sum and reduce the wallet

const useWallet = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        if (user) {
            let a = req.body
            let sum = a.total - a.wallet
            res.json({ status: true, sum })
        }
    } catch (error) {
        console.log('Error in the UseWallet function', error);

    }
})



//RAZORPAY PAYMENT

const verifyPayment=asyncHandler(async(req,res)=>{
    try {
  
      console.log(req.body.order,"this is req.body");
      const ordr=req.body.order
       const order=await Order.findByIdAndUpdate(ordr._id,{
        status:"confirmed"
       })
       console.log('this is ther confirmed order  data',order);
        verifyOrderPayment(req.body)
        res.json({ status: true });
        
    } catch (error) {
        console.log('error happens in order ctrl in function verifyPayment',error); 
        
    }
  });


  //VERIFY THE PAYMENT RAZORPAY

  const verifyOrderPayment = (details) => {
    console.log("DETAILS : " + JSON.stringify(details));
    return new Promise((resolve, reject) => { 
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRETKEY)
        hmac.update(details.razorpay_order_id + '|' + details.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if (hmac == details.razorpay_signature) {
            console.log("Verify SUCCESS");
            resolve();
        } else {
            console.log("Verify FAILED");
            reject();
        }
    })
  };

  //GENERATE RAZORPAY

  const generateOrderRazorpay = (orderId, total) => {


    return new Promise((resolve, reject) => {
      
        const options = {
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed",err);
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
  }
  
  //BUYNOW

  const buyNow=asyncHandler(async(req,res)=>{
    try {
        const product=await Product.findById(req.query.id)
        if(product.quantity>=1){
            const id=req.session.user
            const user=await User.findById(id)
            const coupon=await Coupon.find({
                'user.userId':{$ne:user._id}
            })
            let sum=product.price
            res.render('buyNow',{user,product,sum,coupon})
        }else{
             res.redirect(`/aProduct?id=${product._id}`)
        }
    } catch (error) {
        console.log("Error Occured in orderctrl buyNow",error);
        res.status(500).send('Internal server error')
        
    }
  })

  //BUYNOW PLACE ORDER

  const buynowPlaceOrder=asyncHandler(async(req,res)=>{
    try {
        const{totalPrice,createdOn,date,payment,addressId,prId}=req.body
        const userId=req.session.user
        const user=await User.findById(userId)

        const address=user.address.find(item=>item._id.toString()===addressId)
        
        const productDetail=await Product.findById(prId)

        const productDetails={
            productId:productDetail._id,
            price:productDetail.price,
            title:productDetail.title,
            image:productDetail.images[0],
            quantity:1
        }

        const order=new Order({
            totalPrice:totalPrice,
            createdOn:createdOn,
            date:date,
            product:productDetail,
            userId:userId,
            payment:payment,
            address:address,
            status:'confirmed'

        })

        const orderDb=await order.save()

        productDetails.quantity=productDetails.quantity-1
        await productDetail.save()

        if(order.payment=='cod'){
            console.log("I am the cod method")
            res.json({payment:true,method:'cod',order:orderDb,qty:1,orderId:user})
        }else if(order.payment=='online'){
            console.log('I am the razor method')
            const generatedOrder=await generateOrderRazorpay(orderDb._id,orderDb.totalPrice)
            res.json({payment:true,method:"online",razorpayOrder:generatedOrder,order:orderDb,orderId:user,qty:1})
        }else if(order.payment=='wallet'){
            const a=user.wallet-=totalPrice;
            const  transaction={
                amount:a,
                status:'debit',
                timestamp:new Date(),
            }
            user.history.push(transaction)

            await user.save()
            res.json({payment:true,method:'wallet'})
        }
    } catch (error) {
        console.log("Error in the buynowOrderplaced function",error)
        res.status(500).send('Internal server error')
        
    }
  })








module.exports = {
    checkOut,
    orderPage,
    OrderPlaced,
    orderDetails,
    allOrderDetails,
    cancelOrder,
    returnOrder,

    adminOrderList,
    adminOrderDetails,
    changeStausPending,
    changeStatusConfirmed,
    changeStatusShipped,
    changeStatusCanceled,
    changeStatusDelivered,
    changeStatusReturned,

    useWallet,
    verifyPayment,
    buyNow,
    buynowPlaceOrder






}