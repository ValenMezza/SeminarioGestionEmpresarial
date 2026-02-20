const dbUsers = require('../store/dbUsers');

const loginController ={
    index:(req, res)=>{

        res.render('login/index')
    },
    createUser:(req,res)=>{
        res.render('login/create')
    },
postUser: (req, res) => {

    const { user, password } = req.body;  // ← extrae variables

    const newUser = { user, password };   // ← crea objeto nuevo

    console.log('User: ', user);
    console.log('Pass: ', password);

    dbUsers.push(newUser);

    return res.redirect('/');
}
}

module.exports=loginController;