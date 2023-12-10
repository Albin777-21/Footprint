const asyncHandler=require('express-async-handler')
const User=require('../model/userModel')
const Product=require('../model/productModel')
const Razorpay = require('razorpay')
const Coupon=require('../model/couponModel')


var instance=new Razorpay({key_id:process.env.RAZORPAY_KEYID, key_secret:process.env.RAZORPAY_SECRETKEY})

const razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEYID,
    key_secret:process.env.RAZORPAY_KEYID
});


//ADD MONEY TO WALLET

const addMoneyWallet=asyncHandler(async(req,res)=>{
    try {
        const amount=req.body.amount

        //GENERATE A UNIQUE ORDER ID FOR EACH TRANSACTION
        const orderId=generateUniqueOrderId();
        
        console.log('hiiiiiiiiillller======================',orderId);
        const generatedOrder=await generateOrderRazorpay(orderId,amount)

        console.log("This is generate waller order--------------------------------------------",generateOrderRazorpay);
        res.json({razorpayOrder:generatedOrder,status:true})
    } catch (error) {
        console.log("Error happens in the wallet controll(addMoneyWallet)",error);
        res.status(500).send({error:"Internal Server Error"})
        
    }
})

//GENERATING A UNIQUE ID FOR RAZORPAY

function generateUniqueOrderId(){
    const timestamp=Date.now();
    const uniqueId=Math.random().toString(36).substring(2,15)
    return `oreder_${timestamp}_${uniqueId}`

}

//RAZORPAY PAYMENT FUNCTION

const generateOrderRazorpay=(orderId,total)=>{
    return new Promise((resolve,reject)=>{
        const options={
            amount:total*100,
            currency:"INR",
            receipt:String(orderId)
        }
        instance.orders.create(options,function(err,order){
            if(err){
                console.log("Failed");
                console.log(err);
                reject(err)
            }else{
                console.log("Order Generated Razorpay:"+JSON.stringify(order));
                resolve(order)
            }
        })
    })
}

//UPDATE WALLET AMOUNT

const updateMongoWallet=asyncHandler(async(req,res)=>{
    try {
        const amount=parseFloat(req.body.amount)
        const userId=req.session.user

        const user=await User.findByIdAndUpdate(userId,{
            $inc:{'wallet':amount},
            $push:{
                "history":{
                    amount:amount,
                    status:"credit",
                    timestamp:Date.now()
                }
            }
        },{new:true})
        console.log("Updated user data",user);

        if(user){
            res.json({status:true})
        }else{
            res.json({err:"User Not Found"})
        }
    } catch (error) {
        console.log("Error Happens in the walletControll (updateMongoWallet)",error);
        res.status(500).json({message:"An Error Occured while updating the wallet",error})
        
    }
})

//SUM WALLET

const sumWallet=asyncHandler(async(req,res)=>{
    try {
        const coupon=await Coupon.find()
        console.log('save wallet');
        const id=req.session.user
        const user=await User.findById(id)
        const productIds=user.cart.map(cartItem=>cartItem.ProductId)
        const product=await Product.find({_id:{$in:productIds}})
        const transacation={
            amount:user.wallet,
            statur:'debit',
            timestamp:new Date(),
        };
        user.wallet =0
        user.history.push(transacation)
        
        let offer=0
        for(let j=0;j<product.length;j++){
            offer+=product[j].offerPrice
        }
        //push the transaction history to the user's history array

        await user.save()
        let sum=req.body.sum
        res.json({balance:sum})
        res.render('checkout',{user,product,sum,coupon,offer})

    } catch (error) {
        console.log("Error happens in the wallet controll (sumWallet)",error);
        res.status(500).send("Internal Server Error")
        
    }
})

//USE FULL AMOUNT IN AMOUNT IN WALLET AND AFTER THAT CHOSE A PAYING METHOD

const sumWalletBuynow=asyncHandler(async(req,res)=>{
    try {
        const coupon=await Coupon.find()
        const id= req.session.user
        const user=await User.findById(id)
        const product=await Product.findById(req.query.id)
        const offer=product.offerPrice
        console.log("This is product in buy now",product);
        const transaction={
            amount:user.wallet,
            status:'debit',
            timestamp:new Date(),

        }
        user.wallet=0
        user.history.push(transaction);

        await user.save()

        let sum = req.query.sum
        console.log('this is sum>>>>',sum);
       
        res.render('buyNow', { user, product, sum ,coupon,offer})
    } catch (error) {
        console.log('Error happens in the wallet controll(Sumwalletbuynow)',error);
        res.status(500).send('Internal Server Error')
        
    }
})

//FOR WALLET PAYMENT

const walletPayment=asyncHandler(async(req,res)=>{
    try {
        verifyOrderPayment(req.body)
        res.json({status:true})
    } catch (error) {
        console.log("Error Happens in the walletcontroll  (walletpayment)");
        res.status(500).send("Internal Server Error")
        
    }
})

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

module.exports={
    addMoneyWallet,
    updateMongoWallet,
    sumWallet,
    sumWalletBuynow,
    walletPayment



}
