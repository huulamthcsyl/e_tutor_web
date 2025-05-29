import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile } from "@/models/profile";

export const fetchProfiles = async (): Promise<Profile[]> => {
  try {
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs.map((doc) => doc.data()));

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Profile;
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw new Error("Không thể tải danh sách người dùng");
  }
};

export const fetchProfile = async (id: string): Promise<Profile> => {
  try {
    const profileRef = doc(db, "profiles", id);
    const profileDoc = await getDoc(profileRef);

    if (!profileDoc.exists()) {
      throw new Error("Không tìm thấy người dùng");
    }

    const data = profileDoc.data();
    return {
      id: profileDoc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as Profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Không thể tải thông tin người dùng");
  }
};

export const filterProfiles = (profiles: Profile[], searchTerm: string): Profile[] => {
  if (!searchTerm) return profiles;

  const searchLower = searchTerm.toLowerCase();
  return profiles.filter(
    (profile) =>
      profile.name?.toLowerCase().includes(searchLower) ||
      profile.phoneNumber?.toLowerCase().includes(searchLower)
  );
};

export const paginateProfiles = (
  profiles: Profile[],
  currentPage: number,
  itemsPerPage: number
): { paginatedProfiles: Profile[]; totalPages: number } => {
  const totalPages = Math.ceil(profiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = profiles.slice(startIndex, endIndex);

  return { paginatedProfiles, totalPages };
};

export const updateProfile = async (id: string, data: Partial<Profile>): Promise<Profile> => {
  try {
    const profileRef = doc(db, "profiles", id);
    const profileDoc = await getDoc(profileRef);

    if (!profileDoc.exists()) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Convert date string to Timestamp if birthDate is provided
    const updateData = {
      ...data,
      birthDate: data.birthDate ? Timestamp.fromDate(new Date(data.birthDate)) : undefined,
    };

    await updateDoc(profileRef, updateData);

    // Fetch and return the updated profile
    const updatedDoc = await getDoc(profileRef);
    if (!updatedDoc.exists()) {
      throw new Error("Không thể tải thông tin người dùng sau khi cập nhật");
    }

    const updatedData = updatedDoc.data();
    return {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData.createdAt instanceof Timestamp ? updatedData.createdAt.toDate().toISOString() : updatedData.createdAt,
    } as Profile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Không thể cập nhật thông tin người dùng");
  }
};

