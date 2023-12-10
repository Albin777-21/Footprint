const asyncHandler=require('express-async-handler')
const Coupon=require('../model/couponModel');
const User=require('../model/userModel')





//LOAD COUPON

const loadCoupon=asyncHandler(async(req,res)=>{
    try {
        res.render('addCoupon')
        
    } catch (error) {
        console.log('Error happens in the coupon controller  function loadCoupon',error);
    }
});



//COUPON


const coupon=asyncHandler(async(req,res)=>{
    try {
        const coupon= await Coupon.find()
        



        const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(coupon.length / 5);
        const currentproduct = coupon.slice(startindex,endindex);

        res.render('coupon',{coupon,currentproduct, totalpages,currentpage})
        
    } catch (error) {
        console.log('Error happens in the coupon controller in the funCtion coupon',error);
        
    }
});


//ADD COUPON

const addCoupon = asyncHandler(async (req, res) => {
    try {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",req.body);
  
        
        if (!req.body.name || !req.body.description || !req.body.offerPrice) {
            throw new Error('Required fields are missing');
        }
  
        let customExpiryDate = new Date(req.body.expiryDate);
  
        
        if (isNaN(customExpiryDate.getTime())) {
          
            const currentMonth = new Date().getMonth();
            const newExpiryDate = new Date();
            newExpiryDate.setMonth(currentMonth + 1);
            customExpiryDate = newExpiryDate;
        }
  
        const coupon = new Coupon({
            name: req.body.name,
            description: req.body.description,
            offerPrice: req.body.offerPrice,
            minimumAmount: req.body.minimumAmount,
            createdOn: Date.now(),
            expiryDate: customExpiryDate,
        });
  
        const create = await coupon.save();
  
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log('Error happened in the coupon controller in the function addCoupon', error);
    }
  });


  //EDIT  COUPON


  const editCoupon=asyncHandler(async(req,res)=>{
    try {
        const id =req.query.id
        const coupon = await Coupon.findById(id)

        res.render('editCoupon',{coupon})
        
    } catch (error) {
        console.log('Error happens in the coupon controller in the fundction editCoupon',error);
        
    }
})

//UPDATE COUPON

const updateCoupon = asyncHandler(async (req, res) => {
    try {
      const id = req.body.id;
      const x = req.body;
     
      if (x.expiryDate) {
      
  
      
        const updatedCoupon = await Coupon.findByIdAndUpdate(
          id,
          {
            name: x.name,
            description: x.description,
            offerPrice: x.offerPrice,
            minimumAmount: x.minimumAmount,
            expiryDate: x.expiryDate,
          },
          { new: true }
        );
  
     
    
  
      
      } else {
       
        const updatedCoupon = await Coupon.findByIdAndUpdate(
          id,
          {
            name: x.name,
            description: x.description,
            offerPrice: x.offerPrice,
            minimumAmount: x.minimumAmount,
          },
          { new: true }
        );
  
       
      }
  
      res.redirect('/admin/coupon');
    } catch (error) {
      console.log('Error happenes in the coupon controller in the function editCoupon', error);
    }
  });


  //DELETE  COUPON

  const deleteCoupon=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id

        const coupon= await Coupon.findByIdAndDelete(id)



        res.redirect('/admin/coupon')



    } catch (error) {
        console.log('Error happens in the coupon controller in the function deleteCoupon',error);
        
    }
});





//VALIDATE COUPON
const validateCoupon = asyncHandler(async (req, res) => {
  try {
    const name = req.body.couponCode;

    // Query the database to find the coupon by its name
    const coupon = await Coupon.findOne({ name: name });

    if (!coupon) {
      // If no coupon with the provided name is found, send an error response
      return res.status(404).json({
        isValid: false,
        error: 'Coupon not found',
      });
    }

    const user = await User.findById(req.session.user);

    // Check if user has already used the coupon
    if (coupon.user.some(u => u.userId.toString() === user._id.toString())) {
      return res.status(400).json({
        isValid: false,
        error: 'You have already used this coupon',
      });
    }

    // If user hasn't used the coupon, add their ID to the coupon's user array
    coupon.user.push({ userId: user._id });
    await coupon.save();

    // Send a positive response with the coupon details
    res.status(200).json({
      isValid: true,
      coupon: coupon,
    });

  } catch (error) {
    console.log('Error happened in the coupon controller in the function validateCoupon', error);
    res.status(500).json({
      isValid: false,
      error: 'An error occurred while processing your request',
    });
  }
});




module.exports={
    loadCoupon,
    coupon,
    addCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
}