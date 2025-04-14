const bcrypt = require('bcrypt');
const password = "@User123"; 
const hash = "$2b$10$G3kSDrPIXvFYEFpsbLhYguYnZ1.CPhldPUZMfyBFy98XE.QBQ3qG2"; 

console.log(bcrypt.compareSync(password, hash)); 
