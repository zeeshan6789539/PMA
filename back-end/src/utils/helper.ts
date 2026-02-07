// helper.ts
import bcrypt from 'bcryptjs';
import { SALT_ROUNDS, DEV_TEMP_PASSWORD, IS_DEVELOPMENT } from './constant.ts';

/**
 * Hash a plain text password using bcryptjs.
 */
export const gethashedpassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    // If in development, we override the input with our constant temp password
    const passwordToHash = IS_DEVELOPMENT ? DEV_TEMP_PASSWORD : password;

    return await bcrypt.hash(passwordToHash, salt);
};

/**
 * Compare a plain text password with its hash.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};