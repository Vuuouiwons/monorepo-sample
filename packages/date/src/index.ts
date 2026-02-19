// this is a mock function that returns the alleged end of world
export const dateNow = () => '12-12-2012';

import bcrypt from 'bcrypt';

export const managePassword = async () => {
    const password = 'mySuperSecretPassword123';
    const saltRounds = 6;

    // 1. Hashing (During Signup)
    // The salt is automatically generated and embedded in the hash string
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Verification (During Login)
    // bcrypt.compare extracts the salt from the hash to re-calculate and check
    const isMatch = await bcrypt.compare(password, hashedPassword);

    const isWrong = await bcrypt.compare('wrongPassword', hashedPassword);
    
    console.log(hashedPassword);

    return String(hashedPassword);
}