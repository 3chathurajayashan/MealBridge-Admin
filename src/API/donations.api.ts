
const API_BASE_URL = "http://localhost:5001";

export interface DonationPerson {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: {
    url?: string | null;
    publicId?: string | null;
  };
}

export interface Donation {
  _id: string;
  foodName: string;
  description?: string;
  category: string;
  quantity: number;
  quantityUnit?: string;
  pickupAddress: string;
  pickupLocation?: {
    latitude?: number;
    longitude?: number;
  };
  foodImage?: {
    url?: string | null;
    publicId?: string | null;
  };
  availableFrom?: string;
  availableUntil?: string;
  status: string;
  donor?: DonationPerson | null;
  claimedBy?: DonationPerson | null;
  claimedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface DonationsResponse {
  success: boolean;
  count?: number;
  donations?: Donation[];
  message?: string;
  donationId?: string;
}

interface DonationActionResponse {
  success: boolean;
  message?: string;
  donationId?: string;
}

export const DonationsApi = {
  async getAllDonations(): Promise<Donation[]> {
    const token = localStorage.getItem("mealbridge-admin-token");

    if (!token) {
      throw new Error(
        "Your admin session has expired. Please sign in again."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/donations/all`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = (await response.json()) as DonationsResponse;

    if (!response.ok || !data.success) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "You are not authorized to view donations. Please sign in again."
        );
      }

      throw new Error(
        data.message || `Failed to load donations (${response.status})`
      );
    }

    return data.donations ?? [];
  },

  // DELETE DONATION
  async deleteDonation(donationId: string): Promise<void> {
    const token = localStorage.getItem("mealbridge-admin-token");

    if (!token) {
      throw new Error(
        "Your admin session has expired. Please sign in again."
      );
    }

    if (!donationId?.trim()) {
      throw new Error("A valid donation ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/donations/${encodeURIComponent(donationId)}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      (await response.json()) as DonationActionResponse;

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You are not authorized to delete this donation."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "Donation not found. It may have already been deleted."
        );
      }

      throw new Error(
        data.message ||
          `Failed to delete donation (${response.status})`
      );
    }
  },
};
