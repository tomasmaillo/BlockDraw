const firstNames = [
  'Alex',
  'Jamie',
  'Taylor',
  'Jordan',
  'Morgan',
  'Casey',
  'Riley',
  'Quinn',
]
const lastNames = [
  'Smith',
  'Johnson',
  'Brown',
  'Williams',
  'Jones',
  'Miller',
  'Davis',
  'Garcia',
]

export const generateRandomName = (): string => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${first} ${last}`
}
