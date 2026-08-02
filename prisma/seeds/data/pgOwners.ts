import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export const pgOwners = [
  { name: 'Ramesh Kumar', email: 'pgowner1@flexiroomz.com', phone: '9800000001', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Suresh Yadav', email: 'pgowner2@flexiroomz.com', phone: '9800000002', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Anita Sharma', email: 'pgowner3@flexiroomz.com', phone: '9800000003', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Priya Singh', email: 'pgowner4@flexiroomz.com', phone: '9800000004', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Vikas Gupta', email: 'pgowner5@flexiroomz.com', phone: '9800000005', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Neha Verma', email: 'pgowner6@flexiroomz.com', phone: '9800000006', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Rajesh Mishra', email: 'pgowner7@flexiroomz.com', phone: '9800000007', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Kavita Joshi', email: 'pgowner8@flexiroomz.com', phone: '9800000008', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Manoj Tiwari', email: 'pgowner9@flexiroomz.com', phone: '9800000009', password: 'Owner@123', role: 'pg_owner', isActive: 1 },
  { name: 'Sunita Rawat', email: 'pgowner10@flexiroomz.com', phone: '9800000010', password: 'Owner@123', role: 'pg_owner', isActive: 1 }
]

export async function hashPgOwnerPasswords() {
  return Promise.all(pgOwners.map(async (owner) => ({
    ...owner,
    passwordHash: await bcrypt.hash(owner.password, SALT_ROUNDS)
  })))
}
