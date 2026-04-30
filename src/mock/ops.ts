export type OpsAccount = {
  id: string
  username: string
  email: string
}

export const opsAccounts: OpsAccount[] = [
  { id: 'op_anna', username: 'Anna Rivera', email: 'ops_anna@brand.ph' },
  { id: 'op_marco', username: 'Marco Santos', email: 'ops_marco@brand.ph' },
  { id: 'op_lisa', username: 'Lisa Cruz', email: 'ops_lisa@brand.ph' },
  { id: 'op_juan', username: 'Juan Reyes', email: 'ops_juan@brand.ph' },
]

export const currentUser = opsAccounts[0]
