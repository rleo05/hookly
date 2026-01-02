import { customAlphabet } from 'nanoid';

export const generateNanoId = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const nanoId = customAlphabet(alphabet, 28);
  return nanoId();
};
