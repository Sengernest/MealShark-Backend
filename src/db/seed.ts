import db from "./db"
import { UserPostData, usersTable } from "./schema"

const sampleUsers: UserPostData[] = [
  {
    name: "David Laid",
    email: "davidlaid@gymshark.com",
  }
]

export async function seedDb() {
  await db.insert(usersTable).values(sampleUsers)
}

seedDb()
