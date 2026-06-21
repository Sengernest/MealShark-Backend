import { Profile, User } from "../types";
import { usersRepository } from "../dataaccess/users";

function calculateAge(birthDate: string): number {
  const dob = new Date(birthDate);

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const hasHadBirthday =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() &&
      today.getDate() >= dob.getDate());

  if (!hasHadBirthday) age--;

  return age;
}
async function updateProfile(userId: number, profile: Profile): Promise<User> {
    let age: number | undefined;

    if (profile.birthDate) {
        age = calculateAge(profile.birthDate);
    }

    const updatedProfile = await usersRepository.updateProfile(userId, {
        ...profile,
        ...(age !== undefined && { age }),
    });

    return updatedProfile;
}

export const usersService = {
    updateProfile
};
