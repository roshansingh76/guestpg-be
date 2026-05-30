import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export const users = [
  {
    name: 'Super Admin',
    email: 'admin@flexiroomz.com',
    phone: '9999999999',
    password: 'Admin@123',
    role: 'super_admin',
    isActive: 1
  }
]

export async function hashSeedPasswords() {
  return Promise.all(users.map(async (user) => ({
    ...user,
    passwordHash: await bcrypt.hash(user.password, SALT_ROUNDS)
  })))
}
