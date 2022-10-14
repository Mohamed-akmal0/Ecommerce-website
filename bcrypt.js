const db = require('./config/connection')
const collection = require('./config/collection')
const bcrypt = require('bcrypt')
const { response } = require('express')
module.exports={
    userSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password = await bcrypt.hash(userData.password,10)
            userData.blocked = false
            db.get().collection(collection.user_collection).insertOne(userData).then((data)=>{
                resolve(data)

            })
        })
    },

    userLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response={}
            let user = await db.get().collection(collection.user_collection).findOne({user:userData.username})
            if(user){
                if(user.blocked == 'true'){
                    resolve("blocked")
                }
                else{
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                            console.log('login success');
                        response.user = user
                        response.status = true
                        resolve(response)
                        }else{
                            console.log('login Failed');
                            resolve(false)
                        }   
                    })
                }
                }
                else{
                console.log('login Failed');
                resolve(false)
            }  
        })
    }
}
