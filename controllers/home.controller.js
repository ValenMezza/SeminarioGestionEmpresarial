const homeController = {
    index : (req,res)=>{
        res.render('home')
    },
    home: (req,res)=>{
        res.render('homeMsj')
    }

}

module.exports=homeController;