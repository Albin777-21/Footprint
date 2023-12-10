const asynchandler=require('express-async-handler')
const Product=require('../model/productModel')
const Category=require('../model/categoryModel')
const User=require("../model/categoryModel")


//SEARCH IN HEADER BY CATEGORY

const filterSearch=asynchandler(async(req,res)=>{
    try {
        const product=await Product.find({isDeleted:false,
        $or:[
            {category:{$regex:`${req.body.search}`,$options:'i'}},
            {title:{$regex:`${req.body.search}`,$options:'i'}}
        ]})

        let cat;
        if(product.length>0){
            cat=product[0].category
            const itemsperpage=8
            const currentpage=parseInt(req.query.page)||1
            const startindex=(currentpage-1)*itemsperpage
            const endindex=startindex+itemsperpage
            const totalpages=Math.ceil(product.length/8)
            const currentproduct=product.slice(startindex,endindex)
            

            res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
        }else{
            const products=[]
            cat=''
            const itemsperpage=8
            const currentpage=parseInt(req.query.page)||1
            const startindex=(currentpage-1)*itemsperpage
            const endindex=startindex+itemsperpage
            const totalpages=Math.ceil(products.length/8)
            const currentproduct=products.slice(startindex,endindex)

            res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
        }
    } catch (error) {
        console.log('Error happens in the filter controll filrerSearch function',error);
        
    }
});

//FILTER BY SIZE

const sizeFilter=asynchandler(async(req,res)=>{
    try {
        const size=req.query.size
        const cat=req.query.cat

        const product=await Product.find({$and:[{size:size},{category:cat},{isDeleted:false}]})

        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
    } catch (error) {
        console.log('Error happens in the filter controll SizeFileter function',error);
        
    }
})

//FILTER BY COLOR

const colorFilter=asynchandler(async(req,res)=>{
    try {
        const color=req.query.color
        const cat=req.query.cat
        const product=await Product.find({$and:[{color:color},{category:cat}]})
        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})

    } catch (error) {
        console.log("Error happens in the filter controll colorFilter",error);
        
    }
});

//FILTER BY PRICE

const priceFilter=asynchandler(async(req,res)=>{
    try {
        const price=req.query.price
        const cat=req.query.cat
        const maxPrice=req.query.maxPrice
        const product=await Product.find({$and:[{price:{$gte:price}},{price:{$lte:maxPrice}},{category:cat}]})

        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
    } catch (error) {
        console.log("Error happens in the Filter controll prizeFilter function",error);
        
    }
});

//BRAND FILTER

const brandFilter=asynchandler(async(req,res)=>{
    try {
        const brand=req.query.brand
        const cat=req.query.cat
        const product=await Product.find({$and:[{brand:brand},{category:cat}]})
        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
    } catch (error) {
        console.log("Error happens in the filter controll brandFilter function",error
        );
        

    }
});

//CATEGORY FILTER

const CategoryFilter=asynchandler(async(req,res)=>{
    try {
        const category=req.query.category
        console.log(category)
        const product=await Product.find({category:category})
        const cat=category
        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
    } catch (error) {
        console.log("Error happens in the filter  control categorFilter function",error);
        
    }
});

//CLEAR FILTER AND SHOW ALL THE DATA

const clearFilter=asynchandler(async(req,res)=>{
    try {
        const product=await Product.find()
        const cat=''
        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)* itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
    } catch (error) {
        console.log("Error happens in the filter controll clearfilter function",error);
    }
});

//SORT BY PRICE

const sortByPrice=asynchandler(async(req,res)=>{
    try {
        const cat=req.query.cat
        const sort=req.query.sort
        let sortOrder;
        if(sort=='lowToHigh'){
            sortOrder=1
        }else{
            sortOrder=-1
        }

        let product=await Product.find({category:cat}).sort({price:sortOrder})

        const itemsperpage=8
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage,cat})
    } catch (error) {
        console.log('Error happens in the filter controll sortPrize function',error);
    }
});

//PRODUCT SEARCH

const productSearch=asynchandler(async(req,res)=>{
    try {
        const product=await Product.find({
            title:{$regex:`${req.body.search}`,$options:`i`}
        })
        const itemsperpage=6
        const currentpage=parseInt(req.query.page)||1
        const startindex=(currentpage-1)*itemsperpage
        const endindex=startindex+itemsperpage
        const totalpages=Math.ceil(product.length/8)
        const currentproduct=product.slice(startindex,endindex)
        res.render('filter',{product:currentproduct,totalpages,currentpage})
    } catch (error) {
        console.log("Error happens in the filtercontrol Product Search function",error);
        
    }
})

module.exports={
    filterSearch,
    sizeFilter,
    colorFilter,
    priceFilter,
    brandFilter,
    CategoryFilter,
    clearFilter,
    sortByPrice,
    productSearch



}