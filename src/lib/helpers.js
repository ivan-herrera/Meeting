const bcrypt = require('bcryptjs')

const helpers = {}

helpers.encryptPassword = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    const passEncrypted = await bcrypt.hash(pass, salt)
    return passEncrypted
}

helpers.matchPassword = async (pass, savedPass) => {
    try{
        return await bcrypt.compare(pass, savedPass)
    } catch(e){
        console.log(e)
    }
}

module.exports = helpers